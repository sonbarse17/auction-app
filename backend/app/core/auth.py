from fastapi import Header, HTTPException
from app.services.auth_service import decode_token

def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
