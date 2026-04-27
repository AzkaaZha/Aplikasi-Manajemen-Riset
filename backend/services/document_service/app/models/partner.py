from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.db.session import Base


class Partner(Base):
    __tablename__ = "dokumen_mitra"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, nullable=False)
    nama_mitra = Column(String(150), nullable=False)
    jenis_mitra = Column(String(100), nullable=True)
    alamat = Column(Text, nullable=True)
    keterangan = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())