from app.db.connection import fetch_all, fetch_one
from typing import List, Optional

async def get_recent_bids(auction_id: int, player_id: int, limit: int = 10) -> List[dict]:
    return await fetch_all(
        """
        SELECT b.id, b.auction_id, b.player_id, b.team_id, b.amount, b.created_at, t.name as team_name
        FROM bids b
        JOIN teams t ON b.team_id = t.id
        WHERE b.auction_id = $1 AND b.player_id = $2
        ORDER BY b.created_at DESC
        LIMIT $3
        """,
        auction_id, player_id, limit
    )

async def get_team_budgets(tournament_id: int) -> List[dict]:
    return await fetch_all(
        """
        SELECT 
            t.id as team_id,
            t.name as team_name,
            t.budget,
            t.remaining_budget,
            (t.budget - t.remaining_budget) as spent
        FROM teams t
        WHERE t.tournament_id = $1
        ORDER BY t.name
        """,
        tournament_id
    )

async def get_queue_summary(auction_id: int) -> List[dict]:
    return await fetch_all(
        """
        SELECT 
            ap.player_id,
            p.name as player_name,
            ap.order_index,
            ap.status
        FROM auction_players ap
        JOIN players p ON ap.player_id = p.id
        WHERE ap.auction_id = $1
        ORDER BY ap.order_index
        """,
        auction_id
    )
