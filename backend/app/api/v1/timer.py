from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.timer import TimerControl, TimerOut
from app.services.timer_service import timer_service
from app.services.auth_service import decode_token
from typing import Annotated

router = APIRouter(prefix="/timer", tags=["timer"])

def get_current_user(authorization: Annotated[str, Header()]):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("/control")
async def control_timer(control: TimerControl, user=Depends(get_current_user)):
    if control.action == "start":
        await timer_service.start_timer(control.auction_id, 30)
    elif control.action == "pause":
        await timer_service.pause_timer(control.auction_id)
    elif control.action == "resume":
        await timer_service.resume_timer(control.auction_id)
    elif control.action == "stop":
        await timer_service.stop_timer(control.auction_id)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    return {"message": f"Timer {control.action} successful"}

@router.get("/{auction_id}", response_model=TimerOut)
async def get_timer_state(auction_id: int):
    return await timer_service.get_timer_state(auction_id)

@router.post("/{auction_id}/extend")
async def extend_timer(auction_id: int, seconds: int, user=Depends(get_current_user)):
    await timer_service.extend(auction_id, seconds)
    return {"message": f"Timer extended by {seconds} seconds"}
