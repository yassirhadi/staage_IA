# Intelligent Assistant Setup Guide

## Overview

The Copilot RSSI Assistant has been transformed from a simple RAG system into a powerful intelligent assistant with full LLM integration. This guide will help you configure and use all the new features.

## New Features

### 1. LLM Integration (OpenAI or Ollama)
- **OpenAI**: Use GPT-4o, GPT-4o-mini, or other OpenAI models
- **Ollama**: Use local models like Llama3, Mistral, Qwen2.5 for free
- **Automatic fallback**: If LLM is not configured, uses rule-based responses

### 2. Intent Detection
- Automatically detects user intent (CIN, RISQUES, DOCUMENTS, etc.)
- Routes queries to appropriate data sources
- Extracts entities (severity, data types, document types)

### 3. Conversation Memory
- Maintains conversation context across exchanges
- Remembers previous questions for follow-up queries
- Automatic memory management (keeps last 10 exchanges)

### 4. Function Calling
- Structured database queries via function calls
- Automatic parameter extraction from natural language
- Functions for documents, risks, statistics, scores, etc.

### 5. Hybrid Search
- Combines SQL database search with vector similarity
- Ranks results from multiple sources
- Provides comprehensive search results

### 6. Knowledge Base
- Built-in knowledge of security standards (ISO 27001, NIST, RGPD, etc.)
- Detailed information about best practices
- Comparison capabilities between standards

### 7. Intelligent Summarization
- AI-powered summaries of risks, documents, and system state
- Executive summaries for dashboard
- Prioritized action items

### 8. AI Recommendations Engine
- Generates context-aware recommendations
- Prioritizes actions based on risk severity
- Provides actionable next steps

### 9. Statistics & Dashboard
- Comprehensive system statistics
- AI-generated dashboard summaries
- Real-time security and compliance scores

## Installation Steps

### Step 1: Configure LLM

Choose between OpenAI (paid, cloud) or Ollama (free, local):

#### Option A: Ollama (Recommended for free usage)

1. Install Ollama:
   ```bash
   # Windows: Download from https://ollama.ai
   # Mac: brew install ollama
   # Linux: curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. Start Ollama:
   ```bash
   ollama serve
   ```

3. Pull a model:
   ```bash
   ollama pull llama3.1:8b
   # or
   ollama pull mistral
   # or
   ollama pull qwen2.5
   ```

4. Configure the assistant:
   ```bash
   cd IA
   python setup_llm.py
   ```
   Select option 1 (Ollama) and enter your model name.

#### Option B: OpenAI (Paid, more powerful)

1. Get an API key from https://platform.openai.com/api-keys

2. Configure the assistant:
   ```bash
   cd IA
   python setup_llm.py
   ```
   Select option 2 (OpenAI) and enter your API key.

### Step 2: Test LLM Connection

```bash
cd IA
python test_llm_connection.py
```

This will verify that the LLM is properly configured and accessible.

### Step 3: Start the AI Service

```bash
cd IA
python run.py
```

The service will start on http://localhost:8000

### Step 4: Test the Intelligent Assistant

```bash
cd IA
python test_intelligent_assistant.py
```

This will run comprehensive tests on all features.

## API Endpoints

### Chat Endpoint
```
POST /api/v1/chat
Content-Type: application/json

{
  "question": "Quels documents contiennent un CIN ?"
}

Response:
{
  "answer": "Trois documents contiennent un numéro CIN : ...",
  "sources": []
}
```

### Status Endpoint
```
GET /api/v1/status

Response:
{
  "status": "running",
  "llm_provider": "ollama",
  "llm_status": "connected",
  "llm_model": "llama3.1:8b",
  "active_conversations": 1
}
```

### Summary Endpoint
```
POST /api/v1/summary
Content-Type: application/json

{
  "summary_type": "dashboard"
}

Response:
{
  "summary": "État général du système : ...",
  "type": "dashboard"
}
```

### Recommendations Endpoint
```
POST /api/v1/recommendations
Content-Type: application/json

