from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.repositories.multi_auction_repo import MultiAuctionRepository
from app.core.database import get_db_pool
import asyncpg

router = APIRouter(prefix="/multi-auction", tags=["multi-auction"])

class CloneAuctionRequest(BaseModel):
    auction_id: int
    new_name: str
    tournament_id: int

@router.get("/overview")
async def get_auctions_overview(
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = MultiAuctionRepository(pool)
    return await repo.get_all_auctions_overview()

@router.post("/clone")
async def clone_auction(
    data: CloneAuctionRequest,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    repo = MultiAuctionRepository(pool)
    return await repo.clone_auction(data.auction_id, data.new_name, data.tournament_id)

@router.get("/active-count")
async def get_active_count(
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = MultiAuctionRepository(pool)
    count = await repo.get_active_auctions_count()
    return {"active_count": count}
