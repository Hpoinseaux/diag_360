#!/usr/bin/env python3
"""
Indicateur i131 : Nombre d'associations pour 1000 habitants
Source : data.gouv.fr
URL : https://www.data.gouv.fr/api/1/datasets/r/c2334d19-c752-413f-b64b-38006d9d0513

"""
from __future__ import annotations

import argparse
import json
import logging
from dataclasses import dataclass
import os
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
URL = "https://www.data.gouv.fr/api/1/datasets/r/c2334d19-c752-413f-b64b-38006d9d0513"
DEFAULT_INDICATOR_ID = "i131"
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

def create_full(path_folder):
    """
    Lit tous les fichiers CSV d'un dossier, filtre certaines colonnes,
    concatène les résultats et supprime chaque fichier après lecture.

    Parameters
    ----------
    path_folder : str
        Chemin vers le dossier contenant les fichiers CSV.

    Returns
    -------
    pd.DataFrame
        DataFrame complet avec les colonnes 'adrs_codeinsee' et 'adrs_codepostal'
        pour les lignes où 'position' == 'A'.
    """
    df_full = pd.DataFrame()

    for file_name in os.listdir(path_folder):
        if file_name.endswith(".csv") and file_name.startswith("rna_waldec"):
            file_path = os.path.join(path_folder, file_name)

            # Lire le CSV
            df_temp = pd.read_csv(file_path, sep=";")
            print(f"Fichier lu : {file_path} avec {len(df_temp)} lignes.")
            df_temp = df_temp.loc[
                df_temp["position"] == "A"
            ]  # filtre les association en activité
            df_temp = df_temp[["adrs_codeinsee", "adrs_codepostal"]]

            # Concaténer dans le DataFrame complet
            df_full = pd.concat([df_full, df_temp], ignore_index=True, axis=0)

            # Supprimer le fichier après lecture
            os.remove(file_path)

    print(f"Dataframe complet créé.")
    return df_full

def fetch_api_payload() -> pd.DataFrame:
    """Charge le fichier des associations et retourne le DataFrame"""

    raw_dir = get_raw_dir()

    zip_url = "https://www.data.gouv.fr/api/1/datasets/r/c2334d19-c752-413f-b64b-38006d9d0513"
    filename_asso = "data_asso.zip"

    # Download and extract the zip file
    download_file(zip_url, extract_to=raw_dir, filename=filename_asso)
    with zipfile.ZipFile(str(raw_dir / filename_asso), "r") as z:
        z.extractall(extract_to=raw_dir)

    # Create full dataframe from extracted CSV files
    df = create_full(path_folder=raw_dir)
    logger.info("Téléchargement des données du nombre de lieux de covoiturage")
    return df


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    raw_dir = get_raw_dir()

    # Homogenize NaN values
    df_asso_cleaned = homogene_nan(df).reset_index(drop=True)

    # Correction des nan
    df_nan = df_asso_cleaned.loc[
        df_asso_cleaned[["adrs_codeinsee", "adrs_codepostal"]].isna().any(axis=1)
    ]
    df_sans_nan = df_asso_cleaned.dropna().reset_index(drop=True)
    df_nan_postal = df_nan.loc[df_nan["adrs_codepostal"].isna()]

    # Création de la table duckdb pour les jointures
    df_com = create_dataframe_communes(raw_dir)

    # Récupération des codes postaux manquants via jointure avec df_com
    query = """ 
        SELECT 
            DISTINCT e1.adrs_codeinsee, 
            e2.code_insee, 
            e2.code_postal
        FROM df_nan_postal e1
        LEFT JOIN df_com e2
        ON (e1.adrs_codeinsee = e2.code_insee)
        ORDER BY e1.adrs_codeinsee
        """
    df_sans_nan_postal = duckdb.sql(query).df().dropna()
    df_sans_nan_postal = df_sans_nan_postal[["adrs_codeinsee", "code_postal"]]
    df_sans_nan_postal.rename(columns={"code_postal": "adrs_codepostal"}, inplace=True)

    # Combinaison des deux dataframes pour obtenir le dataframe complet
    df_asso_complete = (
        pd.concat(
            [df_sans_nan[["adrs_codeinsee", "adrs_codepostal"]], df_sans_nan_postal],
            ignore_index=True,
            axis=0,
        )
        .sort_values(["adrs_codeinsee", "adrs_codepostal"])
        .dropna()
        .reset_index(drop=True)
    )

    # Création de la table duckdb pour les jointures avec les epci
    df_epci = create_dataframe_epci(raw_dir)

    query = """
        SELECT 
            e2.siren,
            REPLACE(e2.total_pop_tot, ' ', '') AS population,
            COUNT(DISTINCT e1.id_asso) AS nb_asso
        FROM df_epci e2
        LEFT JOIN df_asso_complete e1
            ON e1.adrs_codeinsee = e2.insee
        GROUP BY 
            e2.siren,
            e2.total_pop_tot
        """
    
    df_asso_epci = duckdb.sql(query).df().dropna()

    query_bdd = """ 
        SELECT 
            siren as id_epci, 
            'i131' AS id_indicator,
            round(1.0*TRY_CAST(nb_asso AS DOUBLE) / TRY_CAST(population AS DOUBLE) * 1000,2) as valeur_brute,
            '2025' AS annee
        FROM df_asso_epci
        ORDER BY siren
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
            unit="nb_asso/1000_habitants",
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
        description=f"Import des données du nombre d'associations -> {DEFAULT_INDICATOR_ID}"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i131",
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
