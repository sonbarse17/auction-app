from pydantic import Field
from app.schemas.base import BaseSchema, TimestampMixin

class ChatMessageCreate(BaseSchema):
    auction_id: int
    message: str = Field(..., min_length=1, max_length=500)

class ChatMessageOut(TimestampMixin):
    id: int
    auction_id: int
    user_id: int
    user_name: str
    message: str