{
  "user_question": "Que dois-je faire ?"
}

Response:
{
  "recommendations": "Voici les actions prioritaires : ..."
}
```

### Dashboard Endpoint
```
POST /api/v1/dashboard

Response:
{
  "statistics": {
    "documents_count": 125,
    "risks_count": 27,
    "security_score": 75
  },
  "summary": "Le système est dans un état moyen...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Example Questions

The intelligent assistant can now handle complex questions like:

### Basic Queries
- "Quels documents contiennent un CIN ?"
- "Combien de documents RH ?"
- "Quels risques sont critiques ?"

### Intent-Based Queries
- "Quels rapports sont terminés ?"
- "Quel est le score global ?"
- "Quels documents sont Très confidentiels ?"

### Knowledge Base Queries
- "Explique ISO 27001"
- "Qu'est-ce que le NIST CSF ?"
- "Compare ISO 27001 et NIST"
- "Explique la Loi 09-08"

### Action-Oriented Queries
- "Que dois-je faire ?"
- "Génère un plan d'action"
- "Quelles sont les recommandations prioritaires ?"

### Complex Queries
- "Quels risques sont liés au RGPD ?"
- "Quels documents doivent être chiffrés ?"
- "Résume l'état de sécurité"

### Dashboard Queries
- "Résume le système"
- "Donne-moi un tableau de bord"
- "Quel est l'état global de la sécurité ?"

### Conversation Follow-ups
- "Quels documents contiennent un CIN ?" → "Lequel est le plus critique ?"
- "Quels sont les risques ?" → "Quels sont les plus graves ?"

## Architecture

The intelligent assistant follows this pipeline:

```
User Question
    ↓
Intent Detection
    ↓
Function Calling (if applicable)
    ↓
Data Fetching (SQL + Vector + Knowledge Base)
    ↓
Context Building
    ↓
LLM Processing (with conversation history)
    ↓
Response Generation
    ↓
Memory Update
```

## Troubleshooting

### LLM Not Connected

**Problem**: Status shows "llm_status": "not_configured"

**Solution**:
1. Run `python setup_llm.py` to configure LLM
2. If using Ollama, ensure it's running: `ollama serve`
3. If using OpenAI, verify your API key is valid
4. Run `python test_llm_connection.py` to verify

### Slow Responses

**Problem**: Responses take too long

**Solution**:
1. Use a faster model (e.g., llama3.1:8b instead of llama3)
2. Reduce context window in config
3. Use Ollama instead of OpenAI for local processing
4. Check database query performance

### Poor Responses

**Problem**: LLM gives irrelevant answers

**Solution**:
1. Ensure context is being built correctly
2. Check that database has data
3. Verify intent detection is working
4. Try a more powerful model (GPT-4o instead of GPT-4o-mini)

### Memory Issues

**Problem**: Conversation memory not working

**Solution**:
1. Check that conversation_id is consistent
2. Verify memory is being updated in logs
3. Ensure not exceeding memory limits

## Configuration

Edit `.env` file to customize:

```env
# LLM Configuration
LLM_PROVIDER=ollama  # or "openai"
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini

# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=copilot_rssi
```

## Performance Tips

1. **Use Ollama for free, local processing** - No API costs, better privacy
2. **Choose appropriate model size** - Smaller models are faster
3. **Enable caching** - LLM instance is cached after first initialization
4. **Limit conversation history** - Only last 10 exchanges are kept
5. **Use function calling** - Faster than full LLM processing for simple queries

## Next Steps

1. Configure your LLM (OpenAI or Ollama)
2. Test the connection with `test_llm_connection.py`
3. Start the service with `python run.py`
4. Run comprehensive tests with `test_intelligent_assistant.py`
5. Integrate with your frontend
6. Customize prompts and knowledge base as needed

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review error messages in console
- Verify configuration in `.env`
- Test individual components with test scripts

## License

This is part of the Copilot RSSI project for PFE (Projet de Fin d'Études).
