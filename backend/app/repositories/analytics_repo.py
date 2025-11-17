import asyncpg
from typing import List, Dict

class AnalyticsRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def get_auction_summary(self, auction_id: int) -> Dict:
        async with self.pool.acquire() as conn:
            summary = await conn.fetchrow("""
                SELECT 
                    COUNT(DISTINCT ap.id) as total_players,
                    COUNT(DISTINCT CASE WHEN ap.status = 'sold' THEN ap.id END) as players_sold,
                    COUNT(DISTINCT CASE WHEN ap.status = 'unsold' THEN ap.id END) as players_unsold,
                    COALESCE(SUM(ap.sold_price), 0) as total_spent,
                    COALESCE(AVG(ap.sold_price), 0) as avg_price,
                    COALESCE(MAX(ap.sold_price), 0) as highest_price,
                    COUNT(DISTINCT b.id) as total_bids
                FROM auction_players ap
                LEFT JOIN bids b ON b.auction_id = ap.auction_id AND b.player_id = ap.player_id
                WHERE ap.auction_id = $1
            """, auction_id)
            return dict(summary)

    async def get_team_spending(self, auction_id: int) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    t.id as team_id,
                    t.name as team_name,
                    t.budget as total_budget,
                    t.remaining_budget,
                    COALESCE(SUM(ap.sold_price), 0) as spent,
                    COUNT(ap.id) as players_bought,
                    COALESCE(AVG(ap.sold_price), 0) as avg_player_price
                FROM teams t
                LEFT JOIN auction_players ap ON ap.sold_to_team_id = t.id AND ap.auction_id = $1
                WHERE t.tournament_id = (SELECT tournament_id FROM auctions WHERE id = $1)
                GROUP BY t.id, t.name, t.budget, t.remaining_budget
                ORDER BY spent DESC
            """, auction_id)
            return [dict(row) for row in rows]

    async def get_most_expensive_players(self, auction_id: int, limit: int = 10) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    p.id, p.name, p.position, p.sport,
                    ap.sold_price,
                    t.name as team_name,
                    COUNT(b.id) as bid_count
                FROM auction_players ap
                JOIN players p ON ap.player_id = p.id
                JOIN teams t ON ap.sold_to_team_id = t.id
                LEFT JOIN bids b ON b.auction_id = ap.auction_id AND b.player_id = ap.player_id
                WHERE ap.auction_id = $1 AND ap.status = 'sold'
                GROUP BY p.id, p.name, p.position, p.sport, ap.sold_price, t.name
                ORDER BY ap.sold_price DESC
                LIMIT $2
            """, auction_id, limit)
            return [dict(row) for row in rows]

    async def get_position_wise_spending(self, auction_id: int) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    p.position,
                    COUNT(ap.id) as players_count,
                    COALESCE(SUM(ap.sold_price), 0) as total_spent,
                    COALESCE(AVG(ap.sold_price), 0) as avg_price,
                    COALESCE(MAX(ap.sold_price), 0) as max_price
                FROM auction_players ap
                JOIN players p ON ap.player_id = p.id
                WHERE ap.auction_id = $1 AND ap.status = 'sold'
                GROUP BY p.position
                ORDER BY total_spent DESC
            """, auction_id)
            return [dict(row) for row in rows]

    async def get_bidding_activity(self, auction_id: int) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    t.id as team_id,
                    t.name as team_name,
                    COUNT(b.id) as total_bids,
                    COUNT(DISTINCT b.player_id) as players_bid_on,
                    COUNT(DISTINCT ap.id) as players_won
                FROM teams t
                LEFT JOIN bids b ON b.team_id = t.id AND b.auction_id = $1
                LEFT JOIN auction_players ap ON ap.sold_to_team_id = t.id AND ap.auction_id = $1
                WHERE t.tournament_id = (SELECT tournament_id FROM auctions WHERE id = $1)
                GROUP BY t.id, t.name
                ORDER BY total_bids DESC
            """, auction_id)
            return [dict(row) for row in rows]

    async def get_squad_composition(self, team_id: int, auction_id: int) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    p.position,
                    COUNT(*) as count,
                    COALESCE(SUM(ap.sold_price), 0) as total_spent
                FROM auction_players ap
                JOIN players p ON ap.player_id = p.id
                WHERE ap.sold_to_team_id = $1 AND ap.auction_id = $2 AND ap.status = 'sold'
                GROUP BY p.position
                ORDER BY count DESC
            """, team_id, auction_id)
            return [dict(row) for row in rows]

    async def get_unsold_players(self, auction_id: int) -> List[Dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT 
                    p.id, p.name, p.position, p.base_price, p.sport,
                    COUNT(b.id) as bid_count,
                    COALESCE(MAX(b.amount), 0) as highest_bid
                FROM auction_players ap
                JOIN players p ON ap.player_id = p.id
                LEFT JOIN bids b ON b.auction_id = ap.auction_id AND b.player_id = ap.player_id
                WHERE ap.auction_id = $1 AND ap.status = 'unsold'
                GROUP BY p.id, p.name, p.position, p.base_price, p.sport
                ORDER BY p.base_price DESC
            """, auction_id)
            return [dict(row) for row in rows]
