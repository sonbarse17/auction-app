from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.repositories.analytics_repo import AnalyticsRepository
from app.core.database import get_db_pool
import asyncpg

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/auctions/{auction_id}/summary")
async def get_auction_summary(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_auction_summary(auction_id)

@router.get("/auctions/{auction_id}/team-spending")
async def get_team_spending(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_team_spending(auction_id)

@router.get("/auctions/{auction_id}/top-players")
async def get_most_expensive_players(
    auction_id: int,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_most_expensive_players(auction_id, limit)

@router.get("/auctions/{auction_id}/position-spending")
async def get_position_spending(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_position_wise_spending(auction_id)

@router.get("/auctions/{auction_id}/bidding-activity")
async def get_bidding_activity(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_bidding_activity(auction_id)

@router.get("/teams/{team_id}/squad-composition")
async def get_squad_composition(
    team_id: int,
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_squad_composition(team_id, auction_id)

@router.get("/auctions/{auction_id}/unsold-players")
async def get_unsold_players(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AnalyticsRepository(pool)
    return await repo.get_unsold_players(auction_id)
