import os
import traceback
import json


from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv(override=True)

app = FastAPI(title="AI Service for Research Management")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = None
is_ai_ready = False
api_key = os.getenv("GEMINI_API_KEY")

if not api_key or "YOUR_GEMINI_API_KEY_HERE" in api_key:
    print("\n" + "!" * 50)
    print("WARNING: GEMINI_API_KEY NOT CONFIGURED!")
    print("AI service will return fallback responses.")
    print("Location expected: backend/services/ai_service/.env")
    print("!" * 50 + "\n")
else:
    try:
        client = genai.Client(api_key=api_key)
        is_ai_ready = True
        print("-" * 50)
        print(f"DEBUG: GEMINI_API_KEY successfully read.")
        print(f"DEBUG: Status SDK: READY (google-genai)")
        print("-" * 50)
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to initialize Gemini Client: {str(e)}")
        is_ai_ready = False


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: dict = {}
    history: list[ChatMessage] = []


@app.post("/ai/chat")
async def chat_with_gemini(request: ChatRequest):
    print(f"\n[DEBUG] Request diterima pada /ai/chat")
    print(f"DEBUG: Message: {request.message}")
    print(f"DEBUG: Context: {json.dumps(request.context, indent=2)}")
    print(f"DEBUG: History: {len(request.history)} messages")
    print(f"DEBUG: Status AI Ready: {is_ai_ready}")

    if not is_ai_ready or client is None:
        print("AI Service is not ready (missing/invalid API key). Returning fallback.")
        return {
            "response": "Maaf, layanan AI sedang tidak aktif karena konfigurasi API Key belum lengkap. Silakan hubungi administrator."
        }

    try:
        instruction = (
            "Anda adalah Asisten Riset AI profesional yang bertugas membantu menulis dokumen penelitian akademik formal dalam Bahasa Indonesia.\n\n"
            "KETENTUAN OUTPUT:\n"
            "1. FORMATTING: JANGAN gunakan simbol markdown mentah (TIDAK BOLEH ada **, ##, ---, *, atau backtick).\n"
            "2. HTML: Gunakan tag HTML ringan untuk formatting visual yang kompatibel dengan rich text editor (ReactQuill):\n"
            "   - Gunakan <b>...</b> untuk teks tebal atau judul section.\n"
            "   - Gunakan <i>...</i> untuk istilah asing (misal: <i>machine learning</i>, <i>artificial intelligence</i>).\n"
            "   - Gunakan <p>...</p> untuk paragraf.\n"
            "   - Gunakan <br> untuk baris baru jika diperlukan.\n"
            "3. STRUKTUR: Anda BOLEH menggunakan pembuka singkat (misal: 'Tentu, berikut adalah draf latar belakang Anda:').\n"
            "4. JUDUL SECTION: Tampilkan judul section dengan format <b>JUDUL</b> diikuti baris baru.\n"
            "5. BAHASA: Gunakan Bahasa Indonesia formal sesuai EYD/KBBI. Pastikan istilah teknis asing otomatis diapit tag <i>.\n"
            "6. KUALITAS: Output harus terasa seperti hasil asisten penulisan akademik profesional, bukan chatbot biasa.\n"
        )

        if request.context:
            instruction += "KONTEKS DOKUMEN:\n"
            for key, value in request.context.items():
                if value:
                    instruction += f"- {key}: {value}\n"
            instruction += "\n"


        contents = []
        

        for msg in request.history:
            contents.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [{"text": msg.content}]
            })
            

        contents.append({
            "role": "user",
            "parts": [{"text": f"{instruction}\n\nUser Question: {request.message}"}]
        })


        target_model = "gemini-2.0-flash"
        try:
            print(f"Using model: {target_model}")
            response = client.models.generate_content(
                model=target_model,
                contents=contents
            )
            
            ai_text = response.text
            if not ai_text:
                raise ValueError("Could not extract text from Gemini response")
                
            print("Successfully generated response.")
            return {"response": ai_text}

        except Exception as flash_error:
            print(f"Model {target_model} failed: {str(flash_error)}")
            fallback_model = "gemini-2.5-flash"
            print(f"Trying fallback model: {fallback_model}")
            
            try:
                response = client.models.generate_content(
                    model=fallback_model,
                    contents=contents
                )
                
                ai_text = response.text
                if not ai_text:
                    raise ValueError(f"Could not extract text from {fallback_model}")
                    
                return {"response": ai_text}
            except Exception as fallback_error:
                print(f"All Gemini models failed: {str(fallback_error)}")
                raise fallback_error

    except Exception as error:
        traceback.print_exc()
        error_detail = str(error)
        

        if "API_KEY_INVALID" in error_detail or "403" in error_detail:
            error_message = "API Key Gemini tidak valid atau tidak memiliki izin."
        elif "quota" in error_detail.lower() or "429" in error_detail:
            error_message = "Kuota API Gemini telah habis (Rate Limit). Silakan coba lagi nanti."
        elif "503" in error_detail or "UNAVAILABLE" in error_detail or "high demand" in error_detail.lower():
            error_message = "Server AI Google sedang sibuk dan tidak dapat merespons saat ini. Ini bersifat sementara, silakan coba lagi dalam beberapa menit."
        else:
            error_message = f"Terjadi kesalahan internal pada layanan AI: {error_detail}"

        return {
            "response": f"Maaf, asisten AI mengalami kendala: {error_message}. Sebagai alternatif, Anda bisa melanjutkan penulisan secara manual.",
            "error": error_detail
        }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai_service",
        "ai_ready": is_ai_ready
    }



