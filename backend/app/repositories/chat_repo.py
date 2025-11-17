import asyncpg

class ChatRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create_message(self, auction_id: int, user_id: int, message: str, channel: str = "public") -> dict:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO chat_messages (auction_id, user_id, message, channel, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING id, auction_id, user_id, message, channel, created_at
            """, auction_id, user_id, message, channel)
            return dict(row)

    async def get_messages(self, auction_id: int, channel: str = "public", limit: int = 100) -> list[dict]:
        async with self.pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT cm.id, cm.auction_id, cm.user_id, cm.message, cm.channel, cm.created_at,
                       u.username, t.name as team_name
                FROM chat_messages cm
                JOIN users u ON cm.user_id = u.id
                LEFT JOIN teams t ON u.id = t.owner_id
                WHERE cm.auction_id = $1 AND cm.channel = $2
                ORDER BY cm.created_at DESC
                LIMIT $3
            """, auction_id, channel, limit)
            return [dict(row) for row in reversed(rows)]

    async def delete_message(self, message_id: int) -> bool:
        async with self.pool.acquire() as conn:
            result = await conn.execute("""
                DELETE FROM chat_messages WHERE id = $1
            """, message_id)
            return result == "DELETE 1"
