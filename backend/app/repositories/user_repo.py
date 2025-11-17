from app.db.connection import fetch_one, fetch_all, execute_returning, execute
from app.schemas.user import UserCreate, UserOut, UserUpdate
from typing import Optional

async def create_user(user: UserCreate, password_hash: str) -> UserOut:
    row = await execute_returning(
        """
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, full_name, profile_photo, is_approved, created_at, updated_at
        """,
        user.email, password_hash, user.full_name
    )
    return UserOut(**row, roles=[])

async def get_user_by_email(email: str) -> Optional[dict]:
    return await fetch_one(
        "SELECT id, email, password_hash, full_name, profile_photo, is_approved, created_at, updated_at FROM users WHERE email = $1",
        email
    )

async def get_user_by_id(user_id: int) -> Optional[UserOut]:
    row = await fetch_one(
        "SELECT id, email, full_name, profile_photo, is_approved, created_at, updated_at FROM users WHERE id = $1",
        user_id
    )
    if not row:
        return None
    
    roles = await fetch_all(
        """
        SELECT r.name FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1
        """,
        user_id
    )
    return UserOut(**row, roles=[r['name'] for r in roles])

async def update_user(user_id: int, user_update: UserUpdate) -> UserOut:
    updates = []
    params = []
    param_count = 1
    
    if user_update.full_name is not None:
        updates.append(f"full_name = ${param_count}")
        params.append(user_update.full_name)
        param_count += 1
    
    if user_update.profile_photo is not None:
        updates.append(f"profile_photo = ${param_count}")
        params.append(user_update.profile_photo)
        param_count += 1
    
    updates.append("updated_at = CURRENT_TIMESTAMP")
    params.append(user_id)
    
    row = await execute_returning(
        f"UPDATE users SET {', '.join(updates)} WHERE id = ${param_count} RETURNING id, email, full_name, profile_photo, is_approved, created_at, updated_at",
        *params
    )
    
    roles = await fetch_all(
        "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1",
        user_id
    )
    return UserOut(**row, roles=[r['name'] for r in roles])

async def assign_role(user_id: int, role_name: str):
    await execute(
        """
        INSERT INTO user_roles (user_id, role_id)
        SELECT $1, id FROM roles WHERE name = $2
        ON CONFLICT DO NOTHING
        """,
        user_id, role_name
    )

async def approve_user(user_id: int):
    await execute("UPDATE users SET is_approved = TRUE WHERE id = $1", user_id)

async def update_user_roles(user_id: int, role_names: list[str]):
    await execute("DELETE FROM user_roles WHERE user_id = $1", user_id)
    for role_name in role_names:
        await assign_role(user_id, role_name)

async def update_password(user_id: int, password_hash: str):
    await execute("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", password_hash, user_id)
