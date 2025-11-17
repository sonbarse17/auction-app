from pydantic import Field, field_validator
from typing import Optional, Any, Dict
from decimal import Decimal
from datetime import datetime
from app.schemas.base import BaseSchema

class WSClientMessage(BaseSchema):
    type: str = Field(..., min_length=1)
    data: Optional[Dict[str, Any]] = None

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = ['PLACE_BID', 'JOIN_AUCTION', 'LEAVE_AUCTION']
        if v not in allowed:
            raise ValueError(f'Invalid message type: {v}')
        return v

class WSEvent(BaseSchema):
    type: str
    data: Dict[str, Any]

class WSJoinAuction(BaseSchema):
    auction_id: int = Field(..., gt=0)

class WSLeaveAuction(BaseSchema):
    auction_id: int = Field(..., gt=0)

class WSPlaceBid(BaseSchema):
    auction_id: int = Field(..., gt=0)
    player_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., gt=0)

class WSBidUpdated(BaseSchema):
    bid_id: int = Field(..., gt=0)
    team_id: int = Field(..., gt=0)
    team_name: str = Field(..., min_length=1)
    player_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., gt=0)
    timestamp: datetime

class WSTimerUpdate(BaseSchema):
    remaining_seconds: int = Field(..., ge=0)
    is_paused: bool = Field(default=False)

class WSPlayerOnBlock(BaseSchema):
    player_id: int = Field(..., gt=0)
    player_name: str = Field(..., min_length=1)
    base_price: Decimal = Field(..., gt=0)
    position: Optional[str] = None
    rating: Optional[Decimal] = None
    sport: Optional[str] = None

class WSPlayerSold(BaseSchema):
    player_id: int = Field(..., gt=0)
    player_name: str = Field(..., min_length=1)
    team_id: int = Field(..., gt=0)
    team_name: str = Field(..., min_length=1)
    final_amount: Decimal = Field(..., gt=0)

class WSPlayerUnsold(BaseSchema):
    player_id: int = Field(..., gt=0)
    player_name: str = Field(..., min_length=1)

class WSError(BaseSchema):
    message: str = Field(..., min_length=1)
    code: Optional[str] = None
