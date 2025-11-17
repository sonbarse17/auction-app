from fastapi import APIRouter, Depends, Response
from app.core.auth import get_current_user
from app.services import export_service
from app.core.database import get_db_pool
import asyncpg

router = APIRouter(prefix="/exports", tags=["exports"])

@router.get("/teams/{team_id}/roster")
async def export_team_roster(
    team_id: int,
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    csv_data = await export_service.export_team_roster(team_id, auction_id, pool)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=team_{team_id}_roster.csv"}
    )

@router.get("/auctions/{auction_id}/transactions")
async def export_transactions(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    csv_data = await export_service.export_all_transactions(auction_id, pool)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=auction_{auction_id}_transactions.csv"}
    )

@router.get("/auctions/{auction_id}/players/{player_id}/bids")
async def export_bid_history(
    auction_id: int,
    player_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    csv_data = await export_service.export_bid_history(auction_id, player_id, pool)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=player_{player_id}_bids.csv"}
    )
