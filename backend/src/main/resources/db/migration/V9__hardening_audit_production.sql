-- ============================================================
-- V9 — Hardening, Audit & Production Readiness
-- Milestone 10: Auditor Portal, Document Vault, Security Audit,
--               Observability, Disaster Recovery, Compliance Certs
-- ============================================================

-- 1. Audit Sample Requests — External auditor sample requests
CREATE TABLE audit_sample_requests (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    auditor_name            VARCHAR(255)    NOT NULL,
    auditor_email           VARCHAR(255)    NOT NULL,
    request_description     TEXT            NOT NULL,
    table_name              VARCHAR(100)    NOT NULL,
    sample_size             INT             NOT NULL DEFAULT 10,
    date_from               DATE,
    date_to                 DATE,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    response_data           TEXT,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_sample_status CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')
    ),
    CONSTRAINT chk_sample_size_positive CHECK (sample_size > 0)
);

ALTER TABLE audit_sample_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_sample_request_tenant_isolation ON audit_sample_requests
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_sample_requests TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE audit_sample_requests_id_seq TO onebook_app;

CREATE INDEX idx_audit_sample_tenant_status ON audit_sample_requests(tenant_id, status);

-- 2. Audit Comments — External auditor comments on transactions/records
CREATE TABLE audit_comments (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    auditor_name            VARCHAR(255)    NOT NULL,
    table_name              VARCHAR(100)    NOT NULL,
    record_id               BIGINT          NOT NULL,
    comment_text            TEXT            NOT NULL,
    resolved                BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_comment_tenant_isolation ON audit_comments
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_comments TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE audit_comments_id_seq TO onebook_app;

CREATE INDEX idx_audit_comments_tenant_record ON audit_comments(tenant_id, table_name, record_id);

-- 3. Audit Workflows — Approval workflows for auditors
CREATE TABLE audit_workflows (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    workflow_name           VARCHAR(255)    NOT NULL,
    description             TEXT,
    auditor_name            VARCHAR(255)    NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    approved_at             TIMESTAMPTZ,
    rejected_at             TIMESTAMPTZ,
    rejection_reason        TEXT,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_workflow_status CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED')
    )
);

ALTER TABLE audit_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_workflow_tenant_isolation ON audit_workflows
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_workflows TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE audit_workflows_id_seq TO onebook_app;

CREATE INDEX idx_audit_workflows_tenant_status ON audit_workflows(tenant_id, status);

-- 4. Vault Documents — Encrypted document storage metadata
CREATE TABLE vault_documents (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    file_name               VARCHAR(255)    NOT NULL,
    content_type            VARCHAR(100)    NOT NULL,
    file_size               BIGINT          NOT NULL,
    storage_key             VARCHAR(500)    NOT NULL,
    encryption_key_version  INT             NOT NULL DEFAULT 1,
    checksum                VARCHAR(64)     NOT NULL,
    journal_transaction_id  BIGINT          REFERENCES journal_transactions(id),
    uploaded_by             VARCHAR(255),
    metadata                JSONB           NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_file_size_positive CHECK (file_size > 0)
);

ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY vault_document_tenant_isolation ON vault_documents
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON vault_documents TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE vault_documents_id_seq TO onebook_app;

CREATE INDEX idx_vault_documents_tenant ON vault_documents(tenant_id);
CREATE INDEX idx_vault_documents_journal_txn ON vault_documents(journal_transaction_id);

-- 5. Disaster Recovery Events — Backup and recovery tracking
CREATE TABLE disaster_recovery_events (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    event_type              VARCHAR(30)     NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'STARTED',
    backup_location         VARCHAR(500),
    point_in_time           TIMESTAMPTZ,
    started_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ,
    file_size_bytes         BIGINT,
    error_message           TEXT,
    metadata                JSONB           NOT NULL DEFAULT '{}',
    CONSTRAINT chk_dr_event_type CHECK (
        event_type IN ('FULL_BACKUP', 'INCREMENTAL_BACKUP', 'POINT_IN_TIME_RECOVERY', 'FAILOVER', 'FAILBACK')
    ),
    CONSTRAINT chk_dr_event_status CHECK (
        status IN ('STARTED', 'COMPLETED', 'FAILED')
    )
);

ALTER TABLE disaster_recovery_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY dr_event_tenant_isolation ON disaster_recovery_events
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON disaster_recovery_events TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE disaster_recovery_events_id_seq TO onebook_app;

CREATE INDEX idx_dr_events_tenant_type ON disaster_recovery_events(tenant_id, event_type);

-- 6. Compliance Certifications — Industry compliance tracking
CREATE TABLE compliance_certifications (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    certification_name      VARCHAR(255)    NOT NULL,
    issuing_body            VARCHAR(255)    NOT NULL,
    industry                VARCHAR(100)    NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'NOT_STARTED',
    issued_date             DATE,
    expiry_date             DATE,
    certificate_reference   VARCHAR(255),
    notes                   TEXT,
    metadata                JSONB           NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cert_status CHECK (
        status IN ('NOT_STARTED', 'IN_PROGRESS', 'CERTIFIED', 'EXPIRED', 'REVOKED')
    ),
    CONSTRAINT uq_compliance_cert_tenant_name UNIQUE (tenant_id, certification_name)
);

ALTER TABLE compliance_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_cert_tenant_isolation ON compliance_certifications
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON compliance_certifications TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE compliance_certifications_id_seq TO onebook_app;

CREATE INDEX idx_compliance_certs_tenant_status ON compliance_certifications(tenant_id, status);
