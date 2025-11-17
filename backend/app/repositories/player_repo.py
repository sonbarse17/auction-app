from app.db.connection import fetch_one, fetch_all, execute_returning, execute, get_pool
from app.schemas.player import PlayerCreate, PlayerOut, PlayerUpdate
from typing import List, Optional
import json
import csv
import io

async def create_player(player: PlayerCreate) -> PlayerOut:
    row = await execute_returning(
        """
        INSERT INTO players (name, sport, position, base_price, reserve_price, rating, image_url, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        """,
        player.name, player.sport, player.position, player.base_price, player.reserve_price,
        player.rating, player.image_url, json.dumps(player.metadata) if player.metadata else None
    )
    return PlayerOut(**row)

async def get_player(player_id: int) -> Optional[PlayerOut]:
    row = await fetch_one("SELECT * FROM players WHERE id = $1", player_id)
    return PlayerOut(**row) if row else None

async def list_players() -> List[PlayerOut]:
    rows = await fetch_all("SELECT * FROM players ORDER BY name")
    return [PlayerOut(**row) for row in rows]

async def update_player(player_id: int, update: PlayerUpdate) -> Optional[PlayerOut]:
    updates = {k: v for k, v in update.model_dump(exclude_unset=True).items()}
    if not updates:
        return await get_player(player_id)
    
    if 'metadata' in updates and updates['metadata']:
        updates['metadata'] = json.dumps(updates['metadata'])
    
    set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(updates.keys())])
    query = f"UPDATE players SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *"
    
    row = await execute_returning(query, player_id, *updates.values())
    return PlayerOut(**row) if row else None

async def delete_player(player_id: int) -> bool:
    result = await execute("DELETE FROM players WHERE id = $1", player_id)
    return result == "DELETE 1"

async def bulk_insert_from_csv(csv_content: str) -> int:
    pool = get_pool()
    reader = csv.DictReader(io.StringIO(csv_content))
    count = 0
    
    async with pool.acquire() as conn:
        async with conn.transaction():
            for row in reader:
                await conn.execute(
                    """
                    INSERT INTO players (name, sport, position, base_price, rating, image_url, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    row.get('name'),
                    row.get('sport'),
                    row.get('position'),
                    float(row.get('base_price', 0)),
                    float(row.get('rating')) if row.get('rating') else None,
                    row.get('image_url'),
                    json.dumps({k: v for k, v in row.items() if k not in ['name', 'sport', 'position', 'base_price', 'rating', 'image_url']}) if len(row) > 6 else None
                )
                count += 1
    
    return count
