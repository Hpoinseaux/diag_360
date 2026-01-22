#!/usr/bin/env python3
"""
Indicateur i066 : Densité de pharmacies pour 10 000 habitants par EPCI

Source : data.gouv.fr
URL : https://www.data.gouv.fr/datasets/finess-extraction-du-fichier-des-etablissements
Dernières données disponibles : 2026
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
URL = "https://www.data.gouv.fr/api/1/datasets/r/2ce43ade-8d2c-4d1d-81da-ca06c82abc68"
DEFAULT_INDICATOR_ID = "i066"
DEFAULT_YEAR = 2025  # Année fictive car indicateur cumulatif
DEFAULT_SOURCE = (
    "https://www.data.gouv.fr/api/1/datasets/r/2ce43ade-8d2c-4d1d-81da-ca06c82abc68"
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


def fetch_raw_csv() -> pd.DataFrame:
    """Télécharge le fichier des pharmacies et retourne le DataFrame"""
    raw_dir = get_raw_dir()
    logger.info("Téléchargement des données de pharmacies")
    download_file(URL, dl_to=raw_dir, filename="pharmacies.csv")

    # Lire le CSV
    path_file = raw_dir / "pharmacies.csv"
    if not path_file.exists():
        raise FileNotFoundError(f"Fichier {path_file} introuvable après téléchargement")

    return pd.read_csv(path_file, sep=";", low_memory=False)


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    raw_dir = get_raw_dir()
    # Chargement de la table epci
    df_epci = create_dataframe_epci(raw_dir)

    # Chargement de la table des communes
    df_com = create_dataframe_communes(raw_dir)

    # Traitement des données de pharmacies
    df = df.iloc[:, [15, 19]]
    df.rename(columns={19: "type", 15: "code_insee"}, inplace=True)
    df = df.loc[df["type"].str.startswith("Phar")].reset_index(drop=True)

    def extract_code_postal(x):
        """Extrait le code postal depuis le champ code_insee."""
        if pd.isna(x):
            return None
        try:
            x_str = str(x).strip()
            if " " in x_str:
                return x_str.split(" ")[0]
            return x_str
        except Exception:
            return None

    df["code_postal"] = df["code_insee"].apply(extract_code_postal)

    df.drop(columns=["code_insee"], inplace=True)

    # Jointure avec les données des communes pour récupérer le nombre de pharma par commune
    query = """
    SELECT
        df_com.epci_code AS id_epci,
        'i066' AS id_indicator,
        COUNT(df.code_postal) AS valeur_brute,
        '2025' AS annee
    FROM df
    LEFT JOIN df_com
        ON df.code_postal = df_com.code_postal
    GROUP BY id_epci
    HAVING id_epci != 'ZZZZZZZZZ'
    """

    result = duckdb.sql(query).df()

    # On garde la population totale des epci
    query = """ 
    SELECT 
        DISTINCT siren, 
        TRY_CAST(REPLACE(total_pop_tot,' ','') AS INTEGER) as total_pop 
        FROM df_epci
    """
    df_epci_pop_tot = duckdb.sql(query)

    # Calcul du nombre de pharmacie pour 10000 habitants
    query_final = """
    SELECT 
        result.id_epci,
        result.id_indicator,
        ROUND((result.valeur_brute/ df_epci_pop_tot.total_pop) * 10000, 2) AS valeur_brute,
        result.annee
    FROM df_epci_pop_tot
    LEFT JOIN result 
    ON result.id_epci = df_epci_pop_tot.siren
    WHERE result.id_epci IS NOT NULL
    """

    return duckdb.sql(query_final).df()


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
            unit="nb_pharmacies/10000hab",
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

        # Téléchargement, extraction et nettoyage des données
        df = fetch_raw_csv()
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
    parser = argparse.ArgumentParser(description="Téléchargement de données -> i066")
    parser.add_argument("--indicator", default=DEFAULT_INDICATOR_ID, help="i066")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="N'insère rien en base, affiche seulement les lignes qui seraient importées.",
    )
    return parser


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    parser = build_parser()
    args = parser.parse_args()

    if args.dry_run:
        df = fetch_raw_csv()
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
