from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import APP_NAME
from app.api.routes import research
from app.api.routes import document
from app.api.routes import document_content
from app.api.routes import document_preview
from app.api.routes import document_pdf
from app.api.routes import document_file
from app.api.routes import document_admin
from app.api.routes import upload
from app.api.routes.budget import router as budget_router
from app.api.routes.schedule import router as schedule_router
from app.api.routes.output import router as output_router
from app.api.routes.researcher import router as researcher_router
from app.api.routes.partner import router as partner_router
from app.api.routes.research import router as research_router  # ← Router penelitian
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title=APP_NAME)
origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = Path(__file__).resolve().parents[2] / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

app.include_router(research.router)
app.include_router(document.router)
app.include_router(document_content.router)
app.include_router(document_preview.router)
app.include_router(document_pdf.router)
app.include_router(document_file.router)
app.include_router(document_admin.router)
app.include_router(upload.router)
app.include_router(budget_router)
app.include_router(schedule_router)
app.include_router(output_router)
app.include_router(researcher_router)
app.include_router(partner_router)
<<<<<<< HEAD
app.include_router(research_router)  # ← Endpoint /researches/


=======
>>>>>>> 49aba3087b3f855aa889c564c1139967a45e6cc4
