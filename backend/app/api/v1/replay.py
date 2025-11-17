from fastapi import APIRouter, HTTPException
from app.db.connection import fetch_all, fetch_one

router = APIRouter(prefix="/replay", tags=["replay"])

@router.get("/auctions/{auction_id}/events")
async def get_auction_events(auction_id: int):
    """Get all events for auction replay"""
    events = await fetch_all(
        """
        SELECT id, event_type, event_data, timestamp
        FROM auction_events
        WHERE auction_id = $1
        ORDER BY timestamp ASC
        """,
        auction_id
    )
    return events

@router.get("/auctions/{auction_id}/summary")
async def get_auction_summary(auction_id: int):
    """Get auction summary for replay"""
    auction = await fetch_one(
        """
        SELECT a.*, t.name as tournament_name
        FROM auctions a
        JOIN tournaments t ON a.tournament_id = t.id
        WHERE a.id = $1
        """,
        auction_id
    )
    
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    event_count = await fetch_one(
        "SELECT COUNT(*) as count FROM auction_events WHERE auction_id = $1",
        auction_id
    )
    
    return {
        **auction,
        "event_count": event_count['count']
    }
