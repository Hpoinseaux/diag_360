#!/usr/bin/env python3
"""
Indicateur i096 : Nb_médias indépendants par département et par EPCI
Source : Ouest Médias et Monde Diplo
URL : https://www.ouestmedialab.fr/observatoire/cartographie-des-medias-locaux-en-france/ et https://www.monde-diplomatique.fr/cartes/PPA 
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
URL = "https://www.ouestmedialab.fr/observatoire/cartographie-des-medias-locaux-en-france/"
DEFAULT_INDICATOR_ID = "i096"
DEFAULT_YEAR = 2024  # Année fictive car indicateur cumulatif
DEFAULT_SOURCE = (
    "i096.txt"
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

def extraire_donnees_media():
    raw_dir = get_raw_dir()
    path_file = raw_dir / DEFAULT_SOURCE

    with open(path_file, "r", encoding="utf-8") as f:
        contenu = f.read()
    # 1. On récupère d'abord tout le texte entre les balises <a>...</a>
    # Le format est : <a href="#">Texte (Ville)</a>
    balises = re.findall(r'<a href="#">(.*?)</a>', contenu)
    data = []
    for item in balises:
        # 2. On sépare le nom de la ville
        # On cherche la DERNIÈRE parenthèse de la chaîne
        # (.*) -> Nom du média
        # \s -> espace
        # \(([^)]+)\)$ -> Contenu de la dernière parenthèse à la fin de la chaîne
        match = re.search(r"(.*)\s\(([^)]+)\)$", item)
        if match:
            nom_media = match.group(1).strip()
            ville = match.group(2).strip()
            data.append([nom_media, ville])
        else:
            # Cas de secours si le format est différent
            data.append([item, "Inconnue"])
    # 3. Création du DataFrame
    df = pd.DataFrame(data, columns=["Nom_media", "Ville"])
    return df

def fetch_medias_dependant() -> pd.DataFrame:
    """Télécharge le fichier des médias dépendants."""
    url_media_non_independants = "https://raw.githubusercontent.com/mdiplo/Medias_francais/refs/heads/master/medias.tsv"
    return pd.read_csv(url_media_non_independants, sep="\t", skiprows=2) , 


def clean_and_prepare_df(df_medias :pd.DataFrame, df_medias_non_independants: pd.DataFrame) -> pd.DataFrame:
    """Calcule l'indicateur via DuckDB à partir des données."""

    raw_dir = get_raw_dir()

    
    # Création du dataframe des communes (cf functions.py)
    df_com = create_dataframe_communes(raw_dir)

    ville_mapping = {
        "Bourg Les Valence": "Bourg-lès-Valence",
        "Charleville-Mézieres": "Charleville-Mézières",
        "Cherbourg": "Cherbourg-en-Cotentin",
        "Cherbourg-En-Cotentin": "Cherbourg-en-Cotentin",
        "Château du Loir": "Montval-sur-Loir",
        "Cierp Gaud": "Cierp-Gaud",
        "Digne les Bains": "Digne-les-Bains",
        "Echouboulains": "Échouboulains",
        "Inconnue": "Château-Chinon (Ville)",
        "SAINT-AIGNAN DE GRAND LIEU": "Saint-Aignan-Grandlieu",
        "Saint-Quentin-en-Yvelines": "Montigny-le-Bretonneux",
        "Sanary": "Sanary-sur-Mer",
        "St Philbert de Grand-Lieu": "Saint-Philbert-de-Grand-Lieu",
        "Vaux-Sur-Mer": "Vaux-sur-Mer",
        "la Seyne": "La Seyne-sur-Mer",
    }

    df_medias["Ville"] = df_medias["Ville"].replace(ville_mapping)

    # premiere jointure avec les communes
    query = """
    SELECT 
        code_insee,
        nom_standard,
        dep_code,
        epci_code,
        epci_nom,
        df_medias.Nom_media AS nom_media  
    FROM df_com  
    INNER JOIN df_medias
    ON df_com.nom_standard = df_medias.Ville
    ORDER BY dep_code, epci_code
    """

    df_result = duckdb.sql(query).df()

    # On supprime les doublons
    # Configuration des règles de filtrage
    # Format : "Ville": département_autorisé  OU  "Ville": fonction_spécifique
    RULES_CONFIG = {
        "Bailleul": "59",
        "Castres": "81",
        "Chaumont": "52",
        "Clamecy": "58",
        "Falaise": "14",
        "Flers": "61",
        "Fontaine": "38",
        "La Rochelle": "17",
        "Langon": "33",
        "Marmagne": "71",
        "Montreuil": "93",
        "Moulins": "03",
        "Olivet": "45",
        "Prades": "66",
        "Rochefort": "17",
        "Saint-Claude": "39",
        "Saint-Nazaire": "44",
        "Saint-Omer": "62",
        "Saint-Raphaël": "83",
        "Ussel": "19",
        "Verdun": "55",
        "Vernon": "27",
        # Cas complexes avec conditions multiples
        "Blanquefort": lambda r: r["dep_code"] == "33" and r["nom_media"] == "R.I.G",
        "Valence": lambda r: (
            (r["dep_code"] == "82" and r["nom_media"] in ["VFM", "La Dépêche du Midi"])
            or (
                r["dep_code"] == "26"
                and r["nom_media"] not in ["VFM", "La Dépêche du Midi"]
            )
        ),
    }

    def filter_logic(row):
        ville = row["nom_standard"]

        # Si la ville n'est pas dans le dictionnaire, on garde la ligne par défaut
        if ville not in RULES_CONFIG:
            return True

        regle = RULES_CONFIG[ville]

        # Si la règle est une fonction (cas complexes)
        if callable(regle):
            return regle(row)

        # Sinon, c'est une règle simple de département (comparaison directe)
        return row["dep_code"] == regle

    # Application du filtre en une seule ligne et suppression des doublons
    df_temp = df_result[df_result.apply(filter_logic, axis=1)].copy().drop_duplicates

    #On retire de df_temp les medias non indépendants
    df_final = df_temp[~df_temp["nom_media"].isin(df_medias_non_independants["Nom"])]

    query = """ 
    SELECT
        epci_code as id_epci,
        'i096' AS id_indicator,
        count(nom_media) AS valeur_brute,
        '2024' AS annee
    FROM df_final
    GROUP BY epci_code
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
            unit="nb_medias",
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
        df_medias = extraire_donnees_media()
        df_medias_non_independants = fetch_medias_dependant()
        df_processed = clean_and_prepare_df(df_medias, df_medias_non_independants)

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
        description="Import des données des médias-> i096"
    )
    parser.add_argument(
        "--indicator",
        default=DEFAULT_INDICATOR_ID,
        help="i096",
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
        # Téléchargement et extraction
        df_medias = extraire_donnees_media()
        df_medias_non_independants = fetch_medias_dependant()
        df_processed = clean_and_prepare_df(df_medias, df_medias_non_independants)
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
