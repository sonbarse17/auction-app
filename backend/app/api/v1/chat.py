from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from app.core.auth import get_current_user
from app.repositories.chat_repo import ChatRepository
from app.core.database import get_db_pool
import asyncpg

router = APIRouter(prefix="/auctions/{auction_id}/chat", tags=["chat"])

class ChatMessage(BaseModel):
    message: str
    channel: str = "public"

    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('message cannot be empty')
        if len(v) > 500:
            raise ValueError('message too long')
        return v.strip()

    @field_validator('channel')
    @classmethod
    def validate_channel(cls, v):
        if v not in ["public", "team"]:
            raise ValueError('channel must be public or team')
        return v

@router.post("")
async def send_message(
    auction_id: int,
    data: ChatMessage,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = ChatRepository(pool)
    message = await repo.create_message(auction_id, current_user["id"], data.message, data.channel)
    return message

@router.get("")
async def get_messages(
    auction_id: int,
    channel: str = "public",
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    repo = ChatRepository(pool)
    messages = await repo.get_messages(auction_id, channel, limit)
    return messages

@router.delete("/{message_id}")
async def delete_message(
    auction_id: int,
    message_id: int,
    current_user: dict = Depends(get_current_user),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete messages")
    repo = ChatRepository(pool)
    success = await repo.delete_message(message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}
