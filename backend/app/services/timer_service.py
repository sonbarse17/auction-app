import asyncio
import redis.asyncio as redis
from app.config.settings import settings
from app.schemas.timer import TimerState, TimerOut
from app.schemas.websocket import WSTimerUpdate
from typing import Optional

class TimerService:
    def __init__(self):
        self.redis_client: redis.Redis = None
        self.background_task: Optional[asyncio.Task] = None
    
    async def connect(self):
        self.redis_client = await redis.from_url(settings.redis_url)
    
    async def start_timer(self, auction_id: int, seconds: int):
        await self.redis_client.set(f"auction:{auction_id}:timer_status", "running")
        await self.redis_client.set(f"auction:{auction_id}:remaining_seconds", seconds)
    
    async def pause_timer(self, auction_id: int):
        await self.redis_client.set(f"auction:{auction_id}:timer_status", "paused")
    
    async def resume_timer(self, auction_id: int):
        await self.redis_client.set(f"auction:{auction_id}:timer_status", "running")
    
    async def extend(self, auction_id: int, extra_seconds: int):
        current = await self.redis_client.get(f"auction:{auction_id}:remaining_seconds")
        if current:
            new_value = int(current) + extra_seconds
            await self.redis_client.set(f"auction:{auction_id}:remaining_seconds", new_value)
    
    async def finish_if_zero(self, auction_id: int) -> bool:
        remaining = await self.redis_client.get(f"auction:{auction_id}:remaining_seconds")
        if remaining and int(remaining) <= 0:
            await self.redis_client.delete(f"auction:{auction_id}:timer_status")
            await self.redis_client.delete(f"auction:{auction_id}:remaining_seconds")
            return True
        return False
    
    async def get_timer_state(self, auction_id: int) -> TimerOut:
        status = await self.redis_client.get(f"auction:{auction_id}:timer_status")
        remaining = await self.redis_client.get(f"auction:{auction_id}:remaining_seconds")
        
        return TimerOut(
            auction_id=auction_id,
            remaining_seconds=int(remaining) if remaining else 0,
            is_running=status == b"running" if status else False,
            is_paused=status == b"paused" if status else False
        )
    
    async def stop_timer(self, auction_id: int):
        await self.redis_client.delete(f"auction:{auction_id}:timer_status")
        await self.redis_client.delete(f"auction:{auction_id}:remaining_seconds")
    
    async def tick_background(self):
        from app.websocket.manager import manager
        
        while True:
            try:
                await asyncio.sleep(1)
                
                # Get all active auction timers
                keys = await self.redis_client.keys("auction:*:timer_status")
                
                for key in keys:
                    auction_id = int(key.decode().split(":")[1])
                    status = await self.redis_client.get(f"auction:{auction_id}:timer_status")
                    
                    if status == b"running":
                        remaining = await self.redis_client.get(f"auction:{auction_id}:remaining_seconds")
                        if remaining:
                            remaining_int = int(remaining)
                            
                            if remaining_int > 0:
                                new_remaining = remaining_int - 1
                                await self.redis_client.set(f"auction:{auction_id}:remaining_seconds", new_remaining)
                                
                                # Broadcast timer tick
                                from app.schemas.websocket import WSEvent
                                ws_event = WSEvent(
                                    type="TIMER_TICK",
                                    data=WSTimerUpdate(
                                        remaining_seconds=new_remaining,
                                        is_paused=False
                                    ).model_dump()
                                )
                                await manager.broadcast_to_auction(auction_id, ws_event)
                            else:
                                # Timer finished
                                await self.finish_if_zero(auction_id)
                                from app.schemas.websocket import WSEvent
                                await manager.broadcast_to_auction(auction_id, WSEvent(
                                    type="TIMER_COMPLETE",
                                    data={"auction_id": auction_id}
                                ))
            except Exception as e:
                print(f"Timer tick error: {e}")
    
    def start_background_task(self):
        if not self.background_task:
            self.background_task = asyncio.create_task(self.tick_background())
    
    async def stop_background_task(self):
        if self.background_task:
            self.background_task.cancel()
            try:
                await self.background_task
            except asyncio.CancelledError:
                pass

timer_service = TimerService()
