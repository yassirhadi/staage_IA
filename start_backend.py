#!/usr/bin/env python
"""
Startup script for IA backend service.
Handles proper working directory and module path setup for uvicorn reload mode.

Usage:
    python start_backend.py [--host HOST] [--port PORT] [--reload]
"""
import os
import sys
from pathlib import Path

# Set up paths
repo_root = Path(__file__).resolve().parent
ia_dir = repo_root / "IA"

# Change to IA directory
os.chdir(ia_dir)

# Ensure IA is in the Python path
if str(ia_dir) not in sys.path:
    sys.path.insert(0, str(ia_dir))

# Import uvicorn and run
import uvicorn

# Parse command line arguments
host = "0.0.0.0"
port = 8000
reload = False

for i, arg in enumerate(sys.argv[1:], 1):
    if arg == "--host" and i < len(sys.argv) - 1:
        host = sys.argv[i + 1]
    elif arg == "--port" and i < len(sys.argv) - 1:
        port = int(sys.argv[i + 1])
    elif arg == "--reload":
        reload = True

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
    )
