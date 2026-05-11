from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResearchCreate(BaseModel):
    judul_penelitian: str
    tahun: Optional[str] = None


class ResearchUpdate(BaseModel):
    judul_penelitian: Optional[str] = None
    tahun: Optional[str] = None
    status_penelitian: Optional[str] = None


class ResearchResponse(BaseModel):
    id: int
    user_id: int
    judul_penelitian: str
    tahun: Optional[str] = None
    status_penelitian: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True