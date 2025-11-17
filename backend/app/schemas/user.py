from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from app.schemas.base import BaseSchema, TimestampMixin

class UserBase(BaseSchema):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    profile_photo: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserUpdate(BaseSchema):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    profile_photo: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class UserOut(UserBase, TimestampMixin):
    id: int
    is_approved: bool = False
    roles: List[str] = Field(default_factory=list)
