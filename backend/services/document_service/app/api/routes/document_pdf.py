from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.dependencies.auth import get_current_user
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
    preview = get_document_preview(document_id, db, current_user)

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

    render_data = {
        **preview,
        "cover_bg_url": cover_bg_url,
        "logo_sttnf_url": logo_sttnf_url,
        "tahun": "2026",
    }

    wkhtmltopdf_path = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
    config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)

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
        "margin-top": "25.4mm",
        "margin-right": "25.4mm",
        "margin-bottom": "25.4mm",
        "margin-left": "25.4mm",
        "enable-local-file-access": None,
        "disable-smart-shrinking": None,
        "zoom": "1",
        "dpi": "96",
        "print-media-type": None,
    }

    temp_pdf_paths = []

    try:
        if use_cover and cover_template is not None:
            cover_html = cover_template.render(**render_data)

            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as cover_file:
                cover_pdf_path = cover_file.name

            pdfkit.from_string(
                cover_html,
                cover_pdf_path,
                configuration=config,
                options=cover_options,
            )

            temp_pdf_paths.append(cover_pdf_path)

        content_html = content_template.render(**render_data)

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as content_file:
            content_pdf_path = content_file.name

        pdfkit.from_string(
            content_html,
            content_pdf_path,
            configuration=config,
            options=content_options,
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

    finally:
        for temp_path in temp_pdf_paths:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)