from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreatePartnerRequest(BaseModel):
    nama_mitra: str
    jenis_mitra: Optional[str] = None
    alamat: Optional[str] = None
    keterangan: Optional[str] = None


class UpdatePartnerRequest(BaseModel):
    nama_mitra: Optional[str] = None
    jenis_mitra: Optional[str] = None
    alamat: Optional[str] = None
    keterangan: Optional[str] = None


class PartnerResponse(BaseModel):
    id: int
    dokumen_id: int
    nama_mitra: str
    jenis_mitra: Optional[str] = None
    alamat: Optional[str] = None
    keterangan: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True