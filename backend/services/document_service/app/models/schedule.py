from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.session import Base


class Schedule(Base):
    __tablename__ = "dokumen_jadwal"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, nullable=False)
    nama_kegiatan = Column(String(150), nullable=False)

    bulan_1 = Column(Integer, nullable=False, default=0)
    bulan_2 = Column(Integer, nullable=False, default=0)
    bulan_3 = Column(Integer, nullable=False, default=0)
    bulan_4 = Column(Integer, nullable=False, default=0)
    bulan_5 = Column(Integer, nullable=False, default=0)
    bulan_6 = Column(Integer, nullable=False, default=0)
    bulan_7 = Column(Integer, nullable=False, default=0)
    bulan_8 = Column(Integer, nullable=False, default=0)
    bulan_9 = Column(Integer, nullable=False, default=0)
    bulan_10 = Column(Integer, nullable=False, default=0)
    bulan_11 = Column(Integer, nullable=False, default=0)
    bulan_12 = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())