from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from processor import redact_aadhaar, verify_face
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/redact")
async def process_image(
    file: UploadFile = File(...), 
    live_image: UploadFile = File(...)
):
    # Paths
    id_path = f"uploads/{file.filename}"
    live_path = f"uploads/live_{file.filename}"
    redacted_path = f"uploads/redacted_{file.filename}"

    # Save incoming files
    with open(id_path, "wb") as buffer:
        buffer.write(await file.read())
    with open(live_path, "wb") as buffer:
        buffer.write(await live_image.read())

    # 1. Mask the Aadhaar
    redact_aadhaar(id_path, redacted_path)

    # 2. Match the Faces
    face_result = verify_face(live_path, id_path)

    return {
        "url": f"http://127.0.0.1:8000/{redacted_path}",
        "face_match": face_result["verified"],
        "match_score": face_result["score"],
        "redaction_success": True
    }