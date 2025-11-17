import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.config.settings import settings
from app.schemas.auth import TokenData
from typing import Optional

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def validate_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_tokens(user_id: int, email: str, roles: list[str]) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiration_minutes)
    payload = {
        "user_id": user_id,
        "email": email,
        "roles": roles,
        "exp": expire
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return TokenData(
            user_id=payload["user_id"],
            email=payload["email"],
            roles=payload["roles"]
        )
    except JWTError:
        return None
