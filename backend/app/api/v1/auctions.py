from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.auction import AuctionCreate, AuctionOut, AuctionStateOut
from app.schemas.snapshot import AuctionSnapshot
from app.services import auction_service, snapshot_service
from app.services.auth_service import decode_token
from typing import Annotated

router = APIRouter(prefix="/auctions", tags=["auctions"])

def get_current_user(authorization: Annotated[str, Header()]):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("", response_model=AuctionOut)
async def create_auction(auction: AuctionCreate, user=Depends(get_current_user)):
    return await auction_service.create_auction(auction)

@router.get("/{auction_id}", response_model=AuctionOut)
async def get_auction(auction_id: int):
    auction = await auction_service.get_auction(auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@router.get("/{auction_id}/snapshot", response_model=AuctionSnapshot)
async def get_auction_snapshot(auction_id: int):
    snapshot = await snapshot_service.get_auction_snapshot(auction_id)
    if not snapshot:
        raise HTTPException(status_code=404, detail="Auction not found")
    return snapshot

@router.get("/{auction_id}/state", response_model=AuctionStateOut)
async def get_auction_state(auction_id: int):
    state = await auction_service.get_auction_state(auction_id)
    if not state:
        raise HTTPException(status_code=404, detail="Auction not found")
    return state

@router.post("/{auction_id}/start")
async def start_auction(auction_id: int, user=Depends(get_current_user)):
    success = await auction_service.start_auction(auction_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot start auction")
    return {"message": "Auction started"}

@router.post("/{auction_id}/next")
async def next_player(auction_id: int, user=Depends(get_current_user)):
    player_id = await auction_service.next_player(auction_id)
    if player_id:
        return {"message": "Moved to next player", "player_id": player_id}
    return {"message": "Auction completed"}

@router.post("/{auction_id}/pause")
async def pause_auction(auction_id: int, user=Depends(get_current_user)):
    await auction_service.pause_auction(auction_id)
    return {"message": "Auction paused"}

@router.post("/{auction_id}/resume")
async def resume_auction(auction_id: int, user=Depends(get_current_user)):
    await auction_service.resume_auction(auction_id)
    return {"message": "Auction resumed"}

@router.post("/{auction_id}/complete")
async def complete_auction(auction_id: int, user=Depends(get_current_user)):
    await auction_service.complete_auction(auction_id)
    return {"message": "Auction completed"}
