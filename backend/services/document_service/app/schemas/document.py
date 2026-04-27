from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateDocumentRequest(BaseModel):
    jenis_dokumen_id: int
    template_id: int
    judul: str 
    parent_dokumen_id: int | None = None

class UpdateDocumentRequest(BaseModel):
    judul: str | None = None
    jenis_dokumen_id: int | None = None
    template_id: int | None = None

class DocumentResponse(BaseModel):
    id: int
    user_id: int
    jenis_dokumen_id: int
    template_id: int
    judul: str
    status_dokumen: str
    terakhir_autosave: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    parent_dokumen_id: int | None = None

    class Config:
        from_attributes = True