from pydantic import Field
from typing import List, Optional
from decimal import Decimal
from app.schemas.base import BaseSchema
from app.schemas.auction import AuctionOut
from app.schemas.player import PlayerOut
from app.schemas.bid import BidWithTeamOut
from app.schemas.timer import TimerOut

class TeamBudgetSnapshot(BaseSchema):
    team_id: int
    team_name: str
    budget: Decimal
    remaining_budget: Decimal
    spent: Decimal

class QueuePlayerSnapshot(BaseSchema):
    player_id: int
    player_name: str
    order_index: int
    status: str

class AuctionSnapshot(BaseSchema):
    auction: AuctionOut
    current_player: Optional[PlayerOut] = None
    recent_bids: List[BidWithTeamOut] = Field(default_factory=list)
    team_budgets: List[TeamBudgetSnapshot] = Field(default_factory=list)
    queue_summary: List[QueuePlayerSnapshot] = Field(default_factory=list)
    timer_state: TimerOut
