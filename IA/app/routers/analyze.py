from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.requests import AnalyzeRequest, AnalyzeResponse, ChatRequest, ChatResponse
from app.services.classifier import DocumentClassifier
from app.services.extractor import DocumentExtractor
from app.services.recommendation_generator import RecommendationGenerator
from app.services.risk_analyzer import RiskAnalyzer
from app.services.sensitive_detector import SensitiveDataDetector
from app.db import upsert_document_by_path, upsert_sensitive_data, upsert_risks, upsert_recommendations, upsert_analysis_result

router = APIRouter()

extractor = DocumentExtractor()
classifier = DocumentClassifier()
detector = SensitiveDataDetector()
risk_analyzer = RiskAnalyzer()
recommendation_generator = RecommendationGenerator()


def _build_analysis(file_path: str) -> AnalyzeResponse:
    text = extractor.extract(file_path)
    sensitive_data = detector.detect(text)
    document_type = classifier.classify_type(text, file_path)
    confidentiality = classifier.classify_confidentiality(text, len(sensitive_data))
    risks = risk_analyzer.analyze(text, document_type, confidentiality, sensitive_data)
    recommendations = recommendation_generator.generate(risks)

    return AnalyzeResponse(
        extracted_text=text[:5000],
        document_type=document_type,
        confidentiality_level=confidentiality,
        sensitive_data=sensitive_data,
        risks=risks,
        recommendations=recommendations,
    )


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_document(request: AnalyzeRequest):
    try:
        analysis = _build_analysis(request.file_path)

        # persist results to database (upsert)
        try:
            from pathlib import Path
            path = Path(request.file_path)
            meta = {
                'file_name': path.name,
                'extension': path.suffix.lower(),
                'file_size': path.stat().st_size if path.exists() else None,
                'extracted_text': analysis.extracted_text,
                'document_type': analysis.document_type,
                'confidentiality_level': analysis.confidentiality_level,
                'analysis_status': 'COMPLETED',
            }
            doc_id = upsert_document_by_path(request.file_path, meta)
            upsert_sensitive_data(doc_id, analysis.sensitive_data)
            risk_ids = upsert_risks(doc_id, analysis.risks)
            upsert_recommendations(risk_ids, analysis.recommendations)
            upsert_analysis_result(doc_id, {
                'document_type': analysis.document_type,
                'confidentiality_level': analysis.confidentiality_level,
                'sensitive_data': analysis.sensitive_data,
                'risks': analysis.risks,
                'compliance_standards': '',
                'security_score': 0,
            })
        except Exception as e:
            # log but do not break API response
            import logging
            logging.exception('Persistence failed: %s', e)

        return analysis
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse: {e}")


@router.post("/analyze/upload", response_model=AnalyzeResponse)
async def analyze_upload(file: UploadFile = File(...)):
    import tempfile
    import os

    suffix = os.path.splitext(file.filename or "doc.txt")[1] or ".txt"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        analysis = _build_analysis(tmp_path)
        try:
            from pathlib import Path
            path = Path(tmp_path)
            meta = {
                'file_name': file.filename,
                'extension': path.suffix.lower(),
                'file_size': len(content),
                'extracted_text': analysis.extracted_text,
                'document_type': analysis.document_type,
                'confidentiality_level': analysis.confidentiality_level,
                'analysis_status': 'COMPLETED',
            }
            doc_id = upsert_document_by_path(file.filename or tmp_path, meta)
            upsert_sensitive_data(doc_id, analysis.sensitive_data)
            risk_ids = upsert_risks(doc_id, analysis.risks)
            upsert_recommendations(risk_ids, analysis.recommendations)
            upsert_analysis_result(doc_id, {
                'document_type': analysis.document_type,
                'confidentiality_level': analysis.confidentiality_level,
                'sensitive_data': analysis.sensitive_data,
                'risks': analysis.risks,
                'compliance_standards': '',
                'security_score': 0,
            })
        except Exception:
            import logging
            logging.exception('Persistence failed for uploaded file')
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse: {e}")
    finally:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)
