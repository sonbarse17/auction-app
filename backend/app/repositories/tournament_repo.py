from app.db.connection import fetch_one, fetch_all, execute_returning
from app.schemas.tournament import TournamentCreate, TournamentOut, TournamentUpdate
from typing import List, Optional

async def create_tournament(tournament: TournamentCreate, user_id: int) -> TournamentOut:
    import json
    squad_rules_json = json.dumps(tournament.squad_rules) if tournament.squad_rules else None
    row = await execute_returning(
        """
        INSERT INTO tournaments (name, description, start_date, end_date, squad_rules, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, description, start_date, end_date, status, squad_rules, created_by, created_at, updated_at
        """,
        tournament.name, tournament.description, tournament.start_date, tournament.end_date, squad_rules_json, user_id
    )
    data = dict(row)
    if data.get('squad_rules') and isinstance(data['squad_rules'], str):
        data['squad_rules'] = json.loads(data['squad_rules'])
    return TournamentOut(**data)

async def get_tournament(tournament_id: int) -> Optional[TournamentOut]:
    import json
    row = await fetch_one(
        "SELECT * FROM tournaments WHERE id = $1",
        tournament_id
    )
    if row:
        data = dict(row)
        if data.get('squad_rules') and isinstance(data['squad_rules'], str):
            data['squad_rules'] = json.loads(data['squad_rules'])
        return TournamentOut(**data)
    return None

async def list_tournaments() -> List[TournamentOut]:
    import json
    rows = await fetch_all("SELECT * FROM tournaments ORDER BY created_at DESC")
    result = []
    for row in rows:
        data = dict(row)
        if data.get('squad_rules') and isinstance(data['squad_rules'], str):
            data['squad_rules'] = json.loads(data['squad_rules'])
        result.append(TournamentOut(**data))
    return result

async def update_tournament(tournament_id: int, update: TournamentUpdate) -> Optional[TournamentOut]:
    updates = {k: v for k, v in update.model_dump(exclude_unset=True).items()}
    if not updates:
        return await get_tournament(tournament_id)
    
    set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(updates.keys())])
    query = f"UPDATE tournaments SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *"
    
    row = await execute_returning(query, tournament_id, *updates.values())
    return TournamentOut(**row) if row else None
