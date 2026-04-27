from fastapi import FastAPI
from app.core.config import APP_NAME
from app.api.routes import document
from app.api.routes import document_content
from app.api.routes import document_preview
from app.api.routes import document_pdf
from app.api.routes import document_file
from app.api.routes import document_admin
from app.api.routes.budget import router as budget_router
from app.api.routes.schedule import router as schedule_router
from app.api.routes.output import router as output_router
from app.api.routes.researcher import router as researcher_router
from app.api.routes.partner import router as partner_router

app = FastAPI(title=APP_NAME)

app.include_router(document.router)
app.include_router(document_content.router)
app.include_router(document_preview.router)
app.include_router(document_pdf.router)
app.include_router(document_file.router)
app.include_router(document_admin.router)
app.include_router(budget_router)
app.include_router(schedule_router)
app.include_router(output_router)
app.include_router(researcher_router)
app.include_router(partner_router)