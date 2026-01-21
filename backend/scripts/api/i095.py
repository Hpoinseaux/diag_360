#!/usr/bin/env python3
"""
Indicateur i095 : Nombre de lieux de médiation numérique par EPCI
Source : Data.gouv
URL : https://www.data.gouv.fr/api/1/datasets/r/398edc71-0d51-4cb6-9cbe-2540a4db573c

"""
from __future__ import annotations

import argparse
import json
import logging
from dataclasses import dataclass
from pathlib import Path
import sys
from typing import Iterable, Iterator  # ✅ Correction

import pandas as pd
import duckdb
from sqlalchemy import select

# Remonte de 3 niveaux : api/ -> scripts/ -> backend/
backend_path = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(backend_path))
from app.db import SessionLocal
from app.models import Indicator, IndicatorValue

# Import de vos fonctions utilitaires existantes
scripts_path = backend_path / "scripts"
sys.path.append(str(scripts_path))
from utils.functions import *

logger = logging.getLogger(__name__)

# Configuration
URL = "https://www.data.gouv.fr/api/1/datasets/r/398edc71-0d51-4cb6-9cbe-2540a4db573c"
DEFAULT_INDICATOR_ID = "i148"
DEFAULT_YEAR = 2024  # Année fictive car indicateur cumulatif
DEFAULT_SOURCE = (
    "Data.gouv.fr - Lieux de médiation numérique"
)


@dataclass
class RawValue:
    epci_id: str
    indicator_id: str
    year: int
    value: float
    unit: str | None = None
    source: str | None = None
    meta: dict | None = None


def get_raw_dir() -> Path:
    """Retourne le chemin du répertoire source, le crée si nécessaire."""
    base_dir = Path(__file__).resolve().parent.parent
    raw_dir = base_dir / "source"
    raw_dir.mkdir(parents=True, exist_ok=True)
    return raw_dir


def fetch_api_payload() -> pd.DataFrame:
    """Charge le fichier des urgences et retourne le DataFrame"""

    raw_dir = get_raw_dir()

    url = (
        "https://www.data.gouv.fr/api/1/datasets/r/398edc71-0d51-4cb6-9cbe-2540a4db573c"
    )

    # Télécharger et extraire les données médiation
    download_file(url, extract_to=raw_dir, filename="mediation_numerique.csv")
    path_file = raw_dir / "mediation_numerique.csv"

    logger.info("Téléchargement des données de médiation numérique")
    return pd.read_csv(path_file, low_memory=False)


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    raw_dir = get_raw_dir()

    # Télecharger les données communes
    df_com = create_dataframe_communes(raw_dir)

    # Création de df_epci
    df_epci = create_dataframe_epci(raw_dir)

    # On ne garde que les colonnes siren, nom_epci et dept
    query = """
    SELECT DISTINCT
        siren
    FROM df_epci
    """
    df_epci = duckdb.sql(query)

    # Regroupement par code_insee communes
    query = """ 
    SELECT 
        count(id) AS nb_mediation,
        code_insee
    FROM df_mediation_num
    GROUP BY code_insee
    """
    df_mediation_num_grouped = duckdb.sql(query)

    # Jointure des données
    query = """ 
    SELECT
        df_com.epci_code AS siren,
        SUM(df_mediation_num_grouped.nb_mediation) AS nb_mediation_epci,
        SUM(df_com.population) AS population_epci
    FROM df_com
    LEFT JOIN df_mediation_num_grouped
    ON df_com.code_insee = df_mediation_num_grouped.code_insee
    WHERE epci_code::VARCHAR NOT LIKE '%ZZZZ'
    GROUP BY df_com.epci_code
    """
    df_epci_mediation = duckdb.sql(query)

    # dataframe final avec le nombre de médiation numérique pour 10000 habitants
    query_bdd = """ 
    SELECT 
        e2.siren as id_epci,
        'i095' AS id_indicator,
        round(10000 * e1.nb_mediation_epci / e1.population_epci, 2) AS valeur_brute,
        '2026' AS annee
    FROM df_epci_mediation AS e1
    LEFT JOIN df_epci AS e2
    ON e1.siren = e2.siren
    ORDER BY e2.dept,e2.siren
    """

    return duckdb.sql(query).df()


def transform_payload(df: pd.DataFrame) -> Iterator[RawValue]:
    """Transforme le DataFrame en itérable de RawValue"""
    for _, row in df.iterrows():
        if pd.isna(row["valeur_brute"]):
            continue

        yield RawValue(
            epci_id=str(row["id_epci"]),
            indicator_id=str(row["id_indicator"]),
            year=str(row["annee"]),
            value=float(row["valeur_brute"]),
            unit="km",
            source=DEFAULT_SOURCE,
            meta={"raw": row.to_dict()},
        )


def persist_values(session, rows: Iterable[RawValue]) -> int:
    """Insérer ou mettre à jour les valeurs brutes."""
    inserted = 0
    for row in rows:
        record = IndicatorValue(
            epci_id=row.epci_id,
            indicator_id=row.indicator_id,
            year=row.year,
            value=row.value,
            unit=row.unit,
            source=row.source or DEFAULT_SOURCE,
            meta=row.meta or {},
        )
        session.merge(record)
        inserted += 1
    session.commit()
    logger.info(f"Commit de {inserted} valeurs en base")
    return inserted


def ensure_indicator_exists(session, indicator_id: str) -> None:
    """Vérifie que l'indicateur existe, sinon le crée."""
    exists = session.execute(
        select(Indicator.id).where(Indicator.id == indicator_id)
    ).scalar_one_or_none()
    if not exists:
        logger.warning(
            f"L'indicateur {indicator_id} n'existe pas en base. Création d'une entrée générique."
        )
        new_ind = Indicator(id=indicator_id, nom=f"Indicateur {indicator_id}")
        session.add(new_ind)
        session.commit()


def run(indicator_id: str) -> None:
    """Exécution principale."""
    session = SessionLocal()
    try:
        ensure_indicator_exists(session, indicator_id)

        # Téléchargement et extraction
        df = fetch_api_payload()
        df_processed = clean_and_prepare_df(df)

        # Transformation
        rows = list(transform_payload(df_processed))

        if not rows:
            logger.warning("Aucune donnée calculée.")
            return

        # Persistance
        count = persist_values(session, rows)
        logger.info(f"✅ {count} lignes traitées pour l'indicateur {indicator_id}")
    finally:
        session.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import des données des lieux de médiations numériques -> i095"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i095",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Affiche les résultats sans insérer"
    )
    return parser


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    parser = build_parser()
    args = parser.parse_args()

    if args.dry_run:
        df = fetch_api_payload()
        df_processed = clean_and_prepare_df(df)
        rows = list(transform_payload(df_processed))
        print(
            json.dumps(
                [row.__dict__ for row in rows[:10]],
                indent=2,
                ensure_ascii=False,
                default=str,
            )
        )
        print(f"... (10 premières lignes sur {len(rows)})")
        return

    run(indicator_id=args.indicator)


if __name__ == "__main__":
    main()
