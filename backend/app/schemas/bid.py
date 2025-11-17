from pydantic import Field, field_validator
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.schemas.base import BaseSchema

class BidBase(BaseSchema):
    auction_id: int = Field(..., gt=0)
    player_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., gt=0)

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError('Bid amount must be positive')
        return v

class BidCreate(BidBase):
    pass

class BidUpdate(BaseSchema):
    pass

class BidOut(BidBase):
    id: int
    team_id: int
    created_at: datetime

class BidWithTeamOut(BidOut):
    team_name: str
