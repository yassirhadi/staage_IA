
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import mysql.connector

logger = logging.getLogger(__name__)


def _normalize_record(record: Any) -> Any:
    if isinstance(record, dict):
        return record
    if hasattr(record, "model_dump"):
        return record.model_dump()
    if hasattr(record, "dict"):
        return record.dict()
    return record


def _make_cursor(conn, *, dictionary: bool = False):
    return conn.cursor(dictionary=dictionary, buffered=True)


def get_connection():
    from app.config import settings

    host = os.getenv('MYSQL_HOST', settings.mysql_host)
    port = int(os.getenv('MYSQL_PORT', str(settings.mysql_port)))
    user = os.getenv('MYSQL_USER', settings.mysql_user)
    password = os.getenv('MYSQL_PASSWORD', settings.mysql_password)
    database = os.getenv('MYSQL_DATABASE', settings.mysql_database)

    try:
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            autocommit=True,
        )
        return conn
    except Exception as e:
        logger.exception('DB connection failed: %s', e)
        raise


def fetch_documents_with_sensitive(data_type: str) -> List[Dict[str, Any]]:
    q = (
        "SELECT d.id, d.file_name, d.file_path, s.detected_value, s.masked_value, s.confidence "
        "FROM sensitive_data s JOIN documents d ON s.document_id = d.id "
        "WHERE s.data_type = %s"
    )
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (data_type,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_confidential_documents() -> List[Dict[str, Any]]:
    q = (
        "SELECT id, file_name, file_path, confidentiality_level FROM documents "
        "WHERE confidentiality_level IN ('CONFIDENTIEL','TRES_CONFIDENTIEL')"
    )
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_risks() -> List[Dict[str, Any]]:
    q = "SELECT id, document_id, title, description, severity, category, status FROM risks"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_recommendations() -> List[Dict[str, Any]]:
    q = (
        "SELECT r.id, r.risk_id, r.description, r.priority, r.status, r.deadline, r.progress, rk.title as risk_title "
        "FROM recommendations r JOIN risks rk ON r.risk_id = rk.id"
    )
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_documents_by_type(document_type: str) -> List[Dict[str, Any]]:
    q = "SELECT id, file_name, file_path FROM documents WHERE document_type = %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (document_type,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def upsert_document_by_path(file_path: str, meta: Dict[str, Any]) -> int:
    """Insert or update a document record by file_path. Returns document id."""
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn)
        cur.execute("SELECT id FROM documents WHERE file_path = %s LIMIT 1", (file_path,))
        row = cur.fetchone()
        if row:
            doc_id = row[0]
            cur.execute(
                "UPDATE documents SET file_name=%s, extension=%s, file_size=%s, extracted_text=%s, document_type=%s, confidentiality_level=%s, analysis_status=%s WHERE id=%s",
                (
                    meta.get('file_name'),
                    meta.get('extension'),
                    meta.get('file_size'),
                    meta.get('extracted_text'),
                    meta.get('document_type'),
                    meta.get('confidentiality_level'),
                    meta.get('analysis_status', 'COMPLETED'),
                    doc_id,
                ),
            )
            return doc_id

        cur.execute(
            "INSERT INTO documents (file_name, file_path, extension, file_size, extracted_text, document_type, confidentiality_level, analysis_status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                meta.get('file_name'),
                file_path,
                meta.get('extension'),
                meta.get('file_size'),
                meta.get('extracted_text'),
                meta.get('document_type'),
                meta.get('confidentiality_level'),
                meta.get('analysis_status', 'COMPLETED'),
            ),
        )
        return cur.lastrowid
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def upsert_sensitive_data(document_id: int, detections: List[Dict[str, Any]]):
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn)
        for d in detections:
            d = _normalize_record(d)
            cur.execute(
                "SELECT id FROM sensitive_data WHERE document_id=%s AND data_type=%s AND detected_value=%s LIMIT 1",
                (document_id, d.get('data_type'), d.get('detected_value')),
            )
            if cur.fetchone():
                continue
            cur.execute(
                "INSERT INTO sensitive_data (document_id, data_type, detected_value, masked_value, confidence) VALUES (%s,%s,%s,%s,%s)",
                (document_id, d.get('data_type'), d.get('detected_value'), d.get('masked_value'), d.get('confidence')),
            )
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def upsert_risks(document_id: Optional[int], risks: List[Dict[str, Any]]) -> List[int]:
    ids = []
    if not risks:
        return ids
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn)
        for r in risks:
            r = _normalize_record(r)
            title = r.get('title')
            cur.execute("SELECT id FROM risks WHERE document_id=%s AND title=%s LIMIT 1", (document_id, title))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
                continue
            cur.execute(
                "INSERT INTO risks (document_id, title, description, severity, category) VALUES (%s,%s,%s,%s,%s)",
                (document_id, r.get('title'), r.get('description'), r.get('severity'), r.get('category')),
            )
            ids.append(cur.lastrowid)
    finally:
        if cur is not None:
            cur.close()
        conn.close()
    return ids


