from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.player import PlayerCreate, PlayerOut, PlayerUpdate
from app.repositories import player_repo
from app.services.auth_service import decode_token
from typing import List

router = APIRouter(prefix="/players", tags=["players"])

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("", response_model=PlayerOut)
async def create_player(player: PlayerCreate, user=Depends(get_current_user)):
    return await player_repo.create_player(player)

@router.get("", response_model=List[PlayerOut])
async def get_players():
    return await player_repo.list_players()

@router.get("/{player_id}", response_model=PlayerOut)
async def get_player(player_id: int):
    player = await player_repo.get_player(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.patch("/{player_id}", response_model=PlayerOut)
async def update_player(player_id: int, update: PlayerUpdate, user=Depends(get_current_user)):
    player = await player_repo.update_player(player_id, update)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.delete("/{player_id}")
async def delete_player(player_id: int, user=Depends(get_current_user)):
    await player_repo.delete_player(player_id)
    return {"message": "Player deleted"}
