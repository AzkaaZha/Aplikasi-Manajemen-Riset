from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PackageDocumentItem(BaseModel):
    id: int
    user_id: int
    jenis_dokumen_id: int
    template_id: int
    parent_dokumen_id: Optional[int] = None
    judul: str
    status_dokumen: Optional[str] = None
    terakhir_autosave: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResearchPackageResponse(BaseModel):
    proposal: PackageDocumentItem
    laporan_kemajuan: Optional[PackageDocumentItem] = None
    laporan_akhir: Optional[PackageDocumentItem] = None