from typing import Optional
import asyncpg

class AutoBidRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create_auto_bid(self, user_id: int, auction_player_id: int, max_amount: int) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO auto_bids (user_id, auction_player_id, max_amount, is_active)
                VALUES ($1, $2, $3, true)
                RETURNING id, user_id, auction_player_id, max_amount, is_active, created_at
            """, user_id, auction_player_id, max_amount)
            return dict(row)

    async def get_active_auto_bids(self, auction_player_id: int) -> list[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT ab.id, ab.user_id, ab.auction_player_id, ab.max_amount, ab.is_active,
                       u.username, t.id as team_id, t.name as team_name
                FROM auto_bids ab
                JOIN users u ON ab.user_id = u.id
                JOIN teams t ON u.id = t.owner_id
                WHERE ab.auction_player_id = $1 AND ab.is_active = true
                ORDER BY ab.max_amount DESC
            """, auction_player_id)
            return [dict(row) for row in rows]

    async def get_user_auto_bids(self, user_id: int, auction_id: int) -> list[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT ab.id, ab.user_id, ab.auction_player_id, ab.max_amount, ab.is_active,
                       p.name as player_name, p.position, ap.base_price
                FROM auto_bids ab
                JOIN auction_players ap ON ab.auction_player_id = ap.id
                JOIN players p ON ap.player_id = p.id
                WHERE ab.user_id = $1 AND ap.auction_id = $2
                ORDER BY ab.created_at DESC
            """, user_id, auction_id)
            return [dict(row) for row in rows]

    async def deactivate_auto_bid(self, auto_bid_id: int, user_id: int) -> bool:
        async with self.pool.acquire() as conn:
            result = await conn.execute("""
                UPDATE auto_bids SET is_active = false
                WHERE id = $1 AND user_id = $2
            """, auto_bid_id, user_id)
            return result == "UPDATE 1"

    async def deactivate_all_for_player(self, auction_player_id: int):
        async with self.pool.acquire() as conn:
            await conn.execute("""
                UPDATE auto_bids SET is_active = false
                WHERE auction_player_id = $1
            """, auction_player_id)
