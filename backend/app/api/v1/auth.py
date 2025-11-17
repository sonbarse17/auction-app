from fastapi import APIRouter, HTTPException, Header, Depends, UploadFile, File
from pydantic import BaseModel
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.repositories import user_repo
from app.services.auth_service import hash_password, validate_password, create_tokens, decode_token
from typing import Annotated
import base64
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

class ProfileUpdateRequest(BaseModel):
    full_name: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

async def get_current_user(authorization: Annotated[str, Header()]) -> UserOut:
    token = authorization.replace("Bearer ", "")
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await user_repo.get_user_by_id(token_data.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    existing = await user_repo.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = hash_password(user.password)
    new_user = await user_repo.create_user(user, password_hash)
    await user_repo.assign_role(new_user.id, "team_owner")
    
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    user = await user_repo.get_user_by_email(credentials.email)
    if not user or not validate_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Account pending approval")
    
    user_data = await user_repo.get_user_by_id(user["id"])
    token = create_tokens(user["id"], user["email"], user_data.roles)
    
    return TokenResponse(
        access_token=token,
        user=user_data.model_dump()
    )

@router.get("/me", response_model=UserOut)
async def get_me(current_user: Annotated[UserOut, Depends(get_current_user)]):
    return current_user

@router.patch("/me", response_model=UserOut)
async def update_profile(user_update: UserUpdate, current_user: Annotated[UserOut, Depends(get_current_user)]):
    return await user_repo.update_user(current_user.id, user_update)

@router.post("/upload-photo", response_model=dict)
async def upload_photo(current_user: Annotated[UserOut, Depends(get_current_user)], file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    base64_image = base64.b64encode(contents).decode('utf-8')
    data_url = f"data:{file.content_type};base64,{base64_image}"
    
    updated_user = await user_repo.update_user(current_user.id, UserUpdate(profile_photo=data_url))
    
    return {"photo_url": data_url}

@router.put("/profile", response_model=UserOut)
async def update_profile_name(
    data: ProfileUpdateRequest,
    current_user: UserOut = Depends(get_current_user)
):
    return await user_repo.update_user(current_user.id, UserUpdate(full_name=data.full_name))

@router.put("/password")
async def change_password(data: PasswordChangeRequest, current_user: Annotated[UserOut, Depends(get_current_user)]):
    user = await user_repo.get_user_by_id(current_user.id)
    user_dict = dict(user)
    
    if not validate_password(data.current_password, user_dict["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hash_password(data.new_password)
    await user_repo.update_password(current_user.id, new_hash)
    
    return {"message": "Password changed successfully"}
