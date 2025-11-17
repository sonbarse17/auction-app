from app.db.connection import get_pool
from app.schemas.bid import BidCreate, BidOut, BidWithTeamOut
from typing import List, Optional
from decimal import Decimal

async def create_bid(bid: BidCreate, team_id: int) -> BidOut:
    pool = get_pool()
    async with pool.acquire() as conn:
        # Get auction bid increment
        auction = await conn.fetchrow("SELECT bid_increment FROM auctions WHERE id = $1", bid.auction_id)
        bid_increment = auction['bid_increment'] if auction else Decimal(10000)
        
        # Get highest bid
        highest = await conn.fetchrow(
            "SELECT amount FROM bids WHERE auction_id = $1 AND player_id = $2 ORDER BY amount DESC LIMIT 1",
            bid.auction_id, bid.player_id
        )
        
        # Get player base price
        player = await conn.fetchrow("SELECT base_price FROM players WHERE id = $1", bid.player_id)
        min_bid = player['base_price'] if player else Decimal(0)
        
        if highest:
            min_bid = highest['amount'] + bid_increment
        
        if bid.amount < min_bid:
            raise ValueError(f"Bid must be at least {min_bid}")
        
        row = await conn.fetchrow(
            """
            INSERT INTO bids (auction_id, player_id, team_id, amount)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            bid.auction_id, bid.player_id, team_id, bid.amount
        )
        return BidOut(**dict(row))

async def get_highest_bid(auction_id: int, player_id: int) -> Optional[BidWithTeamOut]:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT b.*, t.name as team_name
            FROM bids b
            JOIN teams t ON b.team_id = t.id
            WHERE b.auction_id = $1 AND b.player_id = $2
            ORDER BY b.amount DESC, b.created_at ASC
            LIMIT 1
            """,
            auction_id, player_id
        )
        return BidWithTeamOut(**dict(row)) if row else None

async def get_bids_for_player(auction_id: int, player_id: int) -> List[BidWithTeamOut]:
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT b.*, t.name as team_name
            FROM bids b
            JOIN teams t ON b.team_id = t.id
            WHERE b.auction_id = $1 AND b.player_id = $2
            ORDER BY b.created_at DESC
            """,
            auction_id, player_id
        )
        return [BidWithTeamOut(**dict(row)) for row in rows]

async def get_team_total_spent(team_id: int, auction_id: int) -> Decimal:
    pool = get_pool()
    async with pool.acquire() as conn:
        result = await conn.fetchval(
            """
            SELECT COALESCE(SUM(ap.final_price), 0)
            FROM auction_players ap
            WHERE ap.sold_to_team_id = $1 AND ap.auction_id = $2
            """,
            team_id, auction_id
        )
        return result or Decimal(0)
