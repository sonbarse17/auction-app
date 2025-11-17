from app.repositories import auction_repo, auction_player_repo, player_repo
from app.schemas.auction import AuctionCreate, AuctionOut, AuctionStateOut
from typing import Optional

async def create_auction(auction: AuctionCreate) -> AuctionOut:
    return await auction_repo.create_auction(auction)

async def get_auction(auction_id: int) -> Optional[AuctionOut]:
    return await auction_repo.get_auction(auction_id)

async def start_auction(auction_id: int) -> bool:
    queue = await auction_player_repo.list_queue(auction_id)
    pending = [p for p in queue if p.status == 'pending']
    
    if not pending:
        return False
    
    first_player = pending[0]
    await auction_repo.update_status(auction_id, "active")
    await auction_repo.set_current_player(auction_id, first_player.player_id)
    return True

async def next_player(auction_id: int) -> Optional[int]:
    queue = await auction_player_repo.list_queue(auction_id)
    pending = [p for p in queue if p.status == 'pending']
    
    if pending:
        next_p = pending[0]
        await auction_repo.set_current_player(auction_id, next_p.player_id)
        return next_p.player_id
    else:
        await auction_repo.update_status(auction_id, "completed")
        await auction_repo.set_current_player(auction_id, None)
        return None

async def pause_auction(auction_id: int):
    await auction_repo.update_status(auction_id, "paused")

async def resume_auction(auction_id: int):
    await auction_repo.update_status(auction_id, "active")

async def complete_auction(auction_id: int):
    await auction_repo.update_status(auction_id, "completed")
    await auction_repo.set_current_player(auction_id, None)

async def get_auction_state(auction_id: int) -> Optional[AuctionStateOut]:
    auction = await auction_repo.get_auction(auction_id)
    if not auction:
        return None
    
    current_player = None
    if auction.current_player_id:
        player = await player_repo.get_player(auction.current_player_id)
        current_player = player.model_dump() if player else None
    
    from app.repositories import bid_repo
    highest_bid_data = await bid_repo.get_highest_bid(auction_id, auction.current_player_id) if auction.current_player_id else None
    
    return AuctionStateOut(
        auction=auction,
        current_player=current_player,
        highest_bid=highest_bid_data.amount if highest_bid_data else None,
        highest_bidder_team_id=highest_bid_data.team_id if highest_bid_data else None,
        remaining_seconds=auction.timer_seconds
    )
