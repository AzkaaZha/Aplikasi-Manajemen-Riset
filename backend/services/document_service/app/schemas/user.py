from pydantic import BaseModel, EmailStr
from typing import Optional
class RoleResponse(BaseModel):
    id: int
    nama: str
    class Config:
        from_attributes = True
class UserResponse(BaseModel):
    id: int
    role_id: int
    nama: str
    email: str
    nidn: Optional[str] = None
    no_hp: Optional[str] = None
    status_aktif: int
    role: Optional[RoleResponse] = None
    class Config:
        from_attributes = True
class LoginRequest(BaseModel):
    email: str
    password: str
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class CreateUserRequest(BaseModel):
    role_id: int
    nama: str
    email: str
    password: str
    nidn: Optional[str] = None
    no_hp: Optional[str] = None

class UpdateUserRequest(BaseModel):
    nama: Optional[str] = None
    role_id: Optional[int] = None
    no_hp: Optional[str] = None
    status_aktif: Optional[int] = None