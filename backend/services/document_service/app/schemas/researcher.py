from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class CreateResearcherRequest(BaseModel):
    nama: str
    peran: Literal["ketua", "anggota"]
    institusi: Optional[str] = None
    program_studi: Optional[str] = None
    bidang_tugas: Optional[str] = None
    id_sinta: Optional[str] = None
    h_index: Optional[int] = None
    nidn_nip_nim: Optional[str] = None


class UpdateResearcherRequest(BaseModel):
    nama: Optional[str] = None
    peran: Optional[Literal["ketua", "anggota"]] = None
    institusi: Optional[str] = None
    program_studi: Optional[str] = None
    bidang_tugas: Optional[str] = None
    id_sinta: Optional[str] = None
    h_index: Optional[int] = None
    nidn_nip_nim: Optional[str] = None


class ResearcherResponse(BaseModel):
    id: int
    dokumen_id: int
    nama: str
    peran: str
    institusi: Optional[str] = None
    program_studi: Optional[str] = None
    bidang_tugas: Optional[str] = None
    id_sinta: Optional[str] = None
    h_index: Optional[int] = None
    nidn_nip_nim: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True