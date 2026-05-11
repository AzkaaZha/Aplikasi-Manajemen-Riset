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

@router.get("/", response_model=list[ResearchResponse])
def list_researches(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(Research)
        .filter(Research.user_id == current_user["id"])
        .order_by(Research.created_at.desc())
        .all()
    )

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

    if payload.status_penelitian is not None:
        research.status_penelitian = payload.status_penelitian

    db.commit()
    db.refresh(research)

    return research

@router.delete("/{research_id}")
def delete_research(
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

    db.delete(research)
    db.commit()

    return {"message": "Penelitian berhasil dihapus"}

@router.get("/{research_id}/documents")
def get_research_documents(
    research_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    research = get_owned_research_or_404(db, research_id, current_user)

    documents = (
        db.query(Document)
        .filter(Document.penelitian_id == research.id)
        .all()
    )

    result = {
        "proposal": {
            "id": None,
            "status": "belum_dibuat",
            "is_created": False
        },
        "laporan_kemajuan": {
            "id": None,
            "status": "belum_dibuat",
            "is_created": False
        },
        "laporan_akhir": {
            "id": None,
            "status": "belum_dibuat",
            "is_created": False
        }
    }

    for document in documents:
        if document.jenis_dokumen_id == 1:
            key = "proposal"
        elif document.jenis_dokumen_id == 2:
            key = "laporan_kemajuan"
        elif document.jenis_dokumen_id == 3:
            key = "laporan_akhir"
        else:
            continue

        result[key] = {
            "id": document.id,
            "is_created": True
        }

    return {
        "research": {
            "id": research.id,
            "judul_penelitian": research.judul_penelitian,
            "tahun": research.tahun,
            "status_penelitian": research.status_penelitian
        },
        "documents": result
    }

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

    # Update status penelitian menjadi berjalan
    research.status_penelitian = "berjalan"
    db.commit()

    # Salin data dari proposal
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

    # Update status penelitian menjadi selesai
    research.status_penelitian = "selesai"
    db.commit()

    # Salin data dari proposal
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
    # Copy Researchers
    for r in db.query(Researcher).filter(Researcher.dokumen_id == source_dokumen_id).all():
        db.add(Researcher(dokumen_id=target_dokumen_id, nama=r.nama, peran=r.peran, institusi=r.institusi, program_studi=r.program_studi, bidang_tugas=r.bidang_tugas, id_sinta=r.id_sinta, h_index=r.h_index, nidn_nip_nim=r.nidn_nip_nim))

    # Copy Partners
    for p in db.query(Partner).filter(Partner.dokumen_id == source_dokumen_id).all():
        db.add(Partner(dokumen_id=target_dokumen_id, nama_mitra=p.nama_mitra, jenis_mitra=p.jenis_mitra))

    # Copy Schedules
    for s in db.query(Schedule).filter(Schedule.dokumen_id == source_dokumen_id).all():
        db.add(Schedule(dokumen_id=target_dokumen_id, nama_kegiatan=s.nama_kegiatan, bulan_1=s.bulan_1, bulan_2=s.bulan_2, bulan_3=s.bulan_3, bulan_4=s.bulan_4, bulan_5=s.bulan_5, bulan_6=s.bulan_6, bulan_7=s.bulan_7, bulan_8=s.bulan_8, bulan_9=s.bulan_9, bulan_10=s.bulan_10, bulan_11=s.bulan_11, bulan_12=s.bulan_12))

    # Copy Budgets
    for b in db.query(Budget).filter(Budget.dokumen_id == source_dokumen_id).all():
        db.add(Budget(dokumen_id=target_dokumen_id, jenis_pembelanjaan=b.jenis_pembelanjaan, item=b.item, satuan=b.satuan, volume=b.volume, biaya_satuan=b.biaya_satuan, total=b.total))

    # Copy Outputs
    for o in db.query(Output).filter(Output.dokumen_id == source_dokumen_id).all():
        db.add(Output(dokumen_id=target_dokumen_id, kategori_luaran=o.kategori_luaran, jenis_luaran=o.jenis_luaran, status_target=o.status_target, keterangan=o.keterangan, tahun_luaran=o.tahun_luaran))

    # Copy Contents (mapping fields by name)
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
        
        # Add default Prakata for Laporan Akhir if not copied
        if target_doc.jenis_dokumen_id == 3 and 'prakata' in target_fields and 'prakata' not in copied_field_names:
            research_judul = db.query(Research).filter(Research.id == target_doc.penelitian_id).first().judul_penelitian
            default_prakata = f"""<p>Bismillahirrohmanirrohim. Alhamdulillah segala puji bagi Allah SWT, yang telah melimpahkan rahmat dan ridho-Nya sehingga laporan penelitian dengan judul: <b>{research_judul}</b> dapat diselesaikan dengan baik.</p>
<p>Peneliti menyadari bahwa penyusunan penelitian ini tidak lepas dari bimbingan, dorongan dan bantuan dari berbagai pihak. Pada kesempatan ini peneliti menyampaikan terima kasih dan penghargaan yang setinggi-tingginya kepada seluruh pihak yang telah membantu.</p>
<p>Tim peneliti menyadari bahwa dalam menyusun laporan penelitian ini masih terdapat banyak kekurangan. Untuk itu, peneliti mengharapkan kritik dan saran yang membangun demi kesempurnaan penulisan laporan penelitian ini. Semoga penelitian ini dapat bermanfaat bagi masyarakat luas.</p>"""
            db.add(DocumentContent(dokumen_id=target_dokumen_id, template_field_id=target_fields['prakata'], isi=default_prakata))
                
    db.commit()
