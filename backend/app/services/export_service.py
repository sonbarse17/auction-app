import csv
import io
from typing import List, Dict

def generate_csv(data: List[Dict], headers: List[str]) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()

async def export_team_roster(team_id: int, auction_id: int, pool) -> str:
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                p.name as player_name,
                p.position,
                p.sport,
                p.rating,
                ap.sold_price as price_paid,
                p.base_price
            FROM auction_players ap
            JOIN players p ON ap.player_id = p.id
            WHERE ap.sold_to_team_id = $1 AND ap.auction_id = $2 AND ap.status = 'sold'
            ORDER BY ap.sold_price DESC
        """, team_id, auction_id)
        
        data = [dict(row) for row in rows]
        headers = ['player_name', 'position', 'sport', 'rating', 'price_paid', 'base_price']
        return generate_csv(data, headers)

async def export_all_transactions(auction_id: int, pool) -> str:
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                p.name as player_name,
                p.position,
                t.name as team_name,
                ap.sold_price,
                p.base_price,
                (SELECT COUNT(*) FROM bids WHERE auction_id = ap.auction_id AND player_id = ap.player_id) as bid_count
            FROM auction_players ap
            JOIN players p ON ap.player_id = p.id
            LEFT JOIN teams t ON ap.sold_to_team_id = t.id
            WHERE ap.auction_id = $1 AND ap.status = 'sold'
            ORDER BY ap.sold_price DESC
        """, auction_id)
        
        data = [dict(row) for row in rows]
        headers = ['player_name', 'position', 'team_name', 'sold_price', 'base_price', 'bid_count']
        return generate_csv(data, headers)

async def export_bid_history(auction_id: int, player_id: int, pool) -> str:
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT 
                t.name as team_name,
                b.amount,
                b.created_at
            FROM bids b
            JOIN teams t ON b.team_id = t.id
            WHERE b.auction_id = $1 AND b.player_id = $2
            ORDER BY b.created_at ASC
        """, auction_id, player_id)
        
        data = [dict(row) for row in rows]
        headers = ['team_name', 'amount', 'created_at']
        return generate_csv(data, headers)
