from app.db.connection import fetch_one, fetch_all, execute_returning, execute
from app.schemas.team import TeamCreate, TeamOut
from typing import List, Optional
from decimal import Decimal

async def create_team(team: TeamCreate, owner_id: int) -> TeamOut:
    row = await execute_returning(
        """
        INSERT INTO teams (tournament_id, name, owner_id, budget, remaining_budget, max_players)
        VALUES ($1, $2, $3, $4, $4, $5)
        RETURNING *
        """,
        team.tournament_id, team.name, owner_id, team.budget, team.max_players
    )
    return TeamOut(**row)

async def get_team(team_id: int) -> Optional[TeamOut]:
    row = await fetch_one("SELECT * FROM teams WHERE id = $1", team_id)
    return TeamOut(**row) if row else None

async def list_teams_by_tournament(tournament_id: int) -> List[TeamOut]:
    rows = await fetch_all("SELECT * FROM teams WHERE tournament_id = $1", tournament_id)
    return [TeamOut(**row) for row in rows]

async def list_teams_by_owner(owner_id: int) -> List[TeamOut]:
    rows = await fetch_all("SELECT * FROM teams WHERE owner_id = $1", owner_id)
    return [TeamOut(**row) for row in rows]

async def update_team_budget(team_id: int, amount: Decimal) -> bool:
    result = await execute(
        "UPDATE teams SET remaining_budget = remaining_budget - $1 WHERE id = $2",
        amount, team_id
    )
    return result == "UPDATE 1"

async def get_team_by_owner(tournament_id: int, owner_id: int) -> Optional[TeamOut]:
    row = await fetch_one(
        "SELECT * FROM teams WHERE tournament_id = $1 AND owner_id = $2",
        tournament_id, owner_id
    )
    return TeamOut(**row) if row else None
