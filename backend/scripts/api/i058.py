#!/usr/bin/env python3
"""
Indicateur i058 : Nombre de kilomètres d'aménagements cyclables par km2 urbanisé
Source : Data.gouv.fr
URL : https://www.data.gouv.fr/api/1/datasets/r/f5d6ae97-b62e-46a7-ad5e-736c8084cee8

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
import geopandas as gpd
from shapely import wkb
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
URL = "https://www.data.gouv.fr/api/1/datasets/r/f5d6ae97-b62e-46a7-ad5e-736c8084cee8"
DEFAULT_INDICATOR_ID = "i058"
DEFAULT_YEAR = 2025  
DEFAULT_SOURCE = (
    "Data.gouv.fr"
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

def load_zone_urb() -> pd.DataFrame:
    """Charge le fichier des zones urbanisées et retourne le DataFrame"""

    raw_dir = get_raw_dir()


    # Lire le CSV
    path_file = raw_dir / "zone_urbanise.csv"
    if not path_file.exists():
        raise FileNotFoundError(
            f"Fichier {path_file} introuvable dans le dossier {raw_dir}"
        )
    logger.info("Téléchargement des données des zones urbanisées")
    return pd.read_csv(path_file, sep = ",")

def load_amenagement_cyclable() -> pd.DataFrame:
    """Charge le fichier des lieux de covoiturage et retourne le DataFrame"""

    raw_dir = get_raw_dir()

    # Chargement des données des aménagements cyclables
    url = (
        "https://www.data.gouv.fr/api/1/datasets/r/f5d6ae97-b62e-46a7-ad5e-736c8084cee8"
    )
    download_file(url, extract_to=raw_dir, filename="amenagement_cyclable.parquet")
    return pd.read_parquet(str(raw_dir / "amenagement_cyclable.parquet"))


def clean_and_prepare_df(df_zone_urb: pd.DataFrame, df_amenagement_cyclable: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    raw_dir = get_raw_dir()

    # Téléchargement des données epci pour jointure
    df_epci = create_dataframe_epci(raw_dir)

    # Traitement des données des zones urbaines
    df_zone_urb.drop("Unnamed: 6", axis=1, inplace=True)
    df_zone_urb.drop(
        "* Les donnes proviennent de Corine Land Cover millésime 2018",
        axis=1,
        inplace=True,
    )
    mapping = {
        "SIREN": "siren",
        "Nom de l'EPCI": "nom_epci",
        "Nature de l'EPCI": "nature_epci",
        "Superficie de l'EPCI (km²)": "superficie_epci",
        "Superficie des territoires artificialisés* (km²)": "superficie_artificialisee",
        "Part de la superficie artificialisée": "part_percent_superficie_artificialisee",
    }

    df_zone_urb.rename(columns=mapping, inplace=True)
    df_zone_urb["superficie_epci"] = (
        df_zone_urb["superficie_epci"].replace(",", ".", regex=True).astype(float)
    )
    df_zone_urb["superficie_artificialisee"] = (
        df_zone_urb["superficie_artificialisee"]
        .replace(",", ".", regex=True)
        .astype(float)
    )
    df_zone_urb["part_percent_superficie_artificialisee"] = (
        df_zone_urb["part_percent_superficie_artificialisee"]
        .replace(",", ".", regex=True)
        .replace(" %", "", regex=True)
        .astype(float)
    )

    #traitement des données des aménagements cyclables
    # 1. Charger l'extension sur l'instance par défaut de DuckDB
    duckdb.sql("INSTALL spatial;")
    duckdb.sql("LOAD spatial;")

    query = """
        SELECT * EXCLUDE (geometry), 
               ST_AsWKB(geometry) AS geometry 
        FROM df_amenagement_cyclable
        WHERE ST_GeometryType(geometry) IN ('LINESTRING', 'MULTILINESTRING')
    """

    df_amenagement_cyclable = duckdb.sql(query) 
    print(f"df_amenagement_cyclable.shape: {df_amenagement_cyclable.df().shape}")
    
    df_pandas = df_amenagement_cyclable.df()
    df_pandas['geometry'] = df_pandas['geometry'].apply(lambda x: wkb.loads(bytes(x)) if x else None)

    # 2. On crée le GeoDataFrame directement à partir du DF existant
    gdf = gpd.GeoDataFrame(df_pandas, geometry='geometry', crs="EPSG:4326")

    # 3. Calcul des kilomètres
    # On projette vers le système métrique (EPSG:2154 pour la France)
    # .length donne des mètres, on divise par 1000 pour les km
    gdf['distance_km'] = gdf.to_crs(epsg=2154).geometry.length / 1000

    df_temp_pandas = pd.DataFrame(gdf.drop(columns='geometry'))

    # Jointure des données des zones urbanisées avec les EPCI
    query = """
    SELECT
        DISTINCT epci.siren,
        zu.superficie_artificialisee,
    FROM df_epci epci
    LEFT JOIN df_zone_urb zu
    ON zu.siren = epci.siren
    """

    df_zone_urbanise_merged = duckdb.sql(query)

    # Amenagement cyclable par epci
    query = """
    WITH df_temp AS(
    SELECT 
        code_com_d AS code_insee,
        sum(distance_km) AS km_amenagements
    FROM df_temp_pandas
    GROUP BY code_com_d)
    
    SELECT  
        df_com.epci_code,
        sum(df_temp.km_amenagements) AS km_amenagements
    FROM df_com
    LEFT JOIN df_temp
    ON df_com.code_insee = df_temp.code_insee 
    WHERE df_com.epci_code != 'ZZZZZZZZZ'
    GROUP BY df_com.epci_code
    """
    df_amenagements_par_epci = duckdb.sql(query)

    # On merge les aménagements cyclables avec les zones urbanisées
    query_bdd = """ 
    SELECT 
        ape.epci_code AS id_epci,
        'i058' AS id_indicator,
        ROUND(ape.km_amenagements / zu.superficie_artificialisee,2) AS valeur_brute,
        '2025' AS annee
    FROM df_amenagements_par_epci ape
    LEFT JOIN df_zone_urbanise_merged zu
    ON ape.epci_code = zu.siren
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
        df_zone_urb = load_zone_urb()
        df_amenagement_cyclable = load_amenagement_cyclable()
        df_processed = clean_and_prepare_df(df_zone_urb, df_amenagement_cyclable)

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
        description=f"Import des données des zones urbanisées -> {DEFAULT_INDICATOR_ID}"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i058",
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
        df_zone_urb = load_zone_urb()
        df_amenagement_cyclable = load_amenagement_cyclable()
        df_processed = clean_and_prepare_df(df_zone_urb, df_amenagement_cyclable)
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
