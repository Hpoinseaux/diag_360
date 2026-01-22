#!/usr/bin/env python3
"""
Indicateur i130 : Taux de couverture accueil jeune enfant pour 100 enfants de moins de 3 ans
Source : data.caf.fr
URL : https://data.caf.fr/api/explore/v2.1/catalog/datasets/txcouv_pe_epci_dev/records?limit=20&refine=annee%3A%222023%22

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
import requests
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
URL = "https://data.caf.fr/api/explore/v2.1/catalog/datasets/txcouv_pe_epci_dev/records?limit=20&refine=annee%3A%222023%22"
DEFAULT_INDICATOR_ID = "i130"
DEFAULT_YEAR = 2023  # Année fictive car indicateur cumulatif
DEFAULT_SOURCE = (
    "data.caf.fr"
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
    """Charge le fichier des lieux de covoiturage et retourne le DataFrame"""

    raw_dir = get_raw_dir()

    # Chargement des donnée via l'API
    # Define URLs and file paths
    offset = [100 * i for i in range(0, 13)]
    for offset in offset:
        url = f"https://data.caf.fr/api/explore/v2.1/catalog/datasets/txcouv_pe_epci/records?limit=100&offset={offset}&refine=annee%3A%222023%22"
        response = requests.get(url)
        r = response.json()
        df_pe = pd.json_normalize(r["results"])
        if offset == 0:
            df_pe_total = df_pe.copy()
        else:
            df_pe_total = pd.concat([df_pe_total, df_pe], ignore_index=True)

    df_pe_final = df_pe_total[["numepci", "txcouv_epci"]].copy()
    df_pe_final = df_pe_final.rename(
        columns={"numepci": "id_epci", "txcouv_epci": "valeur_brute"}
    )

    logger.info("Téléchargement des données du taux de couverture accueil jeune enfant")
    return df_pe_final


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    query_bdd = """
    SELECT
        id_epci,
        'i130' AS id_indicator,
        valeur_brute,
        '2023' AS annee
    FROM df_pe_final
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
            unit="nb pour 100 enfants de moins de 3 ans",
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
        description=f"Import des données du taux de couverture -> {DEFAULT_INDICATOR_ID}"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i130",
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
