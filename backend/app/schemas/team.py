from pydantic import Field, field_validator
from decimal import Decimal
from typing import Optional
from app.schemas.base import BaseSchema, TimestampMixin

class TeamBase(BaseSchema):
    tournament_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=255)
    budget: Decimal = Field(..., gt=0)
    max_players: int = Field(default=15, ge=1, le=50)

    @field_validator('budget')
    @classmethod
    def validate_budget(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError('Budget must be positive')
        return v

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    budget: Optional[Decimal] = Field(None, gt=0)
    max_players: Optional[int] = Field(None, ge=1, le=50)

class TeamOut(TeamBase, TimestampMixin):
    id: int
    owner_id: int
    remaining_budget: Decimal
