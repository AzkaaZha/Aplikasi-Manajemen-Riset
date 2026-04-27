from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from app.db.session import Base


class Researcher(Base):
    __tablename__ = "dokumen_pengusul"

    id = Column(Integer, primary_key=True, index=True)
    dokumen_id = Column(Integer, nullable=False)
    nama = Column(String(150), nullable=False)
    peran = Column(Enum("ketua", "anggota"), nullable=False)
    institusi = Column(String(150), nullable=True)
    program_studi = Column(String(100), nullable=True)
    bidang_tugas = Column(String(150), nullable=True)
    id_sinta = Column(String(50), nullable=True)
    h_index = Column(Integer, nullable=True)
    nidn_nip_nim = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())