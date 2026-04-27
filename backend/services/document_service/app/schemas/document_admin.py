from datetime import datetime
from pydantic import BaseModel


class AdminDocumentItem(BaseModel):
    id: int
    user_id: int
    jenis_dokumen_id: int
    template_id: int
    judul: str
    status_dokumen: str | None = None
    terakhir_autosave: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class AdminDocumentListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[AdminDocumentItem]