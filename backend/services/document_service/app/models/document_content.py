from sqlalchemy import Column, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base


class DocumentContent(Base):
    __tablename__ = "isi_dokumen"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, nullable=False)
    template_field_id = Column(Integer, nullable=False)
    isi = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())