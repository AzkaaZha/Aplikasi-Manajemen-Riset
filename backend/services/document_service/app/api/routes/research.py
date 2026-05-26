from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.research import Research
from app.models.researcher import Researcher
from app.models.partner import Partner
from app.models.schedule import Schedule
from app.models.budget import Budget
from app.models.output import Output
from app.models.document_content import DocumentContent
from app.models.template_field import TemplateField
from app.models.document import Document
from app.models.template import Template
from app.schemas.research import ResearchCreate, ResearchUpdate, ResearchResponse
from app.schemas.document import CreateDocumentRequest, DocumentResponse
from app.schemas.document_full import DocumentFullDetailResponse
from app.services.document_helpers import recalculate_research_status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class DocumentContentItem(BaseModel):
    template_field_id: int
    isi: str | None = None

class NestedDocumentUpdateRequest(BaseModel):
    judul: Optional[str] = None
    status_dokumen: Optional[str] = None
    items: Optional[List[DocumentContentItem]] = None
router = APIRouter(prefix="/researches", tags=["Researches"])

def get_owned_research_or_404(
    db: Session,
    research_id: int,
    current_user
):
    research = (
        db.query(Research)
        .filter(
            Research.id == research_id,
            Research.user_id == current_user["id"]
        )
        .first()
    )

    if not research:
        raise HTTPException(
            status_code=404,
            detail="Penelitian tidak ditemukan"
        )

    return research

def get_active_template_or_404(
    db: Session,
    jenis_dokumen_id: int
):
    template = (
        db.query(Template)
        .filter(
            Template.jenis_dokumen_id == jenis_dokumen_id,
            Template.status_aktif == 1
        )
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Template aktif tidak ditemukan"
        )

    return template

