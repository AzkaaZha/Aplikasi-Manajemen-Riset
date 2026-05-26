from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.api.routes.document_helper import get_owned_document_or_404
from app.models.document import Document
from app.models.research import Research
from app.models.template import Template
from app.models.file_document import FileDocument
from app.schemas.document import (
    CreateDocumentRequest,
    DocumentResponse,
    UpdateDocumentRequest,
)
from app.schemas.document_related import RelatedDocumentsResponse
from app.schemas.document_package import ResearchPackageResponse
from app.models.researcher import Researcher
from app.models.partner import Partner
from app.models.output import Output
from app.models.schedule import Schedule
from app.models.budget import Budget
from app.models.document_content import DocumentContent
from app.models.template_field import TemplateField
from datetime import datetime
import os

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/", response_model=list[DocumentResponse])
def get_my_documents(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    documents = (
        db.query(Document).filter(Document.user_id == int(current_user["id"])).all()
    )

    return documents

@router.get("/my-documents-placeholder")
def placeholder():
    # Placeholder if any other routing relies on it, otherwise deleted.
    pass

    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposal tidak ditemukan",
        )

    laporan_kemajuan = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 2,
        )
        .order_by(Document.created_at.desc())
        .first()
    )

    laporan_akhir = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 3,
        )
        .order_by(Document.created_at.desc())
        .first()
    )

    return {
        "proposal": proposal,
        "laporan_kemajuan": laporan_kemajuan,
        "laporan_akhir": laporan_akhir,
    }

