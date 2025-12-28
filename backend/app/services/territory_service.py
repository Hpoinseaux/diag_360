from typing import List, Tuple

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.territory import Territory


def list_territories(
    db: Session,
    search: str | None = None,
    limit: int = 100,
    offset: int = 0,
    order_by: str = "name",
) -> Tuple[int, List[Territory]]:
    stmt = select(Territory)
    count_stmt = select(func.count()).select_from(Territory)

    if search:
        pattern = f"%{search.lower()}%"
        filter_clause = or_(
            func.lower(Territory.name).like(pattern),
            func.lower(Territory.code_siren).like(pattern),
        )
        stmt = stmt.where(filter_clause)
        count_stmt = count_stmt.where(filter_clause)

    order_column = {
        "score": Territory.score.desc(),
        "name": Territory.name.asc(),
        "code": Territory.code_siren.asc(),
    }.get(order_by, Territory.name.asc())

    stmt = stmt.order_by(order_column).offset(offset).limit(limit)

    total = db.execute(count_stmt).scalar_one()
    rows = db.execute(stmt).scalars().all()
    return total, rows


def search_territories(db: Session, term: str, limit: int = 8) -> List[Territory]:
    pattern = f"%{term.lower()}%"
    stmt = (
        select(Territory)
        .where(
            or_(
                func.lower(Territory.name).like(pattern),
                func.lower(Territory.code_siren).like(pattern),
            )
        )
        .order_by(Territory.name.asc())
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()


def get_territory_by_code(db: Session, code_siren: str) -> Territory | None:
    stmt = select(Territory).where(Territory.code_siren == code_siren)
    return db.execute(stmt).scalars().first()
