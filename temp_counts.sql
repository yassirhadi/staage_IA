SELECT "folders" as table_name, COUNT(*) as count FROM folders
UNION ALL
SELECT "documents", COUNT(*) FROM documents
UNION ALL
SELECT "assets", COUNT(*) FROM assets
UNION ALL
SELECT "sensitive_data", COUNT(*) FROM sensitive_data
UNION ALL
SELECT "risks", COUNT(*) FROM risks
UNION ALL
SELECT "recommendations", COUNT(*) FROM recommendations
UNION ALL
SELECT "reports", COUNT(*) FROM reports
UNION ALL
SELECT "audit_logs", COUNT(*) FROM audit_logs;
