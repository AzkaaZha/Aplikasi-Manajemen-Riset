import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
import google.generativeai as genai
import traceback

load_dotenv(override=True)

app = FastAPI(title="AI Service for Research Management")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurasi Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("CRITICAL: GEMINI_API_KEY not found in .env")
else:
    genai.configure(api_key=api_key)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: dict = {}
    history: list[ChatMessage] = []

@app.post("/ai/chat")
async def chat_with_gemini(request: ChatRequest):
    try:
        # Instruksi Sistem
        instruction = (
            "Anda adalah Asisten Riset AI profesional. Tugas Anda adalah membantu menulis dokumen penelitian. "
            "Gunakan Bahasa Indonesia formal dan akademik.\n\n"
        )
        
        if request.context:
            instruction += "KONTEKS DOKUMEN:\n"
            for k, v in request.context.items():
                if v: instruction += f"- {k}: {v}\n"
            instruction += "\n"

        # Susun Prompt Lengkap dari Riwayat Percakapan agar lebih stabil
        full_prompt = instruction + "RIWAYAT PERCAKAPAN:\n"
        for msg in request.history:
            sender = "User" if msg.role == "user" else "AI"
            full_prompt += f"{sender}: {msg.content}\n"
        
        full_prompt += f"\nUser: {request.message}\n"
        full_prompt += "AI: "

        # Gunakan model Gemini terbaru (flash series)
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(full_prompt)
        except Exception as e:
            print(f"Flash 1.5 failed, trying Flash Latest: {e}")
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(full_prompt)
        
        return {"response": response.text}
    except Exception as e:
        traceback.print_exc()
        # Pesan error yang lebih deskriptif
        error_detail = str(e)
        if "API_KEY_INVALID" in error_detail:
            error_detail = "API Key Gemini tidak valid. Silakan periksa file .env"
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai_service"}
