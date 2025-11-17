import asyncpg
from typing import List, Dict

class MultiAuctionRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def get_all_auctions_overview(self) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    a.id, a.name, a.status, a.created_at,
                    t.name as tournament_name,
                    COUNT(DISTINCT ap.id) as total_players,
                    COUNT(DISTINCT CASE WHEN ap.status = 'sold' THEN ap.id END) as sold_count,
                    COALESCE(SUM(ap.sold_price), 0) as total_spent
                FROM auctions a
                JOIN tournaments t ON a.tournament_id = t.id
                LEFT JOIN auction_players ap ON ap.auction_id = a.id
                GROUP BY a.id, a.name, a.status, a.created_at, t.name
                ORDER BY a.created_at DESC
            """)
            return [dict(row) for row in rows]

    async def clone_auction(self, auction_id: int, new_name: str, tournament_id: int) -> Dict:
        async with self.pool.acquire() as conn:
            # Get original auction
            original = await conn.fetchrow("""
                SELECT timer_seconds, bid_increment FROM auctions WHERE id = $1
            """, auction_id)
            
            # Create new auction
            new_auction = await conn.fetchrow("""
                INSERT INTO auctions (tournament_id, name, status, timer_seconds, bid_increment)
                VALUES ($1, $2, 'pending', $3, $4)
                RETURNING id, tournament_id, name, status, created_at
            """, tournament_id, new_name, original['timer_seconds'], original['bid_increment'])
            
            # Copy players
            await conn.execute("""
                INSERT INTO auction_players (auction_id, player_id, status, order_index)
                SELECT $1, player_id, 'pending', order_index
                FROM auction_players
                WHERE auction_id = $2
            """, new_auction['id'], auction_id)
            
            return dict(new_auction)

    async def get_active_auctions_count(self) -> int:
        async with self.pool.acquire() as conn:
            result = await conn.fetchval("""
                SELECT COUNT(*) FROM auctions WHERE status = 'active'
            """)
            return result

    async def schedule_auction(self, auction_id: int, scheduled_time: str) -> bool:
        async with self.pool.acquire() as conn:
            await conn.execute("""
                UPDATE auctions SET started_at = $2 WHERE id = $1
            """, auction_id, scheduled_time)
            return True
