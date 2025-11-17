from pydantic import Field
from decimal import Decimal
from app.schemas.base import BaseSchema, TimestampMixin

class AutoBidCreate(BaseSchema):
    auction_id: int
    player_id: int
    team_id: int
    max_amount: Decimal = Field(..., gt=0)

class AutoBidOut(AutoBidCreate, TimestampMixin):
    id: int
    is_active: bool
