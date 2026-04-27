from sqlalchemy import Column, Integer, String, DateTime, DECIMAL
from sqlalchemy.sql import func
from app.db.session import Base


class Budget(Base):
    __tablename__ = "dokumen_anggaran"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, nullable=False)
    jenis_pembelanjaan = Column(String(100), nullable=False)
    item = Column(String(150), nullable=False)
    satuan = Column(String(50), nullable=False)
    volume = Column(Integer, nullable=False, default=1)
    biaya_satuan = Column(DECIMAL(15, 2), nullable=False, default=0)
    total = Column(DECIMAL(15, 2), nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())