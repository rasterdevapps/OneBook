-- ============================================================
-- V3: Ledger Accounts & Double-Entry Journal
-- ============================================================
-- Creates the core accounting tables:
--   • ledger_accounts  — Chart of Accounts with hierarchy
--   • journal_transactions — Transaction headers with UUID
--   • journal_entries — Individual debit/credit lines
--
-- Integrity:
--   • Transaction UUID links debits and credits
--   • FK constraints prevent orphan entries
--   • CHECK constraints enforce valid entry types and amounts
--   • Trigger enforces sum(debits) == sum(credits) per transaction
-- ============================================================

-- 1. Ledger Accounts (Chart of Accounts)
CREATE TABLE ledger_accounts (
    id                  BIGSERIAL       PRIMARY KEY,
    tenant_id           TEXT            NOT NULL DEFAULT current_tenant_id(),
    cost_center_id      BIGINT          NOT NULL REFERENCES cost_centers(id),
    account_code        VARCHAR(50)     NOT NULL,
    account_name        VARCHAR(255)    NOT NULL,
    account_type        VARCHAR(20)     NOT NULL,
    parent_account_id   BIGINT          REFERENCES ledger_accounts(id),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    metadata            JSONB           NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_account_type CHECK (
        account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')
    ),
    CONSTRAINT uq_ledger_account_code UNIQUE (tenant_id, cost_center_id, account_code)
);

ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ledger_account_tenant_isolation ON ledger_accounts
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON ledger_accounts TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE ledger_accounts_id_seq TO onebook_app;

-- 2. Journal Transactions (Transaction Headers)
--    The transaction_uuid links all related debit/credit entries.
CREATE TABLE journal_transactions (
    id                  BIGSERIAL       PRIMARY KEY,
    tenant_id           TEXT            NOT NULL DEFAULT current_tenant_id(),
    transaction_uuid    UUID            NOT NULL DEFAULT gen_random_uuid(),
    transaction_date    DATE            NOT NULL,
    description         TEXT,
    posted              BOOLEAN         NOT NULL DEFAULT FALSE,
    metadata            JSONB           NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_transaction_uuid UNIQUE (transaction_uuid)
);

ALTER TABLE journal_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY journal_transaction_tenant_isolation ON journal_transactions
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON journal_transactions TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE journal_transactions_id_seq TO onebook_app;

-- 3. Journal Entries (Individual Debit/Credit Lines)
--    FK to journal_transactions prevents orphan entries.
--    FK to ledger_accounts ensures valid account references.
CREATE TABLE journal_entries (
    id                  BIGSERIAL       PRIMARY KEY,
    tenant_id           TEXT            NOT NULL DEFAULT current_tenant_id(),
    transaction_id      BIGINT          NOT NULL REFERENCES journal_transactions(id) ON DELETE CASCADE,
    account_id          BIGINT          NOT NULL REFERENCES ledger_accounts(id),
    entry_type          VARCHAR(6)      NOT NULL,
    amount              DECIMAL(19,4)   NOT NULL,
    description         TEXT,
    metadata            JSONB           NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_entry_type CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    CONSTRAINT chk_positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_journal_entries_transaction ON journal_entries(transaction_id);
CREATE INDEX idx_journal_entries_account    ON journal_entries(account_id);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY journal_entry_tenant_isolation ON journal_entries
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON journal_entries TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE journal_entries_id_seq TO onebook_app;

-- 4. Trigger: enforce balanced entries when a transaction is posted.
--    Prevents any transaction from being marked as posted unless
--    sum(debits) == sum(credits). Also requires at least one debit
--    and one credit entry to exist.
CREATE OR REPLACE FUNCTION check_balanced_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_debit_sum   DECIMAL(19,4);
    v_credit_sum  DECIMAL(19,4);
    v_debit_count INTEGER;
    v_credit_count INTEGER;
BEGIN
    -- Only enforce when marking a transaction as posted
    IF NEW.posted = TRUE AND (OLD.posted IS NULL OR OLD.posted = FALSE) THEN
        SELECT
            COALESCE(SUM(CASE WHEN entry_type = 'DEBIT'  THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN entry_type = 'DEBIT'  THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN 1 ELSE 0 END), 0)
        INTO v_debit_sum, v_credit_sum, v_debit_count, v_credit_count
        FROM journal_entries
        WHERE transaction_id = NEW.id;

        IF v_debit_count = 0 OR v_credit_count = 0 THEN
            RAISE EXCEPTION 'Transaction % has no balancing counterpart: requires at least one debit and one credit entry',
                NEW.transaction_uuid;
        END IF;

        IF v_debit_sum <> v_credit_sum THEN
            RAISE EXCEPTION 'Transaction % is unbalanced: debits=% credits=%',
                NEW.transaction_uuid, v_debit_sum, v_credit_sum;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_balanced_transaction
    BEFORE UPDATE ON journal_transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_balanced_transaction();
