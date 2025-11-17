from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.team import TeamCreate, TeamOut
from app.repositories import team_repo
from app.services.auth_service import decode_token
from typing import List

router = APIRouter(prefix="/teams", tags=["teams"])

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("", response_model=TeamOut)
async def create_team(team: TeamCreate, user=Depends(get_current_user)):
    return await team_repo.create_team(team, user.user_id)

@router.get("/my-teams", response_model=List[TeamOut])
async def get_my_teams(user=Depends(get_current_user)):
    return await team_repo.list_teams_by_owner(user.user_id)

@router.get("/tournament/{tournament_id}", response_model=List[TeamOut])
async def get_tournament_teams(tournament_id: int):
    return await team_repo.list_teams_by_tournament(tournament_id)

@router.get("/{team_id}", response_model=TeamOut)
async def get_team(team_id: int):
    team = await team_repo.get_team(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team
