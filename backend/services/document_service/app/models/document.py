from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class Document(Base):
    __tablename__ = "dokumen"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    jenis_dokumen_id = Column(Integer, nullable=False)
    template_id = Column(Integer, nullable=False)
    judul = Column(String(200), nullable=False)
    status_dokumen = Column(
        Enum("draft", "lengkap", "generated"),
        nullable=False,
        default="draft"
    )
    terakhir_autosave = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    parent_dokumen_id = Column(Integer, ForeignKey("dokumen.id", ondelete="SET NULL"), nullable=True)

