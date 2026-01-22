#!/usr/bin/env python3
"""
Indicateur i113 : Part de la Surface Agricole Utile sur la superficie totale du territoire
Source : data.gouv.fr
URL : https://www.data.gouv.fr/api/1/datasets/r/dbdd3481-107b-4eed-b66a-7f9dda1c7b78

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
URL = "https://www.data.gouv.fr/api/1/datasets/r/dbdd3481-107b-4eed-b66a-7f9dda1c7b78"
DEFAULT_INDICATOR_ID = "i113"
DEFAULT_YEAR = 2025  
DEFAULT_SOURCE = (
    "data.gouv.fr"
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
    """Charge le fichier des données principales et retourne le DataFrame"""

    raw_dir = get_raw_dir()

    # Téléchagement de la table de la sau
    url = (
        "https://www.data.gouv.fr/api/1/datasets/r/022cb00f-38f2-4fe7-8895-e3467d3d9255"
    )
    download_file(url, extract_to=raw_dir, filename="sau_2025.csv")
    path_file = raw_dir / "sau_2025.csv"
    logger.info("Téléchargement des données des sau")
    return pd.read_csv(path_file, sep = ",")


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    raw_dir = get_raw_dir()
    # Téléchargement des données epci pour jointure
    df_epci = create_dataframe_epci(raw_dir)

    # Téléchargement de la table com
    df_com = create_dataframe_communes(raw_dir)

    # Traitement de la table sau
    df = df[df["date_mesure"].str.startswith("2020")]

    # Jointure entre df_sau et df_surface_epci
    query_bdd = """
    WITH df_surface_epci AS (
        SELECT 
            epci_code AS siren,
            SUM(superficie_km2) AS superficie_km2
        FROM df_com
        WHERE (superficie_km2 IS NOT NULL) AND (epci_code != 'ZZZZZZZZZ')
        GROUP BY epci_code),

    SELECT
        df_surface_epci.siren AS id_epci,
        'i113' AS id_indicator,
        ROUND((df_sau.valeur / 100) / df_surface_epci.superficie_km2 * 100,1) AS valeur_brute,
        '2025' AS annee
    FROM df_surface_epci
    LEFT JOIN df_sau
    ON df_sau.geocode_epci = df_surface_epci.siren
    """

    return duckdb.sql(query_bdd).df()


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
            unit="%",
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
        description=f"Import des données des SAU -> {DEFAULT_INDICATOR_ID}"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i149",
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
