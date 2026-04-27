from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.db.session import Base


class Output(Base):
    __tablename__ = "dokumen_luaran"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, nullable=False)
    kategori_luaran = Column(Enum("wajib", "tambahan"), nullable=False)
    tahun_luaran = Column(Integer, nullable=False)
    jenis_luaran = Column(String(150), nullable=False)
    status_target = Column(String(100), nullable=False)
    keterangan = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())