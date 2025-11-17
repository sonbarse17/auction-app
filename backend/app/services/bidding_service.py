from app.repositories import bid_repo, team_repo, auction_repo, player_repo, auction_player_repo, tournament_repo, squad_repo
from app.repositories.auto_bid_repo import AutoBidRepository
from app.repositories.notification_repo import NotificationRepository
from app.schemas.bid import BidCreate, BidOut
from app.schemas.websocket import WSEvent, WSBidUpdated, WSPlayerSold, WSPlayerUnsold
from app.websocket.manager import manager
from app.services.timer_service import timer_service
from app.services.event_recorder import record_event
from decimal import Decimal
from typing import Optional
from datetime import datetime, timezone
import redis.asyncio as redis
from app.config.settings import settings
import asyncpg

class BidError(Exception):
    pass

redis_client: Optional[redis.Redis] = None

async def get_redis():
    global redis_client
    if not redis_client:
        redis_client = await redis.from_url(settings.redis_url)
    return redis_client

async def validate_bid(bid: BidCreate, team_id: int) -> tuple[bool, str]:
    auction = await auction_repo.get_auction(bid.auction_id)
    if not auction or auction.status != "active":
        return False, "Auction is not active"
    
    if auction.current_player_id != bid.player_id:
        return False, "This player is not currently up for auction"
    
    team = await team_repo.get_team(team_id)
    if not team:
        return False, "Team not found"
    
    highest_bid = await bid_repo.get_highest_bid(bid.auction_id, bid.player_id)
    player_data = await player_repo.get_player(bid.player_id)
    
    min_bid = highest_bid.amount + Decimal("1000") if highest_bid else player_data.base_price
    
    if bid.amount < min_bid:
        return False, f"Bid must be at least {min_bid}"
    
    total_spent = await bid_repo.get_team_total_spent(team_id, bid.auction_id)
    available = team.budget - total_spent
    
    if bid.amount > available:
        return False, "Insufficient budget"
    
    return True, "Valid"

async def update_redis_highest_bid(auction_id: int, player_id: int, team_id: int, amount: Decimal):
    r = await get_redis()
    await r.set(f"auction:{auction_id}:highest_bid:{player_id}", str(amount))
    await r.set(f"auction:{auction_id}:highest_bidder:{player_id}", team_id)

async def store_bid_in_db(bid: BidCreate, team_id: int) -> BidOut:
    return await bid_repo.create_bid(bid, team_id)

async def broadcast_event(auction_id: int, event: WSEvent):
    await manager.broadcast_to_auction(auction_id, event)

async def place_bid(bid: BidCreate, team_id: int, pool: asyncpg.Pool = None) -> BidOut:
    valid, error_msg = await validate_bid(bid, team_id)
    if not valid:
        raise BidError(error_msg)
    
    new_bid = await store_bid_in_db(bid, team_id)
    await update_redis_highest_bid(bid.auction_id, bid.player_id, team_id, bid.amount)
    
    team = await team_repo.get_team(team_id)
    event = WSEvent(
        type="BID_UPDATED",
        data=WSBidUpdated(
            bid_id=new_bid.id,
            team_id=team_id,
            team_name=team.name,
            player_id=bid.player_id,
            amount=bid.amount,
            timestamp=datetime.now(timezone.utc)
        ).model_dump()
    )
    await broadcast_event(bid.auction_id, event)
    
    # Record event for replay
    await record_event(bid.auction_id, "BID_PLACED", {
        "team_id": team_id,
        "team_name": team.name,
        "player_id": bid.player_id,
        "amount": float(bid.amount)
    })
    
    # Reset timer
    await timer_service.start_timer(bid.auction_id, 30)
    
    # Check and trigger auto-bids
    if pool:
        await process_auto_bids(bid.auction_id, bid.player_id, bid.amount, team_id, pool)
    
    return new_bid

