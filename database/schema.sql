-- Copilot RSSI - Schéma MySQL
CREATE DATABASE IF NOT EXISTS copilot_rssi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE copilot_rssi;

-- Rôles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    role_id BIGINT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Chats (for copilot conversations)
CREATE TABLE IF NOT EXISTS chats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages (for copilot chat messages)
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    sender ENUM('USER', 'ASSISTANT') NOT NULL,
    content TEXT NOT NULL,
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Settings (system settings)
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    logo_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'Africa/Casablanca',
    email VARCHAR(150),
    storage_path VARCHAR(500),
    ocr_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dossiers / répertoires scannés
CREATE TABLE IF NOT EXISTS folders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    parent_id BIGINT NULL,
    scanned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id)
);

-- Actifs informationnels
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    asset_type ENUM('MATERIEL', 'LOGICIEL', 'INFORMATIONNEL', 'HUMAIN', 'ORGANISATIONNEL') NOT NULL,
    description TEXT,
    owner VARCHAR(150),
    criticality ENUM('FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE') DEFAULT 'MOYENNE',
    status ENUM('ACTIF', 'INACTIF', 'ARCHIVE') DEFAULT 'ACTIF',
    value DECIMAL(15,2),
    creation_date DATE,
    location VARCHAR(255),
    responsible VARCHAR(150),
    state VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NULL,
    folder_id BIGINT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    extension VARCHAR(20),
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_date TIMESTAMP NULL,
    modified_date TIMESTAMP NULL,
    permissions VARCHAR(100),
    extracted_text LONGTEXT,
    document_type ENUM('CONTRAT', 'FACTURE', 'RAPPORT', 'PROCEDURE', 'POLITIQUE_SSI', 'DOSSIER_RH', 'NOTE_INTERNE', 'AUTRE') NULL,
    confidentiality_level ENUM('NON_CLASSIFIE', 'PUBLIC', 'INTERNE', 'CONFIDENTIEL', 'TRES_CONFIDENTIEL') NULL,
    analysis_status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
    INDEX idx_document_type (document_type),
    INDEX idx_confidentiality (confidentiality_level)
);

-- Données sensibles détectées
CREATE TABLE IF NOT EXISTS sensitive_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    data_type ENUM('CIN', 'PASSEPORT', 'CNSS', 'TELEPHONE', 'EMAIL', 'ADRESSE', 'IBAN', 'RIB', 'BANQUE', 'FISCAL', 'MOT_DE_PASSE', 'AUTRE') NOT NULL,
    detected_value VARCHAR(500),
    masked_value VARCHAR(500),
    confidence DECIMAL(5,4),
    position_start INT,
    position_end INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_data_type (data_type)
);

-- Risques
CREATE TABLE IF NOT EXISTS risks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NULL,
    asset_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity ENUM('FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE') NOT NULL,
    category VARCHAR(100),
    status ENUM('OUVERT', 'EN_COURS', 'RESOLU', 'IGNORE') DEFAULT 'OUVERT',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

-- Recommandations
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    risk_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('BASSE', 'MOYENNE', 'HAUTE') DEFAULT 'MOYENNE',
    status ENUM('PROPOSEE', 'VALIDEE', 'EN_COURS', 'TERMINEE', 'REJETEE', 'APPLIQUEE') DEFAULT 'PROPOSEE',
    assigned_to BIGINT,
    deadline DATE,
    progress INT DEFAULT 0,
    rssi_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Rapports
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    report_type ENUM('INVENTAIRE', 'CONFORMITE', 'RISQUES', 'CLASSIFICATION') NOT NULL,
    file_path VARCHAR(500),
    content LONGTEXT,
    executive_summary TEXT,
    rssi_signature VARCHAR(255),
    overall_score INT,
    generated_by BIGINT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Référentiels (ISO 27001, NIST, politiques internes...)
CREATE TABLE IF NOT EXISTS referentials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content LONGTEXT,
    source_url VARCHAR(500),
    version VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    objective TEXT,
    controls TEXT,
    compliance_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    duration INT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('RISK', 'ANALYSIS', 'REPORT', 'DOCUMENT', 'RECOMMENDATION', 'SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_at)
);

-- Historique Copilot IA
CREATE TABLE IF NOT EXISTS copilot_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    duration INT,
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_copilot_created (created_at)
);

-- Scores de sécurité
CREATE TABLE IF NOT EXISTS security_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    overall_score INT,
    documents_score INT,
    risks_score INT,
    compliance_score INT,
    recommendations_score INT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Résultats d'analyse détaillés
CREATE TABLE IF NOT EXISTS analysis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    document_type VARCHAR(100),
    confidentiality_level VARCHAR(50),
    pii_detected BOOLEAN,
    risks_count INT,
    compliance_standards TEXT,
    security_score INT,
    detected_data_types TEXT,
    risks_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Données initiales
INSERT IGNORE INTO roles (name, description) VALUES
    ('ADMIN', 'Administrateur système'),
    ('RSSI', 'Responsable Sécurité SI'),
    ('AUDITEUR', 'Auditeur de sécurité'),
    ('LECTEUR', 'Lecteur seul');

INSERT IGNORE INTO referentials (code, name, category, content, version, active, objective, controls, compliance_score) VALUES
('ISO27001', 'ISO/IEC 27001', 'NORME', 'Système de management de la sécurité de l''information (SMSI).', '2022', TRUE, 'Établir, mettre en œuvre, maintenir et améliorer continuellement un SMSI', 'Contrôles d''accès, cryptographie, sécurité physique, gestion des incidents', 85),
('NIST-CSF', 'NIST Cybersecurity Framework', 'NORME', 'Identify, Protect, Detect, Respond, Recover.', '2.0', TRUE, 'Gérer les risques de cybersécurité', 'Identification, protection, détection, réponse, récupération', 78),
('CIS-CONTROLS', 'CIS Controls', 'NORME', '18 contrôles de sécurité priorités.', 'v8', TRUE, 'Implémenter les contrôles de sécurité essentiels', 'Inventaire des actifs, contrôle des vulnérabilités, authentification', 80),
('LOI-09-08', 'Loi 09-08', 'LOI', 'Protection des données personnelles au Maroc.', '2009', TRUE, 'Protéger les données personnelles des citoyens', 'Consentement, droits d''accès, sécurité des données', 92),
('POL-SSI', 'Politique SSI interne', 'POLITIQUE', 'Classification Public, Interne, Confidentiel, Très confidentiel.', '1.0', TRUE, 'Définir les règles de sécurité internes', 'Classification des documents, gestion des accès, audit', 80);