@router.post("/{proposal_id}/create-progress-report", response_model=DocumentResponse)
def create_progress_report_from_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    proposal = (
        db.query(Document)
        .filter(
            Document.id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 1,
        )
        .first()
    )

    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposal tidak ditemukan",
        )

    existing_report = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 2,
        )
        .first()
    )

    if existing_report:
        raise HTTPException(
            status_code=400,
            detail="Laporan kemajuan untuk proposal ini sudah ada",
        )

    template = get_active_template_or_404(
        jenis_dokumen_id=2,
        db=db,
    )

    new_report = Document(
        user_id=int(current_user["id"]),
        penelitian_id=proposal.penelitian_id,
        jenis_dokumen_id=2,
        template_id=template.id,
        parent_dokumen_id=proposal.id,
        judul=f"Laporan Kemajuan - {proposal.judul}",
        status_dokumen="draft",
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    copy_proposal_data_to_report(db, proposal.id, new_report.id, template.id)

    return new_report

@router.post("/{proposal_id}/create-final-report", response_model=DocumentResponse)
def create_final_report_from_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    proposal = (
        db.query(Document)
        .filter(
            Document.id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 1,
        )
        .first()
    )

    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposal tidak ditemukan",
        )

    existing_report = (
        db.query(Document)
        .filter(
            Document.parent_dokumen_id == proposal_id,
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 3,
        )
        .first()
    )

    if existing_report:
        raise HTTPException(
            status_code=400,
            detail="Laporan akhir untuk proposal ini sudah ada",
        )

    template = get_active_template_or_404(
        jenis_dokumen_id=3,
        db=db,
    )

    new_report = Document(
        user_id=int(current_user["id"]),
        penelitian_id=proposal.penelitian_id,
        jenis_dokumen_id=3,
        template_id=template.id,
        parent_dokumen_id=proposal.id,
        judul=f"Laporan Akhir - {proposal.judul}",
        status_dokumen="draft",
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    copy_proposal_data_to_report(db, proposal.id, new_report.id, template.id)

    return new_report

@router.get("/research-packages", response_model=list[ResearchPackageResponse])
def get_my_research_packages(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    proposals = (
        db.query(Document)
        .filter(
            Document.user_id == int(current_user["id"]),
            Document.jenis_dokumen_id == 1,
        )
        .order_by(Document.created_at.desc())
        .all()
    )

    result = []

    for proposal in proposals:
        laporan_kemajuan = (
            db.query(Document)
            .filter(
                Document.user_id == int(current_user["id"]),
                Document.parent_dokumen_id == proposal.id,
                Document.jenis_dokumen_id == 2,
            )
            .order_by(Document.created_at.desc())
            .first()
        )

        laporan_akhir = (
            db.query(Document)
            .filter(
                Document.user_id == int(current_user["id"]),
                Document.parent_dokumen_id == proposal.id,
                Document.jenis_dokumen_id == 3,
            )
            .order_by(Document.created_at.desc())
            .first()
        )

        from app.models.research import Research
        research = db.query(Research).filter(Research.id == proposal.penelitian_id).first()
        status_penelitian = research.status_penelitian if research else "draft"

        result.append(
            {
                "proposal": proposal,
                "laporan_kemajuan": laporan_kemajuan,
                "laporan_akhir": laporan_akhir,
                "status_penelitian": status_penelitian,
                "research_id": research.id if research else proposal.penelitian_id
            }
        )

    return result

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_detail(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = get_owned_document_or_404(db, document_id, current_user)

    return document

@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    payload: UpdateDocumentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == int(current_user["id"]))
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    if payload.judul is not None:
        document.judul = payload.judul

    document.terakhir_autosave = datetime.now()

    db.commit()
    db.refresh(document)

    return document

@router.post("/{document_id}/autosave")
def autosave_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == int(current_user["id"]))
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    document.terakhir_autosave = datetime.now()
    db.commit()
    db.refresh(document)

    return {
        "message": "Autosave berhasil",
        "document_id": document.id,
        "terakhir_autosave": document.terakhir_autosave,
    }

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == int(current_user["id"]),
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

    if document.jenis_dokumen_id == 1:
        child_documents = (
            db.query(Document)
            .filter(
                Document.penelitian_id == document.penelitian_id,
                Document.jenis_dokumen_id.in_([2, 3])
            )
            .all()
        )

        if child_documents:
            raise HTTPException(
                status_code=400,
                detail="Proposal tidak dapat dihapus karena sudah memiliki laporan kemajuan atau laporan akhir",
            )

    file_records = (
        db.query(FileDocument)
        .filter(FileDocument.dokumen_id == document.id)
        .all()
    )

    for file_record in file_records:
        if file_record.file_path and os.path.exists(file_record.file_path):
            os.remove(file_record.file_path)

        db.delete(file_record)

    research_id = document.penelitian_id

    db.delete(document)
    db.commit()

    # Recalculate research status after deletion
    if research_id:
        from app.services.document_helpers import recalculate_research_status
        recalculate_research_status(db, research_id)

    return {
        "message": "Dokumen berhasil dihapus",
        "document_id": document_id,
    }

def get_active_template_or_404(
    jenis_dokumen_id: int,
    db: Session,
):
    template = (
        db.query(Template)
        .filter(
            Template.jenis_dokumen_id == jenis_dokumen_id,
            Template.status_aktif == 1,
        )
        .order_by(Template.id.desc())
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Template aktif tidak ditemukan",
        )

    return template

def copy_proposal_data_to_report(
    db: Session,
    proposal_id: int,
    report_id: int,
    template_id: int
):
    # Copy IsiDokumen (mapping by nama_field)
    proposal_contents = (
        db.query(DocumentContent, TemplateField.nama_field)
        .join(TemplateField, DocumentContent.template_field_id == TemplateField.id)
        .filter(DocumentContent.dokumen_id == proposal_id)
        .all()
    )
    
    proposal_data_map = {nama_field: content.isi for content, nama_field in proposal_contents if content.isi}
    
    target_template_fields = db.query(TemplateField).filter(TemplateField.template_id == template_id).all()
    
    for field in target_template_fields:
        if field.nama_field in proposal_data_map:
            new_content = DocumentContent(
                dokumen_id=report_id,
                template_field_id=field.id,
                isi=proposal_data_map[field.nama_field]
            )
            db.add(new_content)

    # Copy Researchers
    researchers = db.query(Researcher).filter(Researcher.dokumen_id == proposal_id).all()
    for r in researchers:
        new_r = Researcher(
            dokumen_id=report_id,
            nama=r.nama, peran=r.peran, institusi=r.institusi,
            program_studi=r.program_studi, bidang_tugas=r.bidang_tugas,
            id_sinta=r.id_sinta, h_index=r.h_index, nidn_nip_nim=r.nidn_nip_nim
        )
        db.add(new_r)

    # Copy Partners
    partners = db.query(Partner).filter(Partner.dokumen_id == proposal_id).all()
    for p in partners:
        new_p = Partner(
            dokumen_id=report_id,
            nama_mitra=p.nama_mitra, jenis_mitra=p.jenis_mitra,
            alamat=p.alamat, keterangan=p.keterangan
        )
        db.add(new_p)

    # Copy Outputs
    outputs = db.query(Output).filter(Output.dokumen_id == proposal_id).all()
    for o in outputs:
        new_o = Output(
            dokumen_id=report_id,
            kategori_luaran=o.kategori_luaran, tahun_luaran=o.tahun_luaran,
            jenis_luaran=o.jenis_luaran, status_target=o.status_target,
            keterangan=o.keterangan
        )
        db.add(new_o)

    # Copy Schedules
    schedules = db.query(Schedule).filter(Schedule.dokumen_id == proposal_id).all()
    for s in schedules:
        new_s = Schedule(
            dokumen_id=report_id,
            nama_kegiatan=s.nama_kegiatan,
            bulan_1=s.bulan_1, bulan_2=s.bulan_2, bulan_3=s.bulan_3, bulan_4=s.bulan_4,
            bulan_5=s.bulan_5, bulan_6=s.bulan_6, bulan_7=s.bulan_7, bulan_8=s.bulan_8,
            bulan_9=s.bulan_9, bulan_10=s.bulan_10, bulan_11=s.bulan_11, bulan_12=s.bulan_12
        )
        db.add(new_s)

    # Copy Budgets
    budgets = db.query(Budget).filter(Budget.dokumen_id == proposal_id).all()
    for b in budgets:
        new_b = Budget(
            dokumen_id=report_id,
            jenis_pembelanjaan=b.jenis_pembelanjaan, item=b.item,
            satuan=b.satuan, volume=b.volume, biaya_satuan=b.biaya_satuan,
            total=b.total
        )
        db.add(new_b)

    db.commit()




    
