from fastapi import APIRouter, HTTPException, Header, Depends
from app.schemas.tournament import TournamentCreate, TournamentOut, TournamentUpdate
from app.repositories import tournament_repo
from app.services.auth_service import decode_token
from typing import List

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("", response_model=TournamentOut)
async def create_tournament(tournament: TournamentCreate, user=Depends(get_current_user)):
    return await tournament_repo.create_tournament(tournament, user.user_id)

@router.get("", response_model=List[TournamentOut])
async def get_tournaments():
    return await tournament_repo.list_tournaments()

@router.get("/{tournament_id}", response_model=TournamentOut)
async def get_tournament(tournament_id: int):
    tournament = await tournament_repo.get_tournament(tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@router.patch("/{tournament_id}", response_model=TournamentOut)
async def update_tournament(tournament_id: int, update: TournamentUpdate, user=Depends(get_current_user)):
    tournament = await tournament_repo.update_tournament(tournament_id, update)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament
