import argparse
import logging
from typing import Optional

import httpx

from app.db import SessionLocal

logger = logging.getLogger("diag360.fetch_external_data")


def fetch_remote_json(url: str) -> dict:
    logger.info("Téléchargement %s", url)
    with httpx.Client(timeout=30) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.json()


def upsert_payload(session, payload: dict):
    """TODO: transformer payload en objets SQLAlchemy et les persister."""
    logger.info("Payload reçu (%s clés). Implémentez la persistance ici.", len(payload))
    # Exemple :
    # record = ExternalMetric(...)
    # session.merge(record)
    session.commit()


def main(argv: Optional[list[str]] = None):
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    parser = argparse.ArgumentParser(description="Récupère des données JSON externes et les écrit en base.")
    parser.add_argument("--url", required=True, help="Endpoint HTTP/HTTPS à appeler.")
    args = parser.parse_args(argv)

    payload = fetch_remote_json(args.url)
    session = SessionLocal()
    try:
        upsert_payload(session, payload)
    finally:
        session.close()


if __name__ == "__main__":
    main()
