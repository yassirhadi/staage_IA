# Copilot RSSI - RAG System Documentation

## Overview

The Copilot RSSI uses a **Retrieval Augmented Generation (RAG)** architecture to provide intelligent, context-aware responses about information security. It combines:

- **MySQL Database**: Structured data (documents, risks, assets, users)
- **Vector Database (ChromaDB)**: Semantic search in documents and referentiels
- **LLM (Ollama)**: Natural language understanding and response generation

## Architecture

```
React Frontend
       ↓
Spring Boot Backend
       ↓
FastAPI (Copilot IA)
       ↓
┌──────┼──────┬──────┐
│      │      │      │
↓      ↓      ↓      ↓
MySQL  Documents  Referentiels
       PDF/Word   ISO/NIST/CIS
       Excel      Loi 09-08
       │          │
       └────┬─────┘
            ↓
    Context Builder
            ↓
        Ollama LLM
            ↓
    Answer Formatter
            ↓
    Structured Response
```

## Components

### 1. Vector Store (`app/vector_store.py`)

**Purpose**: Store and retrieve document embeddings using ChromaDB

**Features**:
- Multilingual embedding model (French/Arabic/English)
- Separate collections for documents and referentiels
- Semantic search with similarity scoring

**Usage**:
```python
from app.vector_store import VectorStore

vector_store = VectorStore(persist_directory="./chroma_db")

# Add documents
vector_store.add_documents(chunks)

# Search documents
results = vector_store.search_documents("CIN documents", n_results=5)

# Search referentiels
ref_results = vector_store.search_referentiels("ISO 27001", n_results=3)
```

### 2. Document Ingestion (`app/document_ingestion.py`)

**Purpose**: Process various file formats and prepare them for vector storage

**Supported Formats**:
- PDF (with OCR fallback)
- Word (DOCX, DOC)
- Excel (XLSX, XLS)
- Images (PNG, JPG, JPEG) with OCR
- Plain text

**Usage**:
```python
from app.document_ingestion import DocumentIngestion

ingestion = DocumentIngestion()

# Process single file
chunks = ingestion.process_file("document.pdf", "document.pdf")

# Process directory
chunks = ingestion.process_directory("./sample-documents")

# Process referentiels
ref_chunks = ingestion.process_referentiels("./referentiels")
```

### 3. Intent Detector (`app/intent_detector.py`)

**Purpose**: Classify user questions to determine appropriate data sources

**Supported Intents**:
- **CIN**: Questions about ID card numbers
- **RISQUES**: Risk-related questions
- **CONTRATS**: Contract-related questions
- **CLASSIFICATION**: Document classification questions
- **ISO**: ISO 27001/27002 questions
- **NIST**: NIST Cybersecurity Framework questions
- **CIS**: CIS Controls questions
- **LOI**: Legal questions (Loi 09-08)
- **DOCUMENTS**: General document questions
- **ACTIFS**: Asset-related questions
- **STATISTIQUES**: Statistics/count questions
- **RECOMMANDATIONS**: Recommendation requests
- **MOT_DE_PASSE**: Password-related questions
- **EMAIL**: Email-related questions

**Usage**:
```python
from app.intent_detector import IntentDetector

detector = IntentDetector()
result = detector.detect_intent("Quels documents contiennent un CIN ?")

print(result['intent'])  # CIN
print(result['requires_mysql'])  # True
print(result['requires_documents'])  # True
print(result['requires_referentiels'])  # False
```

### 4. MySQL Query Builder (`app/mysql_query_builder.py`)

**Purpose**: Generate SQL queries based on detected intent

**Features**:
- Intent-to-SQL mapping
- Entity-based filtering
- Result formatting for LLM consumption

**Usage**:
```python
from app.mysql_query_builder import MySQLQueryBuilder

builder = MySQLQueryBuilder(
    host="localhost",
    database="copilot_rssi",
    user="root",
    password="your_password"
)

# Build query
query = builder.build_query('CIN', {})

# Execute and get context
context = builder.get_context_from_query('CIN', {})
formatted = builder.format_results_for_llm(context)
```

### 5. Context Builder (`app/context_builder.py`)

**Purpose**: Combine MySQL, documents, and referentiels into unified context

**Usage**:
```python
from app.context_builder import ContextBuilder

context_builder = ContextBuilder(mysql_builder, vector_store)

context = context_builder.build_context(query, intent_result)

# Build prompt for LLM
prompt = context_builder.build_prompt(query, context)
```

### 6. LLM Generator (`app/llm_generator.py`)

**Purpose**: Generate intelligent responses using Ollama or OpenAI

**Supported Models**:
- **Ollama**: llama3, mistral, qwen2.5
- **OpenAI**: gpt-4, gpt-3.5-turbo

**Usage**:
```python
from app.llm_generator import LLMGenerator

llm = LLMGenerator(
    provider="ollama",
    model="llama3",
    base_url="http://localhost:11434"
)

# Generate response
response = llm.generate_response("Your prompt here")

# Generate with context
result = llm.generate_with_context(query, context)
```

### 7. Answer Formatter (`app/answer_formatter.py`)

**Purpose**: Format LLM responses into professional, structured outputs

**Features**:
- Intent-specific templates
- Section extraction
- Recommendation extraction
- Frontend-ready formatting

