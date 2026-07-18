import uvicorn
from pathlib import Path

from app.config import settings
from app.main import app

if __name__ == "__main__":
    app_dir = Path(__file__).resolve().parent
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        app_dir=str(app_dir),
        timeout_keep_alive=300,  # 5 minutes timeout
        timeout_graceful_shutdown=30,
    )
