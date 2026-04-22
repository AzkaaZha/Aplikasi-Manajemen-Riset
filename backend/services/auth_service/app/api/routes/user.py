from fastapi import APIRouter, Depends
from sqlalchemy.orm import session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.user import CreateUserRequest
from app.schemas.user import UpdateUserRequest
from fastapi import HTTPException
from app.dependencies.auth import require_admin
from app.core.security import hash_password
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=list[UserResponse])
def get_users(db: session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.post("/", response_model=UserResponse)
def create_user(
    payload: CreateUserRequest,
    db: session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email sudah digunakan")

    new_user = User(
        role_id=payload.role_id,
        nama=payload.nama,
        email=payload.email,
        password=hash_password(payload.password),
        nidn=payload.nidn,
        no_hp=payload.no_hp,
        status_aktif=1
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/", response_model=list[UserResponse])
def get_all_users(
    db: session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(User).all()

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UpdateUserRequest,
    db: session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if payload.nama:
        user.nama = payload.nama
    if payload.role_id:
        user.role_id = payload.role_id
    if payload.no_hp:
        user.no_hp = payload.no_hp
    if payload.status_aktif is not None:
        user.status_aktif = payload.status_aktif

    db.commit()
    db.refresh(user)

    return user

@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    db: session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.status_aktif = 0
    db.commit()

    return {"message": "User berhasil dinonaktifkan"}