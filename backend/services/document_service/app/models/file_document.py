from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.session import Base


class FileDocument(Base):
    __tablename__ = "file_dokumen"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, ForeignKey("dokumen.id", ondelete="CASCADE"), nullable=False)
    nama_file = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    tipe_file = Column(String(20), nullable=False, default="pdf")
    created_at = Column(DateTime(timezone=True), server_default=func.now())