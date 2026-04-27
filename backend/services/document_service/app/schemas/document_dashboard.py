from datetime import datetime
from pydantic import BaseModel


class LatestDocumentItem(BaseModel):
    id: int
    judul: str
    status_dokumen: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class DocumentDashboardSummaryResponse(BaseModel):
    total_dokumen: int
    total_draft: int
    total_lengkap: int
    total_file_pdf: int
    dokumen_terbaru: list[LatestDocumentItem]