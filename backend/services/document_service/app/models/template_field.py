from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base


class TemplateField(Base):
    __tablename__ = "template_fields"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, nullable=False)
    nama_field = Column(String(100), nullable=False)
    label_field = Column(String(100), nullable=False)
    tipe_field = Column(String(30), nullable=False)
    opsi_field = Column(Text, nullable=True)
    wajib = Column(Integer, nullable=False, default=0)
    urutan = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())