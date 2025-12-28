import argparse
import logging
from pathlib import Path
from typing import Dict, Iterable

import pandas as pd

from app.db import Base, SessionLocal, engine
from app.models import Territory  # noqa: F401  # ensure models are registered

logger = logging.getLogger("diag360.ingest")

# Mapping between Territory attributes and potential column names inside the Excel workbook.
COLUMN_ALIASES: Dict[str, Iterable[str]] = {
    "code_siren": ["code_siren", "siren", "codesiren", "code_epci"],
    "name": ["nom", "name", "libelle", "libepci"],
    "type": ["type", "nature", "nature_epci"],
    "population": ["population", "pop_total", "habitants"],
    "department": ["department", "departement", "dep"],
    "region": ["region", "reg"],
    "score": ["score_global", "score", "note"],
    "score_water": ["score_water", "bv1", "eau"],
    "score_food": ["score_food", "bv2", "alimentation"],
    "score_housing": ["score_housing", "bv3", "logement"],
    "score_healthcare": ["score_healthcare", "bv4", "sante"],
    "score_security": ["score_security", "bv5", "securite"],
    "score_education": ["score_education", "be1", "education"],
    "score_social_cohesion": ["score_social_cohesion", "be2", "cohesion"],
    "score_nature": ["score_nature", "be3", "nature"],
    "score_local_economy": ["score_local_economy", "bi1", "economie_locale"],
    "score_energy": ["score_energy", "bi2", "energie"],
    "score_mobility": ["score_mobility", "bi3", "mobilite"],
    "data_year": ["annee", "data_year", "year"],
}


def normalise_columns(columns: Iterable[str]) -> Dict[str, str]:
    lowered = {col.lower().strip(): col for col in columns}
    resolved = {}
    for attr, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in lowered:
                resolved[attr] = lowered[alias]
                break
    return resolved


def to_number(value):
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def ingest_dataframe(df: pd.DataFrame):
    resolved = normalise_columns(df.columns)
    missing = {"code_siren", "name"} - resolved.keys()
    if missing:
        raise ValueError(f"Colonnes requises introuvables: {', '.join(missing)}")

    session = SessionLocal()
    upserted = 0
    try:
        for _, row in df.iterrows():
            code_siren = str(row[resolved["code_siren"]]).strip()
            if not code_siren:
                continue

            territory = session.query(Territory).filter_by(code_siren=code_siren).first()
            if not territory:
                territory = Territory(code_siren=code_siren, name=str(row[resolved["name"]]).strip())
                session.add(territory)

            for attr, column in resolved.items():
                value = row[column]
                if attr in {"population", "data_year"}:
                    setattr(territory, attr, None if pd.isna(value) else int(value))
                elif attr.startswith("score") or attr == "score":
                    setattr(territory, attr, to_number(value))
                elif attr in {"name", "type", "department", "region"}:
                    setattr(territory, attr, None if pd.isna(value) else str(value).strip())

            upserted += 1

        session.commit()
        logger.info("Import terminé: %s enregistrements synchronisés.", upserted)
    finally:
        session.close()


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")

    parser = argparse.ArgumentParser(description="Ingestion Excel vers PostgreSQL (Diag360).")
    parser.add_argument("--file", required=True, help="Chemin vers le fichier XLSX (Diag360_EvolV2.xlsx).")
    parser.add_argument("--sheet", default=0, help="Nom ou index de l'onglet à importer (par défaut: 0).")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        raise FileNotFoundError(path)

    Base.metadata.create_all(bind=engine)

    df = pd.read_excel(path, sheet_name=args.sheet)
    ingest_dataframe(df)


if __name__ == "__main__":
    main()
