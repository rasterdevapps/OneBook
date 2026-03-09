-- ============================================================
-- Milestone 3: Zero-Knowledge Security Layer ("Blind DBA")
-- ============================================================
-- Adds:
--   1. Encrypted + blind-index columns on ledger_accounts
--   2. Encrypted + blind-index columns on journal_transactions
--   3. Hash-chained audit_log table with RLS
-- ============================================================

-- -----------------------------------------------------------
-- 1. Ledger Accounts — encrypted account name + blind index
-- -----------------------------------------------------------
ALTER TABLE ledger_accounts
    ADD COLUMN account_name_encrypted TEXT,
    ADD COLUMN account_name_blind_index VARCHAR(64);

CREATE INDEX idx_ledger_account_blind_index
    ON ledger_accounts (tenant_id, account_name_blind_index);

-- -----------------------------------------------------------
-- 2. Journal Transactions — encrypted description + blind index
-- -----------------------------------------------------------
ALTER TABLE journal_transactions
    ADD COLUMN description_encrypted TEXT,
    ADD COLUMN description_blind_index VARCHAR(64);

CREATE INDEX idx_journal_txn_desc_blind_index
    ON journal_transactions (tenant_id, description_blind_index);

-- -----------------------------------------------------------
-- 3. Hash-chained Audit Log
-- -----------------------------------------------------------
CREATE TABLE audit_log (
    id          BIGSERIAL    PRIMARY KEY,
    tenant_id   TEXT         NOT NULL,
    table_name  VARCHAR(100) NOT NULL,
    record_id   BIGINT,
    operation   VARCHAR(10)  NOT NULL,     -- INSERT, UPDATE, DELETE
    old_values  TEXT,
    new_values  TEXT,
    hash        TEXT         NOT NULL,     -- SHA-256 of (prev_hash || content)
    prev_hash   TEXT,                      -- Hash of predecessor (chain link)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by  VARCHAR(255)
);

-- Tenant isolation
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_tenant_isolation ON audit_log
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT ON audit_log TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq TO onebook_app;

-- Indexes for efficient queries
CREATE INDEX idx_audit_tenant        ON audit_log (tenant_id);
CREATE INDEX idx_audit_record        ON audit_log (tenant_id, table_name, record_id);
CREATE INDEX idx_audit_hash_chain    ON audit_log (prev_hash);
