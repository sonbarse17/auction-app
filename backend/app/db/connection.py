import asyncpg
from app.config.settings import settings
from typing import Optional, List, Any

pool: asyncpg.Pool = None

async def init_db():
    global pool
    pool = await asyncpg.create_pool(settings.database_url, min_size=5, max_size=20)

async def close_db():
    global pool
    if pool:
        await pool.close()

def get_pool() -> asyncpg.Pool:
    return pool

async def get_connection():
    async with pool.acquire() as conn:
        yield conn

async def fetch_one(sql: str, *params) -> Optional[dict]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(sql, *params)
        return dict(row) if row else None

async def fetch_all(sql: str, *params) -> List[dict]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)
        return [dict(row) for row in rows]

async def execute(sql: str, *params) -> str:
    async with pool.acquire() as conn:
        return await conn.execute(sql, *params)

async def execute_returning(sql: str, *params) -> Optional[dict]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(sql, *params)
        return dict(row) if row else None
