from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.bid import BidCreate, BidOut, BidWithTeamOut
from app.services import bidding_service
from app.repositories import bid_repo, team_repo
from app.services.auth_service import decode_token
from app.websocket.manager import manager
from app.core.database import get_db_pool
from typing import List
import asyncpg

router = APIRouter(prefix="/bids", tags=["bids"])

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("", response_model=BidOut)
async def place_bid(bid: BidCreate, user=Depends(get_current_user), pool: asyncpg.Pool = Depends(get_db_pool)):
    # Get user's team for this auction
    from app.repositories import auction_repo
    auction = await auction_repo.get_auction_by_id(bid.auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    team = await team_repo.get_team_by_owner(auction.tournament_id, user.user_id)
    if not team:
        raise HTTPException(status_code=403, detail="No team found for this tournament")
    
    try:
        new_bid = await bidding_service.place_bid(bid, team.id, pool)
        
        # Broadcast bid to WebSocket clients
        await manager.broadcast_to_auction(bid.auction_id, {
            "type": "bid_placed",
            "data": {
                "bid_id": new_bid.id,
                "team_id": team.id,
                "team_name": team.name,
                "amount": float(new_bid.amount),
                "timestamp": new_bid.created_at.isoformat()
            }
        })
        
        return new_bid
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except bidding_service.BidError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/auction/{auction_id}/player/{player_id}", response_model=List[BidWithTeamOut])
async def get_player_bids(auction_id: int, player_id: int):
    return await bid_repo.get_bids_for_player(auction_id, player_id)

@router.get("/auction/{auction_id}/player/{player_id}/highest", response_model=BidWithTeamOut)
async def get_highest_bid(auction_id: int, player_id: int):
    bid = await bid_repo.get_highest_bid(auction_id, player_id)
    if not bid:
        raise HTTPException(status_code=404, detail="No bids found")
    return bid