async def process_auto_bids(auction_id: int, player_id: int, current_bid: Decimal, current_team_id: int, pool: asyncpg.Pool):
    auction_player = await auction_player_repo.get_auction_player(auction_id, player_id)
    if not auction_player:
        return
    
    auto_bid_repo = AutoBidRepository(pool)
    active_auto_bids = await auto_bid_repo.get_active_auto_bids(auction_player.id)
    
    for auto_bid in active_auto_bids:
        if auto_bid['team_id'] == current_team_id:
            continue
        
        if auto_bid['max_amount'] > current_bid:
            next_bid = current_bid + Decimal("1000")
            if next_bid <= auto_bid['max_amount']:
                try:
                    bid_create = BidCreate(
                        auction_id=auction_id,
                        player_id=player_id,
                        amount=next_bid
                    )
                    await place_bid(bid_create, auto_bid['team_id'], pool)
                    
                    # Notify user
                    notif_repo = NotificationRepository(pool)
                    await notif_repo.create_notification(
                        auto_bid['user_id'],
                        "AUTO_BID_PLACED",
                        f"Auto-bid placed: {next_bid} for player"
                    )
                    break
                except BidError:
                    await auto_bid_repo.deactivate_auto_bid(auto_bid['id'], auto_bid['user_id'])
            else:
                await auto_bid_repo.deactivate_auto_bid(auto_bid['id'], auto_bid['user_id'])
                notif_repo = NotificationRepository(pool)
                await notif_repo.create_notification(
                    auto_bid['user_id'],
                    "AUTO_BID_OUTBID",
                    f"Your auto-bid was outbid for player"
                )

async def finalize_player_sale(auction_id: int, player_id: int, pool: asyncpg.Pool = None):
    highest_bid = await bid_repo.get_highest_bid(auction_id, player_id)
    player = await player_repo.get_player(player_id)
    
    # Deactivate all auto-bids for this player
    if pool:
        auction_player = await auction_player_repo.get_auction_player(auction_id, player_id)
        if auction_player:
            auto_bid_repo = AutoBidRepository(pool)
            await auto_bid_repo.deactivate_all_for_player(auction_player.id)
    
    if highest_bid:
        # Check reserve price
        if player.reserve_price and highest_bid.amount < player.reserve_price:
            await auction_player_repo.mark_unsold(auction_id, player_id)
            event = WSEvent(
                type="PLAYER_UNSOLD",
                data=WSPlayerUnsold(
                    player_id=player_id,
                    player_name=f"{player.name} (Reserve not met)"
                ).model_dump()
            )
            await broadcast_event(auction_id, event)
            return
        
        # Check squad composition
        auction = await auction_repo.get_auction(auction_id)
        tournament = await tournament_repo.get_tournament(auction.tournament_id)
        if tournament.squad_rules:
            valid, error = await squad_repo.validate_squad_rules(
                highest_bid.team_id, auction_id, player.position, tournament.squad_rules
            )
            if not valid:
                await auction_player_repo.mark_unsold(auction_id, player_id)
                event = WSEvent(
                    type="PLAYER_UNSOLD",
                    data=WSPlayerUnsold(
                        player_id=player_id,
                        player_name=f"{player.name} ({error})"
                    ).model_dump()
                )
                await broadcast_event(auction_id, event)
                return
        
        await auction_player_repo.mark_sold(auction_id, player_id, highest_bid.team_id, highest_bid.amount)
        await team_repo.update_team_budget(highest_bid.team_id, highest_bid.amount)
        
        team = await team_repo.get_team(highest_bid.team_id)
        event = WSEvent(
            type="PLAYER_SOLD",
            data=WSPlayerSold(
                player_id=player_id,
                player_name=player.name,
                team_id=highest_bid.team_id,
                team_name=team.name,
                final_amount=highest_bid.amount
            ).model_dump()
        )
    else:
        await auction_player_repo.mark_unsold(auction_id, player_id)
        event = WSEvent(
            type="PLAYER_UNSOLD",
            data=WSPlayerUnsold(
                player_id=player_id,
                player_name=player.name
            ).model_dump()
        )
    
    await broadcast_event(auction_id, event)
