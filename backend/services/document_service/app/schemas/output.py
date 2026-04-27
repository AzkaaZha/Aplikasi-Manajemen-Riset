from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class CreateOutputRequest(BaseModel):
    kategori_luaran: Literal["wajib", "tambahan"]
    tahun_luaran: int
    jenis_luaran: str
    status_target: str
    keterangan: Optional[str] = None

class UpdateOutputRequest(BaseModel):
    kategori_luaran: Optional[Literal["wajib", "tambahan"]] = None
    tahun_luaran: Optional[int] = None
    jenis_luaran: Optional[str] = None
    status_target: Optional[str] = None
    keterangan: Optional[str] = None

class OutputResponse(BaseModel):
    id: int
    dokumen_id: int
    kategori_luaran: str
    tahun_luaran: int
    jenis_luaran: str
    status_target: str
    keterangan: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True