def upsert_recommendations(risk_ids: List[int], recommendations: List[Dict[str, Any]]):
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn)
        for rid, rec in zip(risk_ids, recommendations):
            rec = _normalize_record(rec)
            cur.execute("SELECT id FROM recommendations WHERE risk_id=%s AND description=%s LIMIT 1", (rid, rec.get('description')))
            if cur.fetchone():
                continue
            cur.execute(
                "INSERT INTO recommendations (risk_id, description, priority, status) VALUES (%s,%s,%s,%s)",
                (rid, rec.get('description'), rec.get('priority'), 'PROPOSEE'),
            )
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def upsert_analysis_result(document_id: int, analysis: Dict[str, Any]):
    analysis = _normalize_record(analysis)
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn)
        cur.execute("SELECT id FROM analysis_results WHERE document_id=%s LIMIT 1", (document_id,))
        row = cur.fetchone()
        detected_types = ','.join(sorted({_normalize_record(d).get('data_type') for d in analysis.get('sensitive_data', []) if _normalize_record(d).get('data_type')}))
        risks_details = ';'.join(_normalize_record(r).get('title', '') for r in analysis.get('risks', []))
        if row:
            cur.execute(
                "UPDATE analysis_results SET document_type=%s, confidentiality_level=%s, pii_detected=%s, risks_count=%s, compliance_standards=%s, security_score=%s, detected_data_types=%s, risks_details=%s WHERE document_id=%s",
                (
                    analysis.get('document_type'),
                    analysis.get('confidentiality_level'),
                    bool(analysis.get('sensitive_data')),
                    len(analysis.get('risks', [])),
                    analysis.get('compliance_standards', ''),
                    analysis.get('security_score', 0),
                    detected_types,
                    risks_details,
                    document_id,
                ),
            )
        else:
            cur.execute(
                "INSERT INTO analysis_results (document_id, document_type, confidentiality_level, pii_detected, risks_count, compliance_standards, security_score, detected_data_types, risks_details) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                (
                    document_id,
                    analysis.get('document_type'),
                    analysis.get('confidentiality_level'),
                    bool(analysis.get('sensitive_data')),
                    len(analysis.get('risks', [])),
                    analysis.get('compliance_standards', ''),
                    analysis.get('security_score', 0),
                    detected_types,
                    risks_details,
                ),
            )
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def insert_copilot_history(user_id: Optional[int], question: str, answer: str, duration: int = 0, tokens_used: int = 0):
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn)
        created_at = datetime.now()  # Use local computer time
        cur.execute("INSERT INTO copilot_history (user_id, question, answer, duration, tokens_used, created_at) VALUES (%s,%s,%s,%s,%s,%s)", (user_id, question, answer, duration, tokens_used, created_at))
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_copilot_history(limit: int = 100) -> List[Dict[str, Any]]:
    """Fetch copilot chat history from database"""
    q = "SELECT id, user_id, question, answer, duration, tokens_used, created_at FROM copilot_history ORDER BY created_at DESC LIMIT %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (limit,))
        records = cur.fetchall()
        return [_normalize_record(r) for r in records]
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_all_documents() -> List[Dict[str, Any]]:
    q = "SELECT id, file_name, file_path, extension, file_size, confidentiality_level, document_type, analysis_status, created_at, updated_at FROM documents"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_sensitive_data_by_type(data_type: str) -> List[Dict[str, Any]]:
    q = (
        "SELECT d.id, d.file_name, d.file_path, s.detected_value, s.masked_value, s.confidence "
        "FROM sensitive_data s JOIN documents d ON s.document_id = d.id "
        "WHERE s.data_type = %s"
    )
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (data_type,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_all_sensitive_data() -> List[Dict[str, Any]]:
    q = (
        "SELECT d.id, d.file_name, d.file_path, s.data_type, s.detected_value, s.masked_value, s.confidence "
        "FROM sensitive_data s JOIN documents d ON s.document_id = d.id"
    )
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_risks_by_severity(severity: str) -> List[Dict[str, Any]]:
    q = "SELECT id, title, description, severity, category, status, created_at FROM risks WHERE severity = %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (severity,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_documents_by_classification(level: str) -> List[Dict[str, Any]]:
    q = "SELECT id, file_name, file_path, confidentiality_level FROM documents WHERE confidentiality_level = %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (level,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_security_scores() -> Dict[str, Any]:
    q = "SELECT * FROM security_scores ORDER BY id DESC LIMIT 1"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        result = cur.fetchone()
        if result:
            return result
        return {"security_score": 0, "compliance_score": 0}
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_latest_analysis() -> Dict[str, Any]:
    q = (
        "SELECT ar.*, d.file_name "
        "FROM analysis_results ar "
        "JOIN documents d ON ar.document_id = d.id "
        "ORDER BY ar.id DESC "
        "LIMIT 1"
    )
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        result = cur.fetchone()
        if result:
            return result
        return {"status": "Aucune analyse disponible"}
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_latest_report() -> Dict[str, Any]:
    q = "SELECT * FROM reports ORDER BY created_at DESC LIMIT 1"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        result = cur.fetchone()
        if result:
            return result
        return {"status": "Aucun rapport disponible"}
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_all_reports() -> List[Dict[str, Any]]:
    q = "SELECT * FROM reports ORDER BY id DESC"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_referentials() -> List[Dict[str, Any]]:
    q = "SELECT * FROM referentials ORDER BY name"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_statistics() -> Dict[str, Any]:
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        stats = {}
        
        # Documents count
        cur.execute("SELECT COUNT(*) as count FROM documents")
        stats['documents_count'] = cur.fetchone()['count']
        
        # Risks count
        cur.execute("SELECT COUNT(*) as count FROM risks")
        stats['risks_count'] = cur.fetchone()['count']
        
        # Confidential documents
        cur.execute("SELECT COUNT(*) as count FROM documents WHERE confidentiality_level IN ('CONFIDENTIEL','TRES_CONFIDENTIEL')")
        stats['confidential_count'] = cur.fetchone()['count']
        
        # Sensitive data count
        cur.execute("SELECT COUNT(*) as count FROM sensitive_data")
        stats['sensitive_count'] = cur.fetchone()['count']
        
        # Reports count
        cur.execute("SELECT COUNT(*) as count FROM reports")
        stats['reports_count'] = cur.fetchone()['count']
        
        # Analyses count
        cur.execute("SELECT COUNT(*) as count FROM analysis_results")
        stats['analyses_count'] = cur.fetchone()['count']
        
        # Users count (if users table exists)
        try:
            cur.execute("SELECT COUNT(*) as count FROM users")
            stats['users_count'] = cur.fetchone()['count']
        except:
            stats['users_count'] = 0
        
        # Risks by severity
        cur.execute("SELECT severity, COUNT(*) as count FROM risks GROUP BY severity")
        stats['risks_by_severity'] = {row['severity']: row['count'] for row in cur.fetchall()}
        
        # Sensitive data by type
        cur.execute("SELECT data_type, COUNT(*) as count FROM sensitive_data GROUP BY data_type")
        stats['sensitive_by_type'] = {row['data_type']: row['count'] for row in cur.fetchall()}
        
        # Documents by type
        cur.execute("SELECT document_type, COUNT(*) as count FROM documents GROUP BY document_type")
        stats['documents_by_type'] = {row['document_type']: row['count'] for row in cur.fetchall()}
        
        # Documents by classification
        cur.execute("SELECT confidentiality_level, COUNT(*) as count FROM documents GROUP BY confidentiality_level")
        stats['documents_by_classification'] = {row['confidentiality_level']: row['count'] for row in cur.fetchall()}
        
        # Total file size
        cur.execute("SELECT SUM(file_size) as total_size FROM documents")
        result = cur.fetchone()
        stats['total_file_size'] = result['total_size'] if result['total_size'] else 0
        
        return stats
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_users() -> List[Dict[str, Any]]:
    """Fetch all users from the database."""
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute("SELECT * FROM users")
        return cur.fetchall()
    except:
        return []
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_documents_by_extension(extension: str) -> List[Dict[str, Any]]:
    """Fetch documents by file extension."""
    q = "SELECT id, file_name, file_path, extension, file_size, confidentiality_level, document_type FROM documents WHERE extension = %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (extension,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_largest_documents(limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch the largest documents by file size."""
    q = "SELECT id, file_name, file_path, extension, file_size, confidentiality_level, document_type FROM documents ORDER BY file_size DESC LIMIT %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (limit,))
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_documents_by_date(date: str) -> List[Dict[str, Any]]:
    """Fetch documents created on a specific date (YYYY-MM-DD format)."""
    q = "SELECT id, file_name, file_path, extension, file_size, confidentiality_level, document_type, created_at FROM documents WHERE DATE(created_at) = %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (date,))
        return cur.fetchall()
    except:
        return []
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_document_content(document_id: int) -> Dict[str, Any]:
    """Fetch document content including extracted text."""
    q = "SELECT id, file_name, file_path, extension, extracted_text, document_type, confidentiality_level FROM documents WHERE id = %s"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q, (document_id,))
        result = cur.fetchone()
        if result:
            return result
        return {"status": "Document non trouvé"}
    finally:
        if cur is not None:
            cur.close()
        conn.close()


def fetch_unanalyzed_documents() -> List[Dict[str, Any]]:
    """Fetch documents that have not been analyzed yet."""
    q = "SELECT id, file_name, file_path, extension, file_size, confidentiality_level, analysis_status FROM documents WHERE analysis_status != 'COMPLETED' OR analysis_status IS NULL"
    conn = get_connection()
    cur = None
    try:
        cur = _make_cursor(conn, dictionary=True)
        cur.execute(q)
        return cur.fetchall()
    finally:
        if cur is not None:
            cur.close()
        conn.close()

