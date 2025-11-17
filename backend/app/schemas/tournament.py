from pydantic import Field, field_validator
from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema, TimestampMixin

class TournamentBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: datetime
    end_date: Optional[datetime] = None
    squad_rules: Optional[dict] = None

    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[datetime], info) -> Optional[datetime]:
        if v and 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern='^(draft|active|completed|cancelled)$')
    squad_rules: Optional[dict] = None

class TournamentOut(TournamentBase, TimestampMixin):
    id: int
    status: str
    created_by: int
