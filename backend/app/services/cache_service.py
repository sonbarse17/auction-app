import redis.asyncio as redis
from app.config.settings import settings
import json
from typing import Optional, Any

class CacheService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None

    async def get_redis(self):
        if not self.redis_client:
            self.redis_client = await redis.from_url(settings.redis_url)
        return self.redis_client

    async def get(self, key: str) -> Optional[Any]:
        r = await self.get_redis()
        value = await r.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        r = await self.get_redis()
        await r.setex(key, ttl, json.dumps(value))

    async def delete(self, key: str):
        r = await self.get_redis()
        await r.delete(key)

    async def invalidate_pattern(self, pattern: str):
        r = await self.get_redis()
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)

cache_service = CacheService()
