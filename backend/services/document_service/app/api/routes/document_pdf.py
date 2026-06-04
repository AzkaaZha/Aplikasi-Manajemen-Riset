from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.api.routes.document_helper import get_owned_document_or_404
from app.models.file_document import FileDocument
from pathlib import Path
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from pypdf import PdfReader, PdfWriter
import io
import os
import pdfkit
import tempfile

from app.api.routes.document_preview import get_document_preview

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}/export-pdf")
def export_pdf(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    import traceback
    import shutil
    temp_pdf_paths = []
    try:
        from sqlalchemy.orm import aliased
        from app.models.document import Document
        from app.models.research import Research
        from app.models.template import Template

        dokumen = aliased(Document, name="dokumen")
        penelitian = aliased(Research, name="penelitian")
        templates = aliased(Template, name="templates")

        result = (
            db.query(dokumen, penelitian, templates)
            .outerjoin(penelitian, dokumen.penelitian_id == penelitian.id)
            .outerjoin(templates, dokumen.template_id == templates.id)
            .filter(
                dokumen.id == document_id,
                dokumen.user_id == int(current_user["id"])
            )
            .first()
        )

        if not result:
            raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan")

        document, penelitian_obj, template_obj = result

        resolved_template_id = document.template_id
        if not resolved_template_id:
            active_template = (
                db.query(Template)
                .filter(
                    Template.jenis_dokumen_id == document.jenis_dokumen_id,
                    Template.status_aktif == 1
                )
                .order_by(Template.id.desc())
                .first()
            )
            if active_template:
                resolved_template_id = active_template.id

        preview = get_document_preview(document_id, db, current_user)
        
        def clean_document_title(value):
            if not value:
                return value
            return (
                value
                .replace("Proposal - ", "")
                .replace("Laporan Kemajuan - ", "")
                .replace("Laporan Akhir - ", "")
            )

        judul_bersih = clean_document_title(
            preview.get("judul_penelitian")
            or preview.get("judul")
            or document.judul
        )

        template_dir = Path(__file__).resolve().parents[2] / "templates"
        static_dir = Path(__file__).resolve().parents[2] / "static"

        env = Environment(loader=FileSystemLoader(str(template_dir)))

        jenis_dokumen_id = preview.get("jenis_dokumen_id")

        cover_template = None
        content_template = None
        cover_bg_url = None
        file_prefix = "dokumen"
        use_cover = False

        if jenis_dokumen_id == 1:
            cover_template = env.get_template("proposal_cover.html")
            content_template = env.get_template("proposal_content.html")
            cover_bg_url = (static_dir / "cover_proposal.jpg").resolve().as_uri()
            file_prefix = "proposal"
            use_cover = True

        elif jenis_dokumen_id == 2:
            cover_template = env.get_template("laporan_kemajuan_cover.html")
            content_template = env.get_template("laporan_kemajuan_content.html")
            cover_bg_url = (static_dir / "cover_laporan_kemajuan.jpg").resolve().as_uri()
            file_prefix = "laporan_kemajuan"
            use_cover = True

        elif jenis_dokumen_id == 3:
            cover_template = env.get_template("laporan_akhir_cover.html")
            content_template = env.get_template("laporan_akhir_content.html")
            cover_bg_url = (static_dir / "cover_laporan_akhir.jpg").resolve().as_uri()
            file_prefix = "laporan_akhir"
            use_cover = True

        else:
            raise HTTPException(
                status_code=400,
                detail="Template export PDF untuk jenis dokumen ini belum tersedia",
            )

        logo_sttnf_url = (static_dir / "logo_sttnf.png").resolve().as_uri()
        local_static_uri = static_dir.resolve().as_uri() + "/"

        render_data = {
            **preview,
            "judul": judul_bersih,
            "judul_penelitian": judul_bersih,
            "cover_bg_url": cover_bg_url,
            "logo_sttnf_url": logo_sttnf_url,
            "tahun": "2026",
        }

        wkhtmltopdf_path = shutil.which("wkhtmltopdf")
        if not wkhtmltopdf_path:
            common_paths = [
                r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe",
                r"C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe",
                r"C:\wkhtmltopdf\bin\wkhtmltopdf.exe",
            ]
            for p in common_paths:
                if Path(p).exists():
                    wkhtmltopdf_path = p
                    break

        if not wkhtmltopdf_path:
            raise HTTPException(
                status_code=500,
                detail=(
                    "wkhtmltopdf tidak ditemukan di sistem. Silakan install wkhtmltopdf di Windows "
                    "menggunakan installer resmi, atau jalankan command 'choco install wkhtmltopdf' di PowerShell administrator."
                ),
            )

        try:
            config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
        except Exception as ex:
            raise HTTPException(
                status_code=500,
                detail=f"Konfigurasi wkhtmltopdf gagal: {ex}",
            )

        cover_options = {
            "page-size": "A4",
            "encoding": "UTF-8",
            "margin-top": "0mm",
            "margin-right": "0mm",
            "margin-bottom": "0mm",
            "margin-left": "0mm",
            "enable-local-file-access": None,
            "disable-smart-shrinking": None,
            "zoom": "1",
            "dpi": "96",
            "print-media-type": None,
        }

        content_options = {
            "page-size": "A4",
            "encoding": "UTF-8",
            "margin-top": "25mm",
            "margin-right": "25mm",
            "margin-bottom": "25mm",
            "margin-left": "30mm",
            "enable-local-file-access": None,
            "disable-smart-shrinking": None,
            "zoom": "1",
            "dpi": "96",
            "print-media-type": None,
        }

        if use_cover and cover_template is not None:
            cover_html = cover_template.render(**render_data)
            cover_html = cover_html.replace("http://localhost:8002/static/", local_static_uri)

            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as cover_file:
                cover_pdf_path = cover_file.name

            try:
                pdfkit.from_string(
                    cover_html,
                    cover_pdf_path,
                    configuration=config,
                    options=cover_options,
                )
            except Exception as ex:
                raise HTTPException(
                    status_code=500,
                    detail=f"Gagal membuat PDF cover: {ex}",
                )

            temp_pdf_paths.append(cover_pdf_path)

        content_html = content_template.render(**render_data)
        content_html = content_html.replace("http://localhost:8002/static/", local_static_uri)

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as content_file:
            content_pdf_path = content_file.name

        try:
            pdfkit.from_string(
                content_html,
                content_pdf_path,
                configuration=config,
                options=content_options,
            )
        except Exception as ex:
            raise HTTPException(
                status_code=500,
                detail=f"Gagal membuat PDF konten: {ex}",
            )

        temp_pdf_paths.append(content_pdf_path)

        writer = PdfWriter()

        for pdf_path in temp_pdf_paths:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                writer.add_page(page)

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)

        storage_dir = Path(__file__).resolve().parents[3] / "storage" / "generated_pdfs"
        storage_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"{file_prefix}_{document_id}_{timestamp}.pdf"
        pdf_file_path = storage_dir / pdf_filename

        with open(pdf_file_path, "wb") as f:
            f.write(output_stream.getvalue())

        new_file = FileDocument(
            dokumen_id=document_id,
            nama_file=pdf_filename,
            file_path=str(pdf_file_path),
            tipe_file="pdf",
        )

        db.add(new_file)
        db.commit()
        db.refresh(new_file)

        output_stream.seek(0)

        return StreamingResponse(
            output_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={pdf_filename}"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        print("ERROR IN EXPORT PDF:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengekspor PDF: {str(e)}",
        )
    finally:
        for temp_path in temp_pdf_paths:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)