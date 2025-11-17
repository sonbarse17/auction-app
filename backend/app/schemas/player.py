from pydantic import Field, field_validator, HttpUrl
from decimal import Decimal
from typing import Optional, Dict, Any
from app.schemas.base import BaseSchema, TimestampMixin

class PlayerBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    sport: str = Field(..., min_length=1, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    base_price: Decimal = Field(..., gt=0)
    reserve_price: Optional[Decimal] = Field(None, gt=0)
    rating: Optional[Decimal] = Field(None, ge=0, le=10)
    image_url: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = None

    @field_validator('base_price')
    @classmethod
    def validate_base_price(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError('Base price must be positive')
        return v

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and (v < 0 or v > 10):
            raise ValueError('Rating must be between 0 and 10')
        return v

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sport: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    base_price: Optional[Decimal] = Field(None, gt=0)
    reserve_price: Optional[Decimal] = Field(None, gt=0)
    rating: Optional[Decimal] = Field(None, ge=0, le=10)
    image_url: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = None

class PlayerOut(PlayerBase, TimestampMixin):
    id: int
