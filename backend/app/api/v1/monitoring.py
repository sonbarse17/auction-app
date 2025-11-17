from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.core.database import get_db_pool
import asyncpg
import psutil
import time

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

start_time = time.time()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "uptime": time.time() - start_time
    }

@router.get("/metrics")
async def get_metrics(
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    if current_user.get("role") != "admin":
        return {"error": "Admin only"}
    
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Database metrics
    async with pool.acquire() as conn:
        db_size = await conn.fetchval("SELECT pg_database_size(current_database())")
        active_connections = await conn.fetchval("""
            SELECT count(*) FROM pg_stat_activity 
            WHERE state = 'active'
        """)
    
    return {
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_used_gb": memory.used / (1024**3),
            "disk_percent": disk.percent,
            "disk_used_gb": disk.used / (1024**3)
        },
        "database": {
            "size_mb": db_size / (1024**2),
            "active_connections": active_connections
        },
        "uptime_seconds": time.time() - start_time
    }

@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    async with pool.acquire() as conn:
        total_users = await conn.fetchval("SELECT COUNT(*) FROM users")
        total_auctions = await conn.fetchval("SELECT COUNT(*) FROM auctions")
        active_auctions = await conn.fetchval("SELECT COUNT(*) FROM auctions WHERE status = 'active'")
        total_bids = await conn.fetchval("SELECT COUNT(*) FROM bids")
        total_players = await conn.fetchval("SELECT COUNT(*) FROM players")
    
    return {
        "users": total_users,
        "auctions": {
            "total": total_auctions,
            "active": active_auctions
        },
        "bids": total_bids,
        "players": total_players
    }
