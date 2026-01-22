#!/usr/bin/env python3
"""
Indicateur i148 : Distance moyenne aux urgences la plus proche par EPCI
Source : Cartosanté
URL : https://cartosante.atlasante.fr/#c=indicator&f=7&i=prox_struct.dist_str&s=2024&t=A01&view=map12

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
URL = "https://cartosante.atlasante.fr/#c=indicator&f=7&i=prox_struct.dist_str&s=2024&t=A01&view=map12"
DEFAULT_INDICATOR_ID = "i148"
DEFAULT_YEAR = 2024  
DEFAULT_SOURCE = "i148.csv"


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

    # Lire le CSV
    path_file = raw_dir / DEFAULT_SOURCE
    if not path_file.exists():
        raise FileNotFoundError(
            f"Fichier {path_file} introuvable dans le dossier {raw_dir}"
        )
    logger.info("Téléchargement des données de urgences")
    return pd.read_csv(path_file, skiprows=2)


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    raw_dir = get_raw_dir()
    # Création du dataframe des communes (cf functions.py)
    df_com = create_dataframe_communes(raw_dir)

    # Changement des noms de colonnes
    mapping = {
        "Code": "code_insee",
        "Libellé": "nom_commune",
        "Distance à la structure la plus proche 2024": "dist_urgence_min",
    }

    df=df.rename(columns=mapping)

    # Jointure des données distance moyenne aux urgences
    query = """
    SELECT 
        DISTINCT epci_code as siren,
        ROUND(AVG(TRY_CAST(dist_urgence_min AS DOUBLE)),2) AS dist_urgence_moyenne_km
    FROM df_com
    LEFT JOIN df
    ON df_com.code_insee = df.code_insee
    WHERE epci_code != 'ZZZZZZZZZ'
    GROUP BY epci_code
    """

    df_dist_urg_moy = duckdb.sql(query)

    # Jointure des deux dataframes et du dataframe des epci
    query = """ 
    SELECT
        d.siren as id_epci,
        'i148' AS id_indicator,
        e.dist_urgence_moyenne_km as valeur_brute,
        '2024' AS annee
    FROM df_epci d
    LEFT JOIN df_dist_urg_moy e
    ON d.siren = e.siren
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
        description="Import des données de distance aux urgences -> i148"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i148",
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
