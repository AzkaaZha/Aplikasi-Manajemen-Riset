from fastapi import APIRouter, Depends
from app.models.user import User
from app.dependencies.auth import require_admin, require_dosen_or_admin

router = APIRouter(prefix="/protected", tags=["Protected"])


@router.get("/admin-only")
def admin_only(current_user: User = Depends(require_admin)):
    return {
        "message": "Halo admin, kamu berhasil masuk endpoint khusus admin",
        "user": current_user.nama,
        "role": current_user.role.nama
    }


@router.get("/dosen-or-admin")
def dosen_or_admin(current_user: User = Depends(require_dosen_or_admin)):
    return {
        "message": "Halo, endpoint ini bisa diakses admin atau dosen",
        "user": current_user.nama,
        "role": current_user.role.nama
    }