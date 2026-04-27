from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RelatedDocumentItem(BaseModel):
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


class RelatedDocumentsResponse(BaseModel):
    proposal: RelatedDocumentItem
    laporan_kemajuan: Optional[RelatedDocumentItem] = None
    laporan_akhir: Optional[RelatedDocumentItem] = None