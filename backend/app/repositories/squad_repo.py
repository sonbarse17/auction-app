from app.db.connection import get_pool
from typing import Dict

async def get_team_squad_composition(team_id: int, auction_id: int) -> Dict[str, int]:
    """Get count of players by position for a team"""
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT p.position, COUNT(*) as count
            FROM auction_players ap
            JOIN players p ON ap.player_id = p.id
            WHERE ap.sold_to_team_id = $1 AND ap.auction_id = $2 AND ap.status = 'sold'
            GROUP BY p.position
            """,
            team_id, auction_id
        )
        return {row['position']: row['count'] for row in rows}

async def validate_squad_rules(team_id: int, auction_id: int, player_position: str, squad_rules: dict) -> tuple[bool, str]:
    """Check if adding a player violates squad composition rules"""
    if not squad_rules or not player_position:
        return True, ""
    
    composition = await get_team_squad_composition(team_id, auction_id)
    current_count = composition.get(player_position, 0)
    
    position_rules = squad_rules.get(player_position, {})
    max_allowed = position_rules.get('max')
    
    if max_allowed and current_count >= max_allowed:
        return False, f"Maximum {max_allowed} {player_position}(s) allowed"
    
    return True, ""
