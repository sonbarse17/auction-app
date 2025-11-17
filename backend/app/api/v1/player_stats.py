from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.repositories.player_stats_repo import PlayerStatsRepository
from app.core.database import get_db_pool
import asyncpg

router = APIRouter(prefix="/players", tags=["player-stats"])

class PlayerStatsData(BaseModel):
    stats_data: dict

@router.get("/{player_id}/stats")
async def get_player_stats(
    player_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = PlayerStatsRepository(pool)
    stats = await repo.get_player_stats(player_id)
    if not stats:
        return {"player_id": player_id, "stats_data": {}}
    return stats

@router.post("/{player_id}/stats")
async def create_or_update_stats(
    player_id: int,
    data: PlayerStatsData,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update stats")
    repo = PlayerStatsRepository(pool)
    stats = await repo.update_stats(player_id, data.stats_data)
    return stats
