#!/usr/bin/env python3
"""
Script pour alimenter `valeur_indicateur` avec les données CatNat (GASPAR).
Calcule le nombre de catastrophes naturelles par km² par EPCI.
"""
from __future__ import annotations

import argparse
import json
import logging
import os
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import sys
from typing import Iterable, Iterator  # ✅ Correction
import zipfile

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
CATNAT_URL = (
    "https://www.data.gouv.fr/api/1/datasets/r/d6fb9e18-b66b-499c-8284-46a3595579cc"
)
DEFAULT_INDICATOR_ID = "i158"
DEFAULT_YEAR = 2025  # Année fictive car indicateur cumulatif
DEFAULT_SOURCE = "https://www.data.gouv.fr/api/1/datasets/r/d6fb9e18-b66b-499c-8284-46a3595579cc"


@dataclass
class RawValue:
    epci_id: str
    indicator_id: str
    year: int
    value: float
    unit: str | None = None
    source: str | None = None
    meta: dict | None = None


def fetch_api_payload() -> tuple[pd.DataFrame, Path]:
    """Télécharge, extrait et retourne les données GASPAR + le chemin raw_dir."""
    base_dir = Path(__file__).resolve().parent.parent
    raw_dir = base_dir / "source"
    raw_dir.mkdir(parents=True, exist_ok=True)

    zip_path = raw_dir / "gaspar.zip"
    logger.info("Téléchargement des données GASPAR...")
    download_file(CATNAT_URL, dl_to=raw_dir, filename="gaspar.zip")
    
    # Extraction et nettoyage
    logger.info("Extraction et nettoyage...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        extracted_files = z.namelist()
        z.extractall(path=raw_dir)

    # Supprimer uniquement les fichiers extraits du ZIP (sauf catnat*.csv)
    for file in extracted_files:
        if not file.startswith("catnat"):
            file_path = raw_dir / file
            if file_path.exists() and file_path.is_file():
                file_path.unlink(missing_ok=True)
                logger.debug(f"Suppression de {file}")

    # Lire le CSV
    path_cat_nat = raw_dir / "catnat_gaspar.csv"
    if not path_cat_nat.exists():
        raise FileNotFoundError(f"Fichier {path_cat_nat} introuvable après extraction")
    
    df_cat_nat = pd.read_csv(path_cat_nat, sep=";", low_memory=False)
    logger.info(f"Chargé {len(df_cat_nat)} lignes de catastrophes naturelles")

    return df_cat_nat, raw_dir


def transform_payload(df_cat_nat: pd.DataFrame, raw_dir: Path, indicator_id: str, year: int) -> Iterator[RawValue]:
    """Calcule l'indicateur via DuckDB à partir des données."""
    
    # Récupération des référentiels via les fonctions utils
    df_com = create_dataframe_communes(raw_dir)
    df_epci_ref = create_dataframe_epci(raw_dir)

    query = """
    WITH cat_nat_counts AS (
        SELECT 
            cod_commune AS code_insee, 
            count(*) AS nb_cat_nat
        FROM df_cat_nat
        GROUP BY cod_commune
    ),
    epci_stats AS (
        SELECT 
            df_com.epci_code AS id_epci,
            SUM(cat_nat_counts.nb_cat_nat) AS nb_cat_nat_total,
            SUM(df_com.superficie_km2) AS superficie_epci_km2
        FROM df_com
        LEFT JOIN cat_nat_counts ON df_com.code_insee = cat_nat_counts.code_insee
        WHERE (df_com.superficie_km2 IS NOT NULL) AND (df_com.epci_code != 'ZZZZZZZZZ')
        GROUP BY df_com.epci_code
    )
    SELECT 
        id_epci,
        ROUND(nb_cat_nat_total / superficie_epci_km2, 3) AS valeur_brute
    FROM epci_stats
    WHERE nb_cat_nat_total IS NOT NULL
    """

    results = duckdb.sql(query).df()
    logger.info(f"Calculé {len(results)} valeurs d'indicateur")

    for _, row in results.iterrows():
        if pd.isna(row["valeur_brute"]):
            continue

        yield RawValue(
            epci_id=str(row["id_epci"]),
            indicator_id=indicator_id,
            year=year,
            value=float(row["valeur_brute"]),
            unit="nb_cat_nat/km2",
            source=DEFAULT_SOURCE,
            meta={"note": "Calculé sur l'historique total GASPAR"},
        )


def persist_values(session, rows: Iterable[RawValue]) -> int:
    """Persiste les valeurs en base de données."""
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


def run(indicator_id: str, year: int) -> None:
    """Exécution principale."""
    session = SessionLocal()
    try:
        ensure_indicator_exists(session, indicator_id)
        
        # Téléchargement et extraction
        df_cat_nat, raw_dir = fetch_api_payload()
        
        # Transformation
        rows = list(transform_payload(df_cat_nat, raw_dir, indicator_id=indicator_id, year=year))

        if not rows:
            logger.warning("Aucune donnée calculée.")
            return

        # Persistance
        count = persist_values(session, rows)
        logger.info(f"✅ {count} lignes traitées pour l'indicateur {indicator_id}")
    finally:
        session.close()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    parser = argparse.ArgumentParser(
        description="Import CatNat GASPAR -> valeur_indicateur"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="ID indicateur (ex: i158)",
    )
    parser.add_argument(
        "--year", type=int, default=DEFAULT_YEAR, help="Année de référence"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Affiche les résultats sans insérer"
    )

    args = parser.parse_args()

    if args.dry_run:
        df_cat_nat, raw_dir = fetch_api_payload()
        rows = list(
            transform_payload(df_cat_nat, raw_dir, indicator_id=args.indicator, year=args.year)
        )
        print(
            json.dumps(
                [row.__dict__ for row in rows[:10]], indent=2, ensure_ascii=False, default=str)
        )
        print(f"... (10 premières lignes sur {len(rows)})")
        return

    run(indicator_id=args.indicator, year=args.year)


if __name__ == "__main__":
    main()