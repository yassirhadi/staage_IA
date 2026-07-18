from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import re
import os

# Optional imports for document processing
PDF_PROCESSING_AVAILABLE = False
try:
    import fitz  # PyMuPDF
    import docx
    import openpyxl
    import pytesseract
    from PIL import Image
    PDF_PROCESSING_AVAILABLE = True
except ImportError as e:
    print(f"⚠ PDF processing not available: {e}")
    print("Server will start but document analysis features will be disabled.")

# Import RAG components
from app.vector_store import VectorStore
from app.document_ingestion import DocumentIngestion
from app.intent_detector import IntentDetector
from app.mysql_query_builder import MySQLQueryBuilder
from app.context_builder import ContextBuilder
from app.llm_generator import LLMGenerator

app = FastAPI(title="Copilot RSSI - RAG-based AI Analysis Engine")

# Initialize RAG components
vector_store = VectorStore(persist_directory="./chroma_db")
document_ingestion = DocumentIngestion()
intent_detector = IntentDetector()
mysql_builder = MySQLQueryBuilder(
    host=os.getenv("MYSQL_HOST", "localhost"),
    database=os.getenv("MYSQL_DATABASE", "copilot_rssi"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD", "")
)
context_builder = ContextBuilder(mysql_builder, vector_store)
llm_generator = LLMGenerator(
    provider=os.getenv("LLM_PROVIDER", "ollama"),
    model=os.getenv("LLM_MODEL", "llama3"),
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text(file_bytes: bytes, filename: str) -> str:
    if not PDF_PROCESSING_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="PDF processing not available. Please install PyMuPDF correctly."
        )
    
    ext = filename.split(".")[-1].lower()
    text = ""
    try:
        if ext == "pdf":
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text()
            if not text.strip():
                for page in doc:
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    text += pytesseract.image_to_string(Image.open(io.BytesIO(img_data)))
        elif ext in ["docx", "doc"]:
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
        elif ext in ["png", "jpg", "jpeg"]:
            text = pytesseract.image_to_string(Image.open(io.BytesIO(file_bytes)))
    except Exception as e:
        print(f"Erreur d'extraction pour {filename}: {str(e)}")
    return text

def analyze_document_content(text: str):
    cin_pattern = r'\b[A-Z]{1,2}\d{5,6}\b'
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    password_pattern = r'(?i)(password|passwd|pwd|mot de passe|secret)\s*[:=]\s*([^\s]+)'
    
    detected = []
    confidentiality = "PUBLIC"
    asset_type = "DOCUMENT"

    if re.search(cin_pattern, text): detected.append("CIN")
    if re.search(email_pattern, text): detected.append("EMAIL")
    if re.search(password_pattern, text): detected.append("PASSWORD_EXPOSED")

    if "PASSWORD_EXPOSED" in detected:
        confidentiality = "TRES_CONFIDENTIEL"
    elif "CIN" in detected:
        confidentiality = "CONFIDENTIEL"
    elif "interne" in text.lower() or "diffusion restreinte" in text.lower():
        confidentiality = "INTERNE"

    text_lower = text.lower()
    if "contrat" in text_lower or "accord" in text_lower:
        asset_type = "CONTRAT"
    elif "facture" in text_lower:
        asset_type = "FACTURE"
    elif "politique de sécurité" in text_lower or "pssi" in text_lower:
        asset_type = "POLITIQUE_SECURITE"

    return {
        "confidentialityLevel": confidentiality,
        "assetType": asset_type,
        "sensitiveData": detected
    }

@app.post("/api/v1/analyze")
async def analyze_file(file: UploadFile = File(...)):
    if not PDF_PROCESSING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Document analysis not available. Please install PyMuPDF correctly."
        )
    file_bytes = await file.read()
    raw_text = extract_text(file_bytes, file.filename)
    analysis = analyze_document_content(raw_text)
    return analysis

@app.post("/api/v1/chat")
async def copilot_chat(request: dict):
    """
    Main chat endpoint using RAG pipeline
    """
    query = request.get("query", "")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    # Step 1: Detect intent
    intent_result = intent_detector.detect_intent(query)
    
    # Step 2: Build context from MySQL, documents, and referentiels
    context = context_builder.build_context(query, intent_result)
    
    # Step 3: Generate prompt
    prompt = context_builder.build_prompt(query, context)
    
    # Step 4: Generate response using LLM
    llm_result = llm_generator.generate_with_context(query, context["combined_context"])
    
    return {
        "reply": llm_result["response"],
        "intent": intent_result["intent"],
        "confidence": intent_result["confidence"],
        "sources": {
            "mysql": context["mysql_context"] is not None,
            "documents": context["document_context"] is not None,
            "referentiels": context["referentiel_context"] is not None
        },
        "tokens_used": llm_result["tokens_used"],
        "model": llm_result["model"]
    }

@app.post("/api/v1/index/documents")
async def index_documents(directory: str = "../sample-documents"):
    """
    Index documents into the vector store
    """
    if not PDF_PROCESSING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Document indexing not available. Please install PyMuPDF correctly."
        )
    try:
        abs_directory = os.path.abspath(directory)
        if not os.path.exists(abs_directory):
            raise HTTPException(status_code=404, detail=f"Directory not found: {directory}")
        
        chunks = document_ingestion.process_directory(abs_directory)
        vector_store.add_documents(chunks)
        
        return {
            "status": "success",
            "indexed_chunks": len(chunks),
            "directory": abs_directory
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/index/referentiels")
async def index_referentiels(directory: str = "../referentiels"):
    """
    Index referentiels (ISO/NIST/CIS/Loi) into the vector store
    """
    if not PDF_PROCESSING_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Referentiel indexing not available. Please install PyMuPDF correctly."
        )
    try:
        abs_directory = os.path.abspath(directory)
        if not os.path.exists(abs_directory):
            raise HTTPException(status_code=404, detail=f"Referentiels directory not found: {directory}")
        
        chunks = document_ingestion.process_referentiels(abs_directory)
        vector_store.add_referentiels(chunks)
        
        return {
            "status": "success",
            "indexed_chunks": len(chunks),
            "directory": abs_directory
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "components": {
            "vector_store": "ok",
            "mysql": "ok" if mysql_builder.connection else "not connected",
            "llm": "ok" if llm_generator.llm else "not initialized",
            "pdf_processing": "ok" if PDF_PROCESSING_AVAILABLE else "not available"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)