from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis
from app.config.settings import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_url: str = None):
        super().__init__(app)
        self.redis_url = redis_url or settings.redis_url
        self.redis_client = None

    async def get_redis(self):
        if not self.redis_client:
            self.redis_client = await redis.from_url(self.redis_url)
        return self.redis_client

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/"]:
            return await call_next(request)

        client_ip = request.client.host
        r = await self.get_redis()
        key = f"rate_limit:{client_ip}"
        
        current = await r.get(key)
        if current and int(current) >= 100:
            raise HTTPException(status_code=429, detail="Too many requests")
        
        pipe = r.pipeline()
        pipe.incr(key)
        pipe.expire(key, 60)
        await pipe.execute()
        
        response = await call_next(request)
        return response
