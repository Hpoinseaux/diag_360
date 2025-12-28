from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import TerritoryDetail, TerritoryListResponse
from app.services import territory_service

router = APIRouter(prefix="/territories", tags=["territories"])


@router.get("", response_model=TerritoryListResponse, summary="List territories")
def list_territories(
    search: str | None = Query(default=None, min_length=2, description="Search by name or SIREN"),
    limit: int = Query(default=50, le=2000),
    offset: int = Query(default=0),
    order_by: str = Query(default="name", pattern="^(name|score|code)$"),
    db: Session = Depends(get_db),
):
    total, rows = territory_service.list_territories(
        db=db, search=search, limit=limit, offset=offset, order_by=order_by
    )
    return TerritoryListResponse(items=rows, total=total)


@router.get("/search", response_model=list[TerritoryDetail], summary="Search suggestions")
def search_territories(term: str = Query(min_length=2), limit: int = Query(default=8, le=20), db: Session = Depends(get_db)):
    return territory_service.search_territories(db=db, term=term, limit=limit)


@router.get("/{code_siren}", response_model=TerritoryDetail, summary="Retrieve territory")
def get_territory(code_siren: str, db: Session = Depends(get_db)):
    territory = territory_service.get_territory_by_code(db=db, code_siren=code_siren)
    if not territory:
        raise HTTPException(status_code=404, detail="Territory not found")
    return territory
