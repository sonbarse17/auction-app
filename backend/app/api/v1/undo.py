from fastapi import APIRouter, HTTPException, Depends, Header
from app.repositories import bid_repo
from app.services.auth_service import decode_token
from app.websocket.manager import manager

router = APIRouter(prefix="/undo", tags=["undo"])

def get_admin_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user or 'admin' not in user.roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.delete("/bids/{auction_id}/{player_id}")
async def undo_last_bid(auction_id: int, player_id: int, admin=Depends(get_admin_user)):
    from app.db.connection import execute, fetch_one
    
    # Get last bid
    last_bid = await fetch_one(
        """
        SELECT * FROM bids 
        WHERE auction_id = $1 AND player_id = $2 
        ORDER BY created_at DESC LIMIT 1
        """,
        auction_id, player_id
    )
    
    if not last_bid:
        raise HTTPException(status_code=404, detail="No bids to undo")
    
    # Delete last bid
    await execute(
        "DELETE FROM bids WHERE id = $1",
        last_bid['id']
    )
    
    # Get new highest bid
    new_highest = await fetch_one(
        """
        SELECT b.*, t.name as team_name FROM bids b
        JOIN teams t ON b.team_id = t.id
        WHERE b.auction_id = $1 AND b.player_id = $2
        ORDER BY b.amount DESC LIMIT 1
        """,
        auction_id, player_id
    )
    
    # Broadcast undo event
    await manager.broadcast_to_auction(auction_id, {
        "type": "BID_UNDONE",
        "data": {
            "player_id": player_id,
            "undone_bid": {
                "team_id": last_bid['team_id'],
                "amount": float(last_bid['amount'])
            },
            "new_highest": {
                "team_id": new_highest['team_id'],
                "team_name": new_highest['team_name'],
                "amount": float(new_highest['amount'])
            } if new_highest else None
        }
    })
    
    return {"message": "Bid undone", "new_highest": new_highest}
