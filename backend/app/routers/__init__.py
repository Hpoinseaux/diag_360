from fastapi import APIRouter

from . import health, reports, territories

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(territories.router)
api_router.include_router(reports.router)

__all__ = ["api_router"]
