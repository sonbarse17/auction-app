from app.db.connection import fetch_one, execute_returning, execute, get_pool
from app.schemas.auction import AuctionCreate, AuctionOut
from app.repositories import auction_player_repo
from typing import Optional

async def create_auction(auction: AuctionCreate) -> AuctionOut:
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            row = await conn.fetchrow(
                """
                INSERT INTO auctions (tournament_id, name, timer_seconds)
                VALUES ($1, $2, $3)
                RETURNING *
                """,
                auction.tournament_id, auction.name, auction.timer_seconds
            )
            auction_id = row['id']
            
            for idx, player_id in enumerate(auction.player_ids):
                await conn.execute(
                    """
                    INSERT INTO auction_players (auction_id, player_id, order_index, status)
                    VALUES ($1, $2, $3, 'pending')
                    """,
                    auction_id, player_id, idx
                )
            
            return AuctionOut(**dict(row))

async def get_auction(auction_id: int) -> Optional[AuctionOut]:
    row = await fetch_one("SELECT * FROM auctions WHERE id = $1", auction_id)
    return AuctionOut(**row) if row else None

async def update_status(auction_id: int, status: str):
    await execute(
        "UPDATE auctions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        status, auction_id
    )

async def get_current_player(auction_id: int) -> Optional[int]:
    row = await fetch_one(
        "SELECT current_player_id FROM auctions WHERE id = $1",
        auction_id
    )
    return row['current_player_id'] if row else None

async def set_current_player(auction_id: int, player_id: Optional[int]):
    await execute(
        "UPDATE auctions SET current_player_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        player_id, auction_id
    )
