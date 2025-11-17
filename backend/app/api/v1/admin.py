from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.user import UserOut
from app.repositories import user_repo
from app.services.auth_service import decode_token
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

def get_admin_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user or 'admin' not in user.roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/users", response_model=List[UserOut])
async def list_users(admin=Depends(get_admin_user)):
    from app.db.connection import fetch_all
    rows = await fetch_all("SELECT id, email, full_name, profile_photo, created_at, updated_at FROM users ORDER BY id")
    users = []
    for row in rows:
        user_data = await user_repo.get_user_by_id(row['id'])
        if user_data:
            users.append(user_data)
    return users

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, admin=Depends(get_admin_user)):
    from app.db.connection import execute
    await execute("DELETE FROM users WHERE id = $1", user_id)
    return {"message": "User deleted"}

@router.post("/users/{user_id}/approve")
async def approve_user(user_id: int, admin=Depends(get_admin_user)):
    await user_repo.approve_user(user_id)
    return {"message": "User approved"}

@router.put("/users/{user_id}/roles")
async def update_roles(user_id: int, roles: List[str], admin=Depends(get_admin_user)):
    await user_repo.update_user_roles(user_id, roles)
    return {"message": "Roles updated"}
