# Adaptation du template API existant pour une source CSV
# Objectif : faciliter la généralisation à d'autres indicateurs non-APIs

"""
Indicateur i032 : Part des logements en situation de sur-occupation

Source : observatoire des territoires
URL : https://www.observatoire-des-territoires.gouv.fr/outils/cartographie-interactive/#c=indicator&i=surocc_hstud.tx_hstu1p_surocc&s=2021&view=map78  
Dernières données disponibles : 2021  

maj script : 15/01/2026
"""

from __future__ import annotations

import argparse
import json
import logging
from dataclasses import dataclass
from typing import Iterable, Iterator

from pathlib import Path
import pandas as pd 

from sqlalchemy import select

from app.db import SessionLocal
from app.models import Indicator, IndicatorValue


logger = logging.getLogger(__name__)


@dataclass
class RawValue:
    epci_id: str
    indicator_id: str
    year: int
    value: float
    unit: str | None = None
    source: str | None = None
    meta: dict | None = None


def fetch_raw_csv(filename: str, sep=";", header=2) -> pd.DataFrame:
    script_dir = Path(__file__).parent      # scripts/api/
    csv_path = script_dir.parent / "source" / filename  # scripts/source/i032.csv
    return pd.read_csv(csv_path, sep=sep, header=header)


def clean_and_prepare_df(df: pd.DataFrame) -> pd.DataFrame:
    df = (df.rename(
            columns={"Code": "epci_id",
                    "Part des logements sur-occupés hors studios d'une seule personne 2021": "value",})
        .drop(columns=["Libellé"])
        )

    df["indicator_id"] = "i032"
    df["year"] = 2021
    df["unit"] = None
    df["source"] = "Observatoire des territoires"

    return df


def transform_df_to_raw_values(df: pd.DataFrame) -> Iterator[RawValue]:
    for _, row in df.iterrows():
        try:
            value = float(row["value"])
        except (ValueError, TypeError):
            continue

        yield RawValue(
            epci_id=str(row["epci_id"]),
            indicator_id=row["indicator_id"],
            year=int(row["year"]),
            value=value,
            unit=str(row["unit"]),
            source=row["source"],
            meta={}
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
            source=row.source,
            meta=row.meta or {},
        )
        session.merge(record)
        inserted += 1
    session.commit()
    return inserted


def ensure_indicator_exists(session, indicator_id: str) -> None:
    """Optionnel : vérifier que l'indicateur ciblé existe côté base."""

    exists = session.execute(select(Indicator.id).where(Indicator.id == indicator_id)).scalar_one_or_none()
    if not exists:
        raise ValueError(f"L'indicateur {indicator_id} est introuvable en base. Importez d'abord la table de référence.")


def run(csv_filename: str) -> None:
    session = SessionLocal()
    try:
        ensure_indicator_exists(session, "i032") # adapter avec l'indicateur_id
        df = fetch_raw_csv(csv_filename)
        df = clean_and_prepare_df(df)
        rows = list(transform_df_to_raw_values(df))
        if not rows:
            logger.warning("Aucune ligne à insérer")
            return
        count = persist_values(session, rows)
        logger.info("%s lignes upsertées dans valeur_indicateur", count)
    finally:
        session.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description= "Import CSV -> valeur_indicateur (indicateur i032)") # "Import CSV -> valeur_indicateur"
    parser.add_argument("--csv", default= "i032.csv", help= "Nom du fichier CSV à importer (dans scripts/source/)",) # adapter le default
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
        df = fetch_raw_csv(args.csv)
        df = clean_and_prepare_df(df)
        rows = list(transform_df_to_raw_values(df))
        print(json.dumps([row.__dict__ for row in rows], indent=2, ensure_ascii=False))
        return

    run(args.csv)


if __name__ == "__main__":
    main()
