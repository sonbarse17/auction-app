import asyncpg

class NotificationRepository:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def create_notification(self, user_id: int, type: str, message: str, metadata: dict = None):
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO notifications (user_id, type, title, message, metadata)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            """, user_id, type, type, message, None)
            return dict(row) if row else None

    async def get_user_notifications(self, user_id: int, unread_only: bool = False):
        async with self.pool.acquire() as conn:
            query = "SELECT * FROM notifications WHERE user_id = $1"
            if unread_only:
                query += " AND is_read = FALSE"
            query += " ORDER BY created_at DESC LIMIT 50"
            rows = await conn.fetch(query, user_id)
            return [dict(row) for row in rows]

    async def mark_as_read(self, notification_id: int):
        async with self.pool.acquire() as conn:
            await conn.execute("UPDATE notifications SET is_read = TRUE WHERE id = $1", notification_id)

    async def mark_all_read(self, user_id: int):
        async with self.pool.acquire() as conn:
            await conn.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", user_id)
