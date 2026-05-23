import base64
import hashlib
import hmac
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "data" / "site_config.json"
APP_VERSION = os.getenv("APP_VERSION", "1.1.11")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "ChangeMe@123")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "change-this-admin-secret-before-production")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./truflux.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(250), nullable=False, index=True)
    linkedin = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    industry = Column(String(150), nullable=True)
    job_title = Column(String(150), nullable=True)
    whitepaper_id = Column(String(150), nullable=False)
    download_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(250), nullable=False, index=True)
    company = Column(String(200), nullable=True)
    subject = Column(String(250), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    linkedin: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    job_title: Optional[str] = None
    whitepaper_id: str = Field(..., min_length=2, max_length=150)


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    company: Optional[str] = None
    subject: Optional[str] = None
    message: str = Field(..., min_length=5, max_length=3000)


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise HTTPException(status_code=500, detail="site_config.json missing")
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)



class ConfigUpdate(BaseModel):
    config: Dict[str, Any]


class AdminLogin(BaseModel):
    username: str
    password: str



def create_admin_token(username: str) -> str:
    expires_at = int(time.time()) + 60 * 60 * 8
    payload = f"{username}:{expires_at}"
    signature = hmac.new(ADMIN_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(f"{payload}:{signature}".encode("utf-8")).decode("utf-8")


def require_admin(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin login required")
    token = authorization.replace("Bearer ", "", 1).strip()
    try:
        decoded = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
        username, expires_at_text, signature = decoded.rsplit(":", 2)
        payload = f"{username}:{expires_at_text}"
        expected = hmac.new(ADMIN_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise ValueError("bad signature")
        if int(expires_at_text) < int(time.time()):
            raise ValueError("expired")
        return username
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired admin session")

def save_config(data: dict) -> dict:
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    data["version"] = APP_VERSION
    with CONFIG_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return data


def public_assets_dir() -> Path:
    # Local dev: frontend/public/assets. Docker/prod: backend/static/assets.
    frontend_public = BASE_DIR.parent / "frontend" / "public" / "assets"
    if frontend_public.exists():
        return frontend_public
    static_assets = BASE_DIR / "static" / "assets"
    static_assets.mkdir(parents=True, exist_ok=True)
    return static_assets

def get_whitepaper(whitepaper_id: str) -> Optional[dict]:
    config = load_config()
    for whitepaper in config.get("whitepapers", []):
        if whitepaper.get("id") == whitepaper_id:
            return whitepaper
    return None


app = FastAPI(
    title="Truflux Technologies Website API",
    version=APP_VERSION,
    description="Configurable website backend for Truflux Technologies."
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": APP_VERSION}


@app.get("/api/version")
def version():
    return {"version": APP_VERSION}


@app.get("/api/config")
def config():
    data = load_config()
    data["runtimeVersion"] = APP_VERSION
    return data



@app.post("/api/admin/login")
def admin_login(payload: AdminLogin):
    if not hmac.compare_digest(payload.username, ADMIN_USERNAME) or not hmac.compare_digest(payload.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"success": True, "token": create_admin_token(payload.username), "username": payload.username}


@app.get("/api/admin/config")
def admin_get_config(_: str = Depends(require_admin)):
    return load_config()


@app.put("/api/admin/config")
def admin_update_config(payload: ConfigUpdate, _: str = Depends(require_admin)):
    try:
        return {"success": True, "config": save_config(payload.config), "message": "Configuration saved."}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to save configuration: {exc}")


@app.post("/api/admin/logo")
async def admin_upload_logo(file: UploadFile = File(...), _: str = Depends(require_admin)):
    allowed_extensions = {".svg", ".png", ".jpg", ".jpeg", ".webp"}
    suffix = Path(file.filename or "logo.svg").suffix.lower()
    if suffix not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Logo must be SVG, PNG, JPG, JPEG or WEBP.")
    safe_name = f"uploaded-logo{suffix}"
    target = public_assets_dir() / safe_name
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Logo file must be less than 2MB.")
    target.write_bytes(content)

    config = load_config()
    config.setdefault("brand", {})["logoUrl"] = f"/assets/{safe_name}"
    save_config(config)
    return {"success": True, "logoUrl": f"/assets/{safe_name}", "message": "Logo uploaded."}

@app.post("/api/leads")
def create_lead(payload: LeadCreate):
    whitepaper = get_whitepaper(payload.whitepaper_id)
    if not whitepaper:
        raise HTTPException(status_code=404, detail="Whitepaper not found")

    db = SessionLocal()
    try:
        lead = Lead(
            name=payload.name,
            email=payload.email,
            linkedin=payload.linkedin,
            phone=payload.phone,
            industry=payload.industry,
            job_title=payload.job_title,
            whitepaper_id=payload.whitepaper_id,
            download_url=whitepaper.get("downloadUrl"),
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return {
            "success": True,
            "lead_id": lead.id,
            "whitepaper_id": payload.whitepaper_id,
            "download_url": whitepaper.get("downloadUrl"),
            "message": "Lead captured successfully."
        }
    finally:
        db.close()


@app.post("/api/contact")
def create_contact(payload: ContactCreate):
    db = SessionLocal()
    try:
        contact = ContactMessage(
            name=payload.name,
            email=payload.email,
            company=payload.company,
            subject=payload.subject,
            message=payload.message,
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
        return {"success": True, "contact_id": contact.id, "message": "Contact request submitted."}
    finally:
        db.close()


@app.get("/api/admin/leads")
def list_leads(_: str = Depends(require_admin)):
    db = SessionLocal()
    try:
        rows = db.query(Lead).order_by(Lead.created_at.desc()).all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "email": row.email,
                "linkedin": row.linkedin,
                "phone": row.phone,
                "industry": row.industry,
                "job_title": row.job_title,
                "whitepaper_id": row.whitepaper_id,
                "download_url": row.download_url,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]
    finally:
        db.close()


@app.get("/api/admin/contacts")
def list_contacts(_: str = Depends(require_admin)):
    db = SessionLocal()
    try:
        rows = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
        return [
            {
                "id": row.id,
                "name": row.name,
                "email": row.email,
                "company": row.company,
                "subject": row.subject,
                "message": row.message,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]
    finally:
        db.close()


# Serve built frontend in production after Docker build copies it here.
FRONTEND_DIST = BASE_DIR / "static"
if (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        requested = FRONTEND_DIST / full_path
        if requested.is_file():
            return FileResponse(requested)
        return FileResponse(FRONTEND_DIST / "index.html")
