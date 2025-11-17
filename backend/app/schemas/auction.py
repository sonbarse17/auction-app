from pydantic import Field, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal
from app.schemas.base import BaseSchema, TimestampMixin

class AuctionBase(BaseSchema):
    tournament_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=255)
    timer_seconds: int = Field(default=30, ge=10, le=300)

class AuctionCreate(AuctionBase):
    player_ids: List[int] = Field(..., min_length=1)

    @field_validator('player_ids')
    @classmethod
    def validate_player_ids(cls, v: List[int]) -> List[int]:
        if len(v) != len(set(v)):
            raise ValueError('Duplicate player IDs not allowed')
        return v

class AuctionUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None, pattern='^(pending|active|paused|completed)$')
    timer_seconds: Optional[int] = Field(None, ge=10, le=300)

class AuctionOut(AuctionBase, TimestampMixin):
    id: int
    status: str
    current_player_id: Optional[int] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class AuctionPlayerBase(BaseSchema):
    auction_id: int = Field(..., gt=0)
    player_id: int = Field(..., gt=0)
    order_index: int = Field(..., ge=0)
    status: str = Field(default='pending')

class AuctionPlayerOut(AuctionPlayerBase):
    id: int
    sold_to_team_id: Optional[int] = None
    final_price: Optional[Decimal] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

class AuctionStateOut(BaseSchema):
    auction: AuctionOut
    current_player: Optional[Dict[str, Any]] = None
    highest_bid: Optional[Decimal] = None
    highest_bidder_team_id: Optional[int] = None
    remaining_seconds: int
