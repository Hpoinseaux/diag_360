from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.report import FlashReportRequest, FlashReportResponse
from app.services import generate_flash_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/flash", response_model=FlashReportResponse, summary="Generate flash report")
def create_flash_report(payload: FlashReportRequest, db: Session = Depends(get_db)):
    try:
        return generate_flash_report(db=db, payload=payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
