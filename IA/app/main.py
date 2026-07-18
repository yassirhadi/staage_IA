from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analyze, chat, health

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Micro-service IA pour le Copilote RSSI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(analyze.router, prefix="/api/v1", tags=["Analyse"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])
