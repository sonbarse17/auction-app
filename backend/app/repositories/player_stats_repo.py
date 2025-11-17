import asyncpg
import json

class PlayerStatsRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create_stats(self, player_id: int, stats_data: dict) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO player_stats (player_id, stats_data, created_at)
                VALUES ($1, $2, NOW())
                RETURNING id, player_id, stats_data, created_at
            """, player_id, json.dumps(stats_data))
            result = dict(row)
            result['stats_data'] = json.loads(result['stats_data'])
            return result

    async def get_player_stats(self, player_id: int) -> dict | None:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT id, player_id, stats_data, created_at
                FROM player_stats
                WHERE player_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            """, player_id)
            if row:
                result = dict(row)
                result['stats_data'] = json.loads(result['stats_data'])
                return result
            return None

    async def update_stats(self, player_id: int, stats_data: dict) -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE player_stats
                SET stats_data = $2, created_at = NOW()
                WHERE player_id = $1
                RETURNING id, player_id, stats_data, created_at
            """, player_id, json.dumps(stats_data))
            if row:
                result = dict(row)
                result['stats_data'] = json.loads(result['stats_data'])
                return result
            return await self.create_stats(player_id, stats_data)