@router.post("/", response_model=ResearchResponse)
def create_research(
    payload: ResearchCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = Research(
        user_id=current_user["id"],
        judul_penelitian=payload.judul_penelitian,
        tahun=payload.tahun,
        status_penelitian="draft"
    )

    db.add(research)
    db.commit()
    db.refresh(research)

    return research

@router.get("/")
def list_researches(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    GET /researches/
    Mengembalikan daftar penelitian milik user dengan alias penelitian_id yang eksplisit.
    """
    print(f"[GET /researches/] Dipanggil oleh user_id={current_user['id']}")

    researches = (
        db.query(Research)
        .filter(Research.user_id == current_user["id"])
        .order_by(Research.created_at.desc())
        .all()
    )

    result = []
    for r in researches:
        jumlah_dokumen = db.query(Document).filter(Document.penelitian_id == r.id).count()
        result.append({
            "id": r.id,                          
            "penelitian_id": r.id,               
            "user_id": r.user_id,
            "judul_penelitian": r.judul_penelitian,
            "tahun": r.tahun,
            "status_penelitian": r.status_penelitian,
            "jumlah_dokumen": jumlah_dokumen,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        })

    print(f"[GET /researches/] Mengembalikan {len(result)} penelitian")
    return result

@router.get("/{research_id}", response_model=ResearchResponse)
def get_research(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = (
        db.query(Research)
        .filter(
            Research.id == research_id,
            Research.user_id == current_user["id"]
        )
        .first()
    )

    if not research:
        raise HTTPException(status_code=404, detail="Penelitian tidak ditemukan")

    return research

@router.put("/{research_id}", response_model=ResearchResponse)
def update_research(
    research_id: int,
    payload: ResearchUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = (
        db.query(Research)
        .filter(
            Research.id == research_id,
            Research.user_id == current_user["id"]
        )
        .first()
    )

    if not research:
        raise HTTPException(status_code=404, detail="Penelitian tidak ditemukan")

    if payload.judul_penelitian is not None:
        research.judul_penelitian = payload.judul_penelitian

    if payload.tahun is not None:
        research.tahun = payload.tahun


    db.commit()
    db.refresh(research)

    return research

@router.delete("/{research_id}")
def delete_research(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    DELETE /researches/{research_id}
    Menghapus penelitian beserta SEMUA dokumen terkait berdasarkan penelitian.id.
    PENTING: research_id di sini adalah penelitian.id, BUKAN dokumen.id.
    """
    print(f"[DELETE /researches/{research_id}] Dipanggil oleh user_id={current_user['id']}")
    print(f"[DELETE /researches/{research_id}] Mencari penelitian dengan id={research_id}")

    research = (
        db.query(Research)
        .filter(
            Research.id == research_id,
            Research.user_id == current_user["id"]
        )
        .first()
    )

    if not research:
        print(f"[DELETE /researches/{research_id}] ERROR: Penelitian tidak ditemukan")
        raise HTTPException(status_code=404, detail="Penelitian tidak ditemukan")

    print(f"[DELETE /researches/{research_id}] Ditemukan: '{research.judul_penelitian}'")

    related_documents = (
        db.query(Document)
        .filter(Document.penelitian_id == research_id)
        .all()
    )
    print(f"[DELETE /researches/{research_id}] Menghapus {len(related_documents)} dokumen terkait")

    for doc in related_documents:
        print(f"[DELETE /researches/{research_id}]   - Menghapus dokumen.id={doc.id} ({doc.judul})")
        db.delete(doc)

    db.flush()  

    db.delete(research)
    db.commit()

    print(f"[DELETE /researches/{research_id}] Penelitian dan dokumen terkait berhasil dihapus")
    return {
        "message": "Penelitian berhasil dihapus",
        "penelitian_id": research_id,
        "jumlah_dokumen_dihapus": len(related_documents)
    }

@router.get("/{research_id}/documents")
def get_research_documents(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    GET /researches/{research_id}/documents
    Mengembalikan detail penelitian beserta semua dokumen miliknya.
    Menggunakan alias dokumen_id dan penelitian_id yang eksplisit.
    """
    research = get_owned_research_or_404(db, research_id, current_user)

    documents = (
        db.query(Document)
        .filter(Document.penelitian_id == research.id)
        .all()
    )

    def doc_to_dict(doc):
        """Konversi dokumen ke dict dengan alias yang jelas."""
        return {
            "id": doc.id,
            "dokumen_id": doc.id,
            "penelitian_id": doc.penelitian_id,
            "jenis_dokumen_id": doc.jenis_dokumen_id,
            "template_id": doc.template_id,
            "judul": doc.judul,
            "status_dokumen": doc.status_dokumen,
            "terakhir_autosave": doc.terakhir_autosave,
            "created_at": doc.created_at,
            "is_created": True,
        }

    result = {
        "proposal": None,
        "laporan_kemajuan": None,
        "laporan_akhir": None,
    }

    for document in documents:
        if document.jenis_dokumen_id == 1:
            result["proposal"] = doc_to_dict(document)
        elif document.jenis_dokumen_id == 2:
            result["laporan_kemajuan"] = doc_to_dict(document)
        elif document.jenis_dokumen_id == 3:
            result["laporan_akhir"] = doc_to_dict(document)

    return {
        "research": {
            "id": research.id,
            "penelitian_id": research.id,
            "judul_penelitian": research.judul_penelitian,
            "tahun": research.tahun,
            "status_penelitian": research.status_penelitian
        },
        "documents": result
    }

class ActiveTemplateFieldItem(BaseModel):
    template_field_id: int
    nama_field: str
    label_field: str
    tipe_field: str
    wajib: int
    isi: str | None = None

class ActiveTemplateResponse(BaseModel):
    template_id: int
    jenis_dokumen_id: int
    fields: List[ActiveTemplateFieldItem]

@router.get("/templates/active/{jenis_dokumen_id}", response_model=ActiveTemplateResponse)
def get_active_template_fields(
    jenis_dokumen_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    GET /researches/templates/active/{jenis_dokumen_id}
    Mengambil template aktif beserta field-nya untuk mode create di frontend.
    """
    template = get_active_template_or_404(db, jenis_dokumen_id)
    fields = (
        db.query(TemplateField)
        .filter(TemplateField.template_id == template.id)
        .order_by(TemplateField.urutan.asc())
        .all()
    )
    field_items = []
    for field in fields:
        field_items.append({
            "template_field_id": field.id,
            "nama_field": field.nama_field,
            "label_field": field.label_field,
            "tipe_field": field.tipe_field,
            "wajib": field.wajib,
            "isi": ""
        })
    return {
        "template_id": template.id,
        "jenis_dokumen_id": template.jenis_dokumen_id,
        "fields": field_items
    }

@router.post("/{research_id}/documents", response_model=DocumentResponse)
def create_nested_document(
    research_id: int,
    payload: CreateDocumentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    POST /researches/{research_id}/documents
    Membuat dokumen baru di bawah sebuah penelitian.
    """
    research = get_owned_research_or_404(db, research_id, current_user)
    

    existing_doc = (
        db.query(Document)
        .filter(
            Document.penelitian_id == research.id,
            Document.jenis_dokumen_id == payload.jenis_dokumen_id
        )
        .first()
    )
    if existing_doc:
        raise HTTPException(
            status_code=400,
            detail="Dokumen jenis ini untuk penelitian ini sudah dibuat"
        )
        
    template = get_active_template_or_404(db, jenis_dokumen_id=payload.jenis_dokumen_id)
    
    parent_id = None
    if payload.jenis_dokumen_id in [2, 3]:
        proposal = (
            db.query(Document)
            .filter(
                Document.penelitian_id == research.id,
                Document.jenis_dokumen_id == 1
            )
            .first()
        )
        if not proposal:
            raise HTTPException(
                status_code=400,
                detail="Proposal harus dibuat terlebih dahulu"
            )
        parent_id = proposal.id

    document = Document(
        penelitian_id=research.id,
        user_id=current_user["id"],
        jenis_dokumen_id=payload.jenis_dokumen_id,
        template_id=template.id,
        parent_dokumen_id=parent_id,
        judul=payload.judul,
        status_dokumen="draft"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    if parent_id and payload.jenis_dokumen_id in [2, 3]:
        copy_document_data(db, parent_id, document.id, template.id)
        
    recalculate_research_status(db, research.id)
    return document

@router.get("/{research_id}/documents/{document_id}", response_model=DocumentFullDetailResponse)
def get_nested_document_full_detail(
    research_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    GET /researches/{research_id}/documents/{document_id}
    Mengambil detail lengkap dokumen. Validasi penelitian_id sangat penting.
    """
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.penelitian_id == research_id,
            Document.user_id == current_user["id"]
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan atau tidak valid untuk penelitian ini")

    fields = db.query(TemplateField).filter(TemplateField.template_id == document.template_id).order_by(TemplateField.urutan.asc()).all()
    contents = db.query(DocumentContent).filter(DocumentContent.dokumen_id == document_id).all()
    content_map = {c.template_field_id: c.isi for c in contents}

    field_items = []
    for field in fields:
        field_items.append({
            "template_field_id": field.id,
            "nama_field": field.nama_field,
            "label_field": field.label_field,
            "tipe_field": field.tipe_field,
            "wajib": field.wajib,
            "isi": content_map.get(field.id),
        })

    budgets = db.query(Budget).filter(Budget.dokumen_id == document_id).all()
    schedules = db.query(Schedule).filter(Schedule.dokumen_id == document_id).all()
    outputs = db.query(Output).filter(Output.dokumen_id == document_id).all()
    researchers = db.query(Researcher).filter(Researcher.dokumen_id == document_id).all()
    partners = db.query(Partner).filter(Partner.dokumen_id == document_id).all()

    return {
        "id": document.id,
        "user_id": document.user_id,
        "jenis_dokumen_id": document.jenis_dokumen_id,
        "template_id": document.template_id,
        "judul": document.judul,
        "status_dokumen": document.status_dokumen,
        "terakhir_autosave": document.terakhir_autosave,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "parent_dokumen_id": document.parent_dokumen_id,
        "penelitian_id": document.penelitian_id,
        "fields": field_items,
        "budgets": budgets,
        "schedules": schedules,
        "outputs": outputs,
        "researchers": researchers,
        "partners": partners,
    }

@router.put("/{research_id}/documents/{document_id}")
def update_nested_document(
    research_id: int,
    document_id: int,
    payload: NestedDocumentUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    PUT /researches/{research_id}/documents/{document_id}
    Mengupdate judul, status, dan isi dokumen sekaligus.
    """
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.penelitian_id == research_id,
            Document.user_id == current_user["id"]
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan atau tidak valid untuk penelitian ini")

    if payload.judul is not None:
        document.judul = payload.judul
    if payload.status_dokumen is not None:
        document.status_dokumen = payload.status_dokumen
        
    document.terakhir_autosave = datetime.now()

    if payload.items:
        for item in payload.items:

            content = (
                db.query(DocumentContent)
                .filter(
                    DocumentContent.dokumen_id == document_id,
                    DocumentContent.template_field_id == item.template_field_id
                )
                .first()
            )
            if content:
                content.isi = item.isi
            else:
                new_content = DocumentContent(
                    dokumen_id=document_id,
                    template_field_id=item.template_field_id,
                    isi=item.isi
                )
                db.add(new_content)

    db.commit()
    db.refresh(document)
    recalculate_research_status(db, research_id)
    return {"message": "Dokumen berhasil diupdate", "document_id": document.id}

@router.delete("/{research_id}/documents/{document_id}")
def delete_nested_document(
    research_id: int,
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    DELETE /researches/{research_id}/documents/{document_id}
    Menghapus dokumen tertentu.
    """
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.penelitian_id == research_id,
            Document.user_id == current_user["id"]
        )
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan atau tidak valid")
        
    if document.jenis_dokumen_id == 1:
        child_documents = db.query(Document).filter(Document.parent_dokumen_id == document.id).all()
        if child_documents:
            raise HTTPException(
                status_code=400,
                detail="Proposal tidak dapat dihapus karena sudah memiliki laporan kemajuan atau akhir"
            )

    db.delete(document)
    db.commit()
    recalculate_research_status(db, research_id)
    
    return {"message": "Dokumen berhasil dihapus", "document_id": document_id}




@router.post("/{research_id}/documents/proposal")
def create_proposal_document(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = get_owned_research_or_404(db, research_id, current_user)

    existing_proposal = (
        db.query(Document)
        .filter(
            Document.penelitian_id == research.id,
            Document.jenis_dokumen_id == 1
        )
        .first()
    )

    if existing_proposal:
        raise HTTPException(
            status_code=400,
            detail="Proposal untuk penelitian ini sudah dibuat"
        )

    template = get_active_template_or_404(db, jenis_dokumen_id=1)

    document = Document(
        penelitian_id=research.id,
        user_id=current_user["id"],
        jenis_dokumen_id=1,
        template_id=template.id,
        judul=f"Proposal - {research.judul_penelitian}",
        status_dokumen="draft",
        parent_dokumen_id=None
    )

    db.add(document)
    db.commit()
    db.refresh(document)


    recalculate_research_status(db, research.id)

    return {
        "message": "Proposal berhasil dibuat",
        "document": {
            "id": document.id,
            "penelitian_id": document.penelitian_id,
            "user_id": document.user_id,
            "jenis_dokumen_id": document.jenis_dokumen_id,
            "template_id": document.template_id,
            "judul": document.judul,
            "status_dokumen": document.status_dokumen
        }
    }

@router.post("/{research_id}/documents/progress-report")
def create_progress_report_document(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = get_owned_research_or_404(db, research_id, current_user)

    proposal = (
        db.query(Document)
        .filter(
            Document.penelitian_id == research.id,
            Document.jenis_dokumen_id == 1
        )
        .first()
    )

    if not proposal:
        raise HTTPException(
            status_code=400,
            detail="Proposal harus dibuat terlebih dahulu"
        )

    existing_progress = (
        db.query(Document)
        .filter(
            Document.penelitian_id == research.id,
            Document.jenis_dokumen_id == 2
        )
        .first()
    )

    if existing_progress:
        raise HTTPException(
            status_code=400,
            detail="Laporan kemajuan untuk penelitian ini sudah dibuat"
        )

    template = get_active_template_or_404(db, jenis_dokumen_id=2)

    document = Document(
        penelitian_id=research.id,
        user_id=current_user["id"],
        jenis_dokumen_id=2,
        template_id=template.id,
        judul=f"Laporan Kemajuan - {research.judul_penelitian}",
        status_dokumen="draft"
    )

    db.add(document)
    db.commit()
    db.refresh(document)


    recalculate_research_status(db, research.id)


    copy_document_data(db, proposal.id, document.id, template.id)

    return {
        "message": "Laporan kemajuan berhasil dibuat",
        "document": {
            "id": document.id,
            "penelitian_id": document.penelitian_id,
            "user_id": document.user_id,
            "jenis_dokumen_id": document.jenis_dokumen_id,
            "template_id": document.template_id,
            "judul": document.judul,
            "status_dokumen": document.status_dokumen
        }
    }

@router.post("/{research_id}/documents/final-report")
def create_final_report_document(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = get_owned_research_or_404(db, research_id, current_user)

    proposal = (
        db.query(Document)
        .filter(
            Document.penelitian_id == research.id,
            Document.jenis_dokumen_id == 1
        )
        .first()
    )

    if not proposal:
        raise HTTPException(
            status_code=400,
            detail="Proposal harus dibuat terlebih dahulu"
        )

    existing_final = (
        db.query(Document)
        .filter(
            Document.penelitian_id == research.id,
            Document.jenis_dokumen_id == 3
        )
        .first()
    )

    if existing_final:
        raise HTTPException(
            status_code=400,
            detail="Laporan akhir untuk penelitian ini sudah dibuat"
        )

    template = get_active_template_or_404(db, jenis_dokumen_id=3)

    document = Document(
        penelitian_id=research.id,
        user_id=current_user["id"],
        jenis_dokumen_id=3,
        template_id=template.id,
        judul=f"Laporan Akhir - {research.judul_penelitian}",
        status_dokumen="draft"
    )

    db.add(document)
    db.commit()
    db.refresh(document)


    recalculate_research_status(db, research.id)


    copy_document_data(db, proposal.id, document.id, template.id)

    return {
        "message": "Laporan akhir berhasil dibuat",
        "document": {
            "id": document.id,
            "penelitian_id": document.penelitian_id,
            "user_id": document.user_id,
            "jenis_dokumen_id": document.jenis_dokumen_id,
            "template_id": document.template_id,
            "judul": document.judul,
            "status_dokumen": document.status_dokumen
        }
    }

def copy_document_data(db: Session, source_dokumen_id: int, target_dokumen_id: int, target_template_id: int):

    for r in db.query(Researcher).filter(Researcher.dokumen_id == source_dokumen_id).all():
        db.add(Researcher(dokumen_id=target_dokumen_id, nama=r.nama, peran=r.peran, institusi=r.institusi, program_studi=r.program_studi, bidang_tugas=r.bidang_tugas, id_sinta=r.id_sinta, h_index=r.h_index, nidn_nip_nim=r.nidn_nip_nim))


    for p in db.query(Partner).filter(Partner.dokumen_id == source_dokumen_id).all():
        db.add(Partner(dokumen_id=target_dokumen_id, nama_mitra=p.nama_mitra, jenis_mitra=p.jenis_mitra, alamat=p.alamat, keterangan=p.keterangan))


    for s in db.query(Schedule).filter(Schedule.dokumen_id == source_dokumen_id).all():
        db.add(Schedule(dokumen_id=target_dokumen_id, nama_kegiatan=s.nama_kegiatan, bulan_1=s.bulan_1, bulan_2=s.bulan_2, bulan_3=s.bulan_3, bulan_4=s.bulan_4, bulan_5=s.bulan_5, bulan_6=s.bulan_6, bulan_7=s.bulan_7, bulan_8=s.bulan_8, bulan_9=s.bulan_9, bulan_10=s.bulan_10, bulan_11=s.bulan_11, bulan_12=s.bulan_12))


    for b in db.query(Budget).filter(Budget.dokumen_id == source_dokumen_id).all():
        db.add(Budget(dokumen_id=target_dokumen_id, jenis_pembelanjaan=b.jenis_pembelanjaan, item=b.item, satuan=b.satuan, volume=b.volume, biaya_satuan=b.biaya_satuan, total=b.total))


    for o in db.query(Output).filter(Output.dokumen_id == source_dokumen_id).all():
        db.add(Output(dokumen_id=target_dokumen_id, kategori_luaran=o.kategori_luaran, jenis_luaran=o.jenis_luaran, status_target=o.status_target, keterangan=o.keterangan, tahun_luaran=o.tahun_luaran))


    source_doc = db.query(Document).filter(Document.id == source_dokumen_id).first()
    target_doc = db.query(Document).filter(Document.id == target_dokumen_id).first()
    
    if source_doc and target_doc:
        source_fields = {f.id: f.nama_field for f in db.query(TemplateField).filter(TemplateField.template_id == source_doc.template_id).all()}
        target_fields = {f.nama_field: f.id for f in db.query(TemplateField).filter(TemplateField.template_id == target_template_id).all()}
        
        source_contents = db.query(DocumentContent).filter(DocumentContent.dokumen_id == source_dokumen_id).all()
        copied_field_names = set()

        for sc in source_contents:
            nama_field = source_fields.get(sc.template_field_id)
            if nama_field and nama_field in target_fields:
                db.add(DocumentContent(dokumen_id=target_dokumen_id, template_field_id=target_fields[nama_field], isi=sc.isi))
                copied_field_names.add(nama_field)
        

        if target_doc.jenis_dokumen_id == 3 and 'prakata' in target_fields and 'prakata' not in copied_field_names:
            research_judul = db.query(Research).filter(Research.id == target_doc.penelitian_id).first().judul_penelitian
            default_prakata = f"""<p>Bismillahirrohmanirrohim. Alhamdulillah segala puji bagi Allah SWT, yang telah melimpahkan rahmat dan ridho-Nya sehingga laporan penelitian dengan judul: <b>{research_judul}</b> dapat diselesaikan dengan baik.</p>
<p>Peneliti menyadari bahwa penyusunan penelitian ini tidak lepas dari bimbingan, dorongan dan bantuan dari berbagai pihak. Pada kesempatan ini peneliti menyampaikan terima kasih dan penghargaan yang setinggi-tingginya kepada seluruh pihak yang telah membantu.</p>
<p>Tim peneliti menyadari bahwa dalam menyusun laporan penelitian ini masih terdapat banyak kekurangan. Untuk itu, peneliti mengharapkan kritik dan saran yang membangun demi kesempurnaan penulisan laporan penelitian ini. Semoga penelitian ini dapat bermanfaat bagi masyarakat luas.</p>"""
            db.add(DocumentContent(dokumen_id=target_dokumen_id, template_field_id=target_fields['prakata'], isi=default_prakata))
                
    db.commit()
