from app.repositories import auction_repo, player_repo, snapshot_repo
from app.schemas.snapshot import AuctionSnapshot, TeamBudgetSnapshot, QueuePlayerSnapshot
from app.schemas.bid import BidWithTeamOut
from app.services.timer_service import timer_service
from typing import Optional

async def get_auction_snapshot(auction_id: int) -> Optional[AuctionSnapshot]:
    auction = await auction_repo.get_auction(auction_id)
    if not auction:
        return None
    
    # Get current player
    current_player = None
    if auction.current_player_id:
        current_player = await player_repo.get_player(auction.current_player_id)
    
    # Get recent bids for current player
    recent_bids = []
    if auction.current_player_id:
        bid_rows = await snapshot_repo.get_recent_bids(auction_id, auction.current_player_id, 10)
        recent_bids = [BidWithTeamOut(**row) for row in bid_rows]
    
    # Get team budgets
    budget_rows = await snapshot_repo.get_team_budgets(auction.tournament_id)
    team_budgets = [TeamBudgetSnapshot(**row) for row in budget_rows]
    
    # Get queue summary
    queue_rows = await snapshot_repo.get_queue_summary(auction_id)
    queue_summary = [QueuePlayerSnapshot(**row) for row in queue_rows]
    
    # Get timer state
    timer_state = await timer_service.get_timer_state(auction_id)
    
    return AuctionSnapshot(
        auction=auction,
        current_player=current_player,
        recent_bids=recent_bids,
        team_budgets=team_budgets,
        queue_summary=queue_summary,
        timer_state=timer_state
    )
