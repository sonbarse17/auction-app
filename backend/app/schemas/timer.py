from pydantic import Field, field_validator
from app.schemas.base import BaseSchema

class TimerBase(BaseSchema):
    auction_id: int = Field(..., gt=0)
    remaining_seconds: int = Field(..., ge=0)

class TimerState(TimerBase):
    is_running: bool = Field(default=False)
    is_paused: bool = Field(default=False)

class TimerControl(BaseSchema):
    action: str = Field(..., pattern='^(start|pause|resume|stop|reset)$')
    auction_id: int = Field(..., gt=0)

    @field_validator('action')
    @classmethod
    def validate_action(cls, v: str) -> str:
        allowed = ['start', 'pause', 'resume', 'stop', 'reset']
        if v not in allowed:
            raise ValueError(f'Action must be one of {allowed}')
        return v

class TimerUpdate(BaseSchema):
    remaining_seconds: int = Field(..., ge=0)

class TimerOut(TimerState):
    pass
