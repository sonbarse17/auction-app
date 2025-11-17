from app.db.connection import get_pool
import asyncpg

async def get_db_pool() -> asyncpg.Pool:
    return await get_pool()
