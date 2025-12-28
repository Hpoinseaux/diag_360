import argparse
import logging
from typing import Optional

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models import IndicatorNeedLink, IndicatorScore, NeedScore

logger = logging.getLogger("diag360.compute_need_scores")


def compute_need_scores(session, data_year: str):
    logger.info("Recalcul des scores de besoins pour l’année %s", data_year)
    stmt = (
        select(
            IndicatorScore.epci_siren,
            IndicatorNeedLink.need_id,
            IndicatorNeedLink.need_label,
            IndicatorScore.data_year,
            func.avg(IndicatorScore.score).label("need_score"),
            func.count(func.distinct(IndicatorScore.indicator_id)).label("indicators_count"),
        )
        .join(IndicatorNeedLink, IndicatorNeedLink.indicator_id == IndicatorScore.indicator_id)
        .where(IndicatorScore.data_year == data_year)
        .group_by(
            IndicatorScore.epci_siren,
            IndicatorNeedLink.need_id,
            IndicatorNeedLink.need_label,
            IndicatorScore.data_year,
        )
    )

    results = session.execute(stmt).all()
    logger.info("Scores à mettre à jour : %s lignes", len(results))
    for epci_siren, need_id, need_label, year, need_score, indicators_count in results:
        record = NeedScore(
            epci_siren=epci_siren,
            need_id=need_id,
            data_year=year,
            need_label=need_label,
            need_score=need_score,
            indicators_count=indicators_count,
        )
        session.merge(record)
    session.commit()
    logger.info("Scores de besoins enregistrés.")


def main(argv: Optional[list[str]] = None):
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    parser = argparse.ArgumentParser(description="Calcule les scores par besoin à partir des scores indicateurs.")
    parser.add_argument("--data-year", default="0", help="Année des données à traiter (défaut: 0).")
    args = parser.parse_args(argv)

    session = SessionLocal()
    try:
        compute_need_scores(session, args.data_year)
    finally:
        session.close()


if __name__ == "__main__":
    main()
