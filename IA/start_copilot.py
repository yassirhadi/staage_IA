"""
Startup Script for Copilot RSSI
Initializes all components and starts the FastAPI server
"""
import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'fastapi', 'uvicorn', 'chromadb', 'sentence_transformers',
        'langchain', 'langchain_ollama', 'mysql_connector_python',
        'PyMuPDF', 'python_docx', 'openpyxl', 'pytesseract', 'PIL'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} - MISSING")
            missing.append(package)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed\n")
    return True

def check_mysql():
    """Check MySQL connection"""
    print("🔍 Checking MySQL connection...")
    
    try:
        import mysql.connector
        from mysql.connector import Error
        
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            database=os.getenv("MYSQL_DATABASE", "copilot_rssi"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", "")
        )
        
        if connection.is_connected():
            print("  ✓ MySQL connection successful")
            connection.close()
            print("✅ MySQL is ready\n")
            return True
    except Error as e:
        print(f"  ✗ MySQL connection failed: {e}")
        print("Please check your MySQL credentials in .env file\n")
        return False

def check_ollama():
    """Check if Ollama is running"""
    print("🔍 Checking Ollama...")
    
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        if response.status_code == 200:
            print("  ✓ Ollama is running")
            models = response.json().get('models', [])
            if models:
                print(f"  Available models: {', '.join([m['name'] for m in models])}")
            else:
                print("  ⚠ No models found. Run: ollama pull llama3")
            print("✅ Ollama is ready\n")
            return True
    except:
        print("  ✗ Ollama is not running")
        print("Start Ollama: ollama serve")
        print("Pull model: ollama pull llama3\n")
        return False

def initialize_directories():
    """Create necessary directories"""
    print("🔍 Initializing directories...")
    
    directories = [
        "./chroma_db",
        "./referentiels",
        "./uploads",
        "./logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"  ✓ {directory}")
    
    print("✅ Directories initialized\n")

def check_referentiels():
    """Check if referentiels PDFs exist"""
    print("🔍 Checking referentiels...")
    
    referentiels_dir = Path("./referentiels")
    required_files = [
        "ISO27001.pdf",
        "ISO27002.pdf", 
        "NIST_CSF_2.0.pdf",
        "CIS_Controls_v8.pdf",
        "Loi_09_08.pdf",
        "Politique_SSI.pdf"
    ]
    
    existing = []
    missing = []
    
    for file in required_files:
        if (referentiels_dir / file).exists():
            existing.append(file)
            print(f"  ✓ {file}")
        else:
            missing.append(file)
            print(f"  ✗ {file} - MISSING")
    
    if missing:
        print(f"\n⚠ Missing referentiels: {', '.join(missing)}")
        print("Place PDF files in ./referentiels/ directory")
        print("You can still use the system, but referentiel search won't work\n")
    else:
        print("✅ All referentiels found\n")
    
    return len(missing) == 0

def index_documents():
    """Optionally index documents"""
    print("🔍 Document indexing...")
    
    sample_docs = Path("../sample-documents")
    if not sample_docs.exists():
        print("  ⚠ sample-documents directory not found")
        print("  Skipping document indexing\n")
        return
    
    print(f"  Found sample-documents directory")
    print("  To index documents, use the API endpoint:")
    print("  POST /api/v1/index/documents")
    print("  Or run: python index_documents.py\n")

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Copilot RSSI server...")
    print("=" * 60)
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")

def main():
    """Main startup function"""
    print("\n" + "=" * 60)
    print("🤖 Copilot RSSI - Startup Script")
    print("=" * 60 + "\n")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run checks
    checks_passed = True
    
    if not check_dependencies():
        checks_passed = False
    
    if not check_mysql():
        print("⚠ MySQL check failed. Server will run but database queries may fail.")
        print("You can configure MySQL later in .env file\n")
    
    if not check_ollama():
        print("⚠ Ollama check failed. Server will run but LLM responses won't work.")
        print("You can start Ollama later\n")
    
    initialize_directories()
    check_referentiels()
    index_documents()
    
    print("=" * 60)
    print("📋 Startup Summary")
    print("=" * 60)
    print("✅ Directories initialized")
    print("✅ Dependencies checked")
    print("⚠ MySQL: Configure in .env if needed")
    print("⚠ Ollama: Start with 'ollama serve' if needed")
    print("⚠ Referentiels: Add PDFs to ./referentiels/ if needed")
    print("=" * 60 + "\n")
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