**Usage**:
```python
from app.answer_formatter import AnswerFormatter

formatter = AnswerFormatter()

# Format response
formatted = formatter.format_response(
    llm_response="Response text",
    intent="CIN",
    context=context,
    metadata={"confidence": 0.9, "tokens_used": 150}
)

# Format for frontend
frontend_ready = formatter.format_for_frontend(formatted)
```

## API Endpoints

### POST `/api/v1/chat`
Main chat endpoint using full RAG pipeline

**Request**:
```json
{
  "query": "Quels documents contiennent un CIN ?"
}
```

**Response**:
```json
{
  "reply": "Les documents contenant un numéro CIN sont...",
  "intent": "CIN",
  "confidence": 0.9,
  "sources": {
    "mysql": true,
    "documents": true,
    "referentiels": false
  },
  "tokens_used": 150,
  "model": "llama3"
}
```

### POST `/api/v1/index/documents`
Index documents into vector store

**Request**:
```json
{
  "directory": "../sample-documents"
}
```

**Response**:
```json
{
  "status": "success",
  "indexed_chunks": 45,
  "directory": "/path/to/sample-documents"
}
```

### POST `/api/v1/index/referentiels`
Index referentiels into vector store

**Request**:
```json
{
  "directory": "../referentiels"
}
```

**Response**:
```json
{
  "status": "success",
  "indexed_chunks": 120,
  "directory": "/path/to/referentiels"
}
```

### GET `/api/v1/health`
Health check endpoint

**Response**:
```json
{
  "status": "healthy",
  "components": {
    "vector_store": "ok",
    "mysql": "ok",
    "llm": "ok"
  }
}
```

### POST `/api/v1/analyze`
Analyze a single file

**Request**: Multipart form data with file

**Response**:
```json
{
  "confidentialityLevel": "CONFIDENTIEL",
  "assetType": "CONTRAT",
  "sensitiveData": ["CIN", "EMAIL"]
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd IA
pip install -r requirements.txt
```

### 2. Configure MySQL

```bash
# Create database
mysql -u root -p < ../database/schema.sql

# Set environment variables
set MYSQL_HOST=localhost
set MYSQL_DATABASE=copilot_rssi
set MYSQL_USER=root
set MYSQL_PASSWORD=your_password
```

### 3. Install and Start Ollama

```bash
# Download Ollama from https://ollama.ai
# Install and start
ollama serve

# Pull model
ollama pull llama3
```

### 4. Add Referentiels PDFs

Place the following files in `IA/referentiels/`:
- ISO27001.pdf
- ISO27002.pdf
- NIST_CSF_2.0.pdf
- CIS_Controls_v8.pdf
- Loi_09_08.pdf
- Politique_SSI.pdf

### 5. Index Documents

```bash
# Start the server
python main.py

# In another terminal, index documents
curl -X POST http://localhost:8000/api/v1/index/documents \
  -H "Content-Type: application/json" \
  -d '{"directory": "../sample-documents"}'

# Index referentiels
curl -X POST http://localhost:8000/api/v1/index/referentiels \
  -H "Content-Type: application/json" \
  -d '{"directory": "../referentiels"}'
```

## Example Questions

### Documents & Data
- "Quels documents contiennent un CIN ?"
- "Quels sont les risques critiques ?"
- "Combien de contrats existent ?"
- "Quels documents sont très confidentiels ?"
- "Combien de documents avons-nous ?"

### Standards & Compliance
- "Explique ISO 27001"
- "Quelle est la différence entre ISO et NIST ?"
- "Explique CIS Controls"
- "Que dit la Loi 09-08 ?"
- "Sommes-nous conformes à ISO 27001 ?"

### Recommendations
- "Comment corriger ce risque ?"
- "Que recommande-t-on pour les mots de passe ?"
- "Comment améliorer notre sécurité ?"

### General
- "Qu'est-ce qu'un ransomware ?"
- "Explique le concept de défense en profondeur"

## Troubleshooting

### MySQL Connection Error
```
Access denied for user 'root'@'localhost'
```
**Solution**: Check MySQL password in environment variables

### Ollama Not Responding
```
Error: LLM not initialized
```
**Solution**: Ensure Ollama is running: `ollama serve`

### Vector Store Empty
```
Search returned 0 results
```
**Solution**: Index documents using `/api/v1/index/documents`

### PyMuPDF Import Error
```
ImportError: DLL load failed
```
**Solution**: Reinstall PyMuPDF: `pip install --force-reinstall pymupdf`

## Performance Optimization

### Chunk Size
Adjust chunk size in `document_ingestion.py`:
- Larger chunks = more context per chunk
- Smaller chunks = more precise search

### Embedding Model
Change model in `vector_store.py`:
- `paraphrase-multilingual-MiniLM-L12-v2` (current, fast)
- `paraphrase-multilingual-mpnet-base-v2` (more accurate, slower)

### LLM Model
Change model in environment variable:
- `llama3` (balanced)
- `mistral` (faster)
- `qwen2.5` (multilingual)

## Security Considerations

1. **MySQL Credentials**: Never commit `.env` file with real passwords
2. **API Access**: Implement authentication for production
3. **File Uploads**: Validate file types and sizes
4. **LLM Output**: Sanitize responses before display
5. **Vector Database**: Secure ChromaDB with authentication in production

## Future Enhancements

- [ ] Streaming responses for real-time chat
- [ ] Conversation history with context retention
- [ ] Multi-user support with authentication
- [ ] Advanced filtering (date ranges, users, etc.)
- [ ] Export reports (PDF, Excel)
- [ ] Webhook notifications for critical risks
- [ ] Integration with SIEM systems
