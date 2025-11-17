from app.db.connection import fetch_all, execute, get_pool
from app.schemas.auction import AuctionPlayerOut
from typing import List
from decimal import Decimal

async def insert_queue(auction_id: int, ordered_player_ids: List[int]):
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for idx, player_id in enumerate(ordered_player_ids):
                await conn.execute(
                    """
                    INSERT INTO auction_players (auction_id, player_id, order_index, status)
                    VALUES ($1, $2, $3, 'pending')
                    """,
                    auction_id, player_id, idx
                )

async def list_queue(auction_id: int) -> List[AuctionPlayerOut]:
    rows = await fetch_all(
        "SELECT * FROM auction_players WHERE auction_id = $1 ORDER BY order_index",
        auction_id
    )
    return [AuctionPlayerOut(**row) for row in rows]

async def update_queue_order(auction_id: int, player_id: int, new_order: int):
    await execute(
        "UPDATE auction_players SET order_index = $1 WHERE auction_id = $2 AND player_id = $3",
        new_order, auction_id, player_id
    )

async def mark_sold(auction_id: int, player_id: int, team_id: int, final_price: Decimal):
    await execute(
        """
        UPDATE auction_players
        SET status = 'completed', sold_to_team_id = $1, final_price = $2, ended_at = CURRENT_TIMESTAMP
        WHERE auction_id = $3 AND player_id = $4
        """,
        team_id, final_price, auction_id, player_id
    )

async def mark_unsold(auction_id: int, player_id: int):
    await execute(
        """
        UPDATE auction_players
        SET status = 'unsold', ended_at = CURRENT_TIMESTAMP
        WHERE auction_id = $1 AND player_id = $2
        """,
        auction_id, player_id
    )
