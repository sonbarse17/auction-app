from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from app.core.auth import get_current_user
from app.repositories.auto_bid_repo import AutoBidRepository
from app.core.database import get_db_pool
import asyncpg

router = APIRouter(prefix="/auctions/{auction_id}/auto-bids", tags=["auto-bids"])

class AutoBidCreate(BaseModel):
    auction_player_id: int
    max_amount: int

    @field_validator('max_amount')
    @classmethod
    def validate_max_amount(cls, v):
        if v <= 0:
            raise ValueError('max_amount must be positive')
        return v

@router.post("")
async def create_auto_bid(
    auction_id: int,
    data: AutoBidCreate,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AutoBidRepository(pool)
    auto_bid = await repo.create_auto_bid(current_user["id"], data.auction_player_id, data.max_amount)
    return auto_bid

@router.get("")
async def get_user_auto_bids(
    auction_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AutoBidRepository(pool)
    auto_bids = await repo.get_user_auto_bids(current_user["id"], auction_id)
    return auto_bids

@router.delete("/{auto_bid_id}")
async def delete_auto_bid(
    auction_id: int,
    auto_bid_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = AutoBidRepository(pool)
    success = await repo.deactivate_auto_bid(auto_bid_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Auto-bid not found")
    return {"message": "Auto-bid deactivated"}
