from fastapi import APIRouter, Depends, Header, HTTPException
from app.repositories import notification_repo
from app.services.auth_service import decode_token
from typing import List

router = APIRouter(prefix="/notifications", tags=["notifications"])

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.get("")
async def get_notifications(unread_only: bool = False, user=Depends(get_current_user)):
    return await notification_repo.get_user_notifications(user.user_id, unread_only)

@router.post("/{notification_id}/read")
async def mark_read(notification_id: int, user=Depends(get_current_user)):
    await notification_repo.mark_as_read(notification_id)
    return {"message": "Marked as read"}

@router.post("/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    await notification_repo.mark_all_read(user.user_id)
    return {"message": "All marked as read"}
