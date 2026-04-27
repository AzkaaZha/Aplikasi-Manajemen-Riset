from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TemplateFieldResponse(BaseModel):
    id: int
    template_id: int
    nama_field: str
    label_field: str
    tipe_field: str
    opsi_field: str | None = None
    wajib: int
    urutan: int

    class Config:
        from_attributes = True

class SaveDocumentContentItem(BaseModel):
    template_field_id: int
    isi: Optional[str] = None

class SaveDocumentContentRequest(BaseModel):
    items: List[SaveDocumentContentItem]

class DocumentContentResponse(BaseModel):
    id: int
    dokumen_id: int
    template_field_id: int
    isi: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True