from datetime import datetime
from pydantic import BaseModel


class FileDocumentResponse(BaseModel):
    id: int
    dokumen_id: int
    nama_file: str
    file_path: str
    tipe_file: str
    created_at: datetime

    class Config:
        from_attributes = True