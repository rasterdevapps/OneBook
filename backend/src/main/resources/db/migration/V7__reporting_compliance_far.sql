-- ============================================================
-- V7 — Reporting, Tax Compliance & Fixed Asset Register
-- Milestone 7: Financial reporting, compliance, FAR, reconciliation
-- ============================================================

-- 1. Tenant Locale Configs — Locale/tax configuration per tenant
CREATE TABLE tenant_locale_configs (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    country_code            VARCHAR(3)      NOT NULL,
    currency_code           VARCHAR(3)      NOT NULL,
    locale                  VARCHAR(10)     NOT NULL,
    tax_regime              VARCHAR(50),
    fiscal_year_start_month INT             NOT NULL DEFAULT 4,
    metadata                JSONB           NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_locale_configs_tenant UNIQUE (tenant_id),
    CONSTRAINT chk_fiscal_year_start_month CHECK (
        fiscal_year_start_month BETWEEN 1 AND 12
    )
);

ALTER TABLE tenant_locale_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_locale_config_tenant_isolation ON tenant_locale_configs
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_locale_configs TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE tenant_locale_configs_id_seq TO onebook_app;

-- 2. Feature Entitlements — Feature toggles per tenant
CREATE TABLE feature_entitlements (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       TEXT            NOT NULL DEFAULT current_tenant_id(),
    feature_code    VARCHAR(100)    NOT NULL,
    enabled         BOOLEAN         NOT NULL DEFAULT FALSE,
    metadata        JSONB           NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_feature_entitlements_tenant_feature UNIQUE (tenant_id, feature_code)
);

ALTER TABLE feature_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY feature_entitlement_tenant_isolation ON feature_entitlements
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_entitlements TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE feature_entitlements_id_seq TO onebook_app;

-- 3. Fixed Assets — Fixed Asset Register
CREATE TABLE fixed_assets (
    id                          BIGSERIAL       PRIMARY KEY,
    tenant_id                   TEXT            NOT NULL DEFAULT current_tenant_id(),
    asset_code                  VARCHAR(50)     NOT NULL,
    asset_name                  VARCHAR(255)    NOT NULL,
    description                 TEXT,
    asset_account_id            BIGINT          NOT NULL REFERENCES ledger_accounts(id),
    depreciation_account_id     BIGINT          NOT NULL REFERENCES ledger_accounts(id),
    purchase_date               DATE            NOT NULL,
    purchase_cost               DECIMAL(19,4)   NOT NULL,
    salvage_value               DECIMAL(19,4)   NOT NULL DEFAULT 0,
    useful_life_months          INT             NOT NULL,
    depreciation_method         VARCHAR(20)     NOT NULL DEFAULT 'STRAIGHT_LINE',
    accumulated_depreciation    DECIMAL(19,4)   NOT NULL DEFAULT 0,
    status                      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    disposal_date               DATE,
    disposal_amount             DECIMAL(19,4),
    branch_id                   BIGINT          REFERENCES branches(id),
    metadata                    JSONB           NOT NULL DEFAULT '{}',
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_fixed_assets_tenant_code UNIQUE (tenant_id, asset_code),
    CONSTRAINT chk_depreciation_method CHECK (
        depreciation_method IN ('STRAIGHT_LINE', 'WRITTEN_DOWN_VALUE')
    ),
    CONSTRAINT chk_fixed_asset_status CHECK (
        status IN ('ACTIVE', 'DISPOSED', 'IMPAIRED')
    ),
    CONSTRAINT chk_useful_life_positive CHECK (useful_life_months > 0),
    CONSTRAINT chk_salvage_within_cost CHECK (salvage_value <= purchase_cost),
    CONSTRAINT chk_accum_depr_within_limit CHECK (
        accumulated_depreciation <= (purchase_cost - salvage_value)
    )
);

ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY fixed_asset_tenant_isolation ON fixed_assets
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON fixed_assets TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE fixed_assets_id_seq TO onebook_app;

CREATE INDEX idx_fixed_assets_tenant_status ON fixed_assets(tenant_id, status);
CREATE INDEX idx_fixed_assets_tenant_branch ON fixed_assets(tenant_id, branch_id);

-- 4. E-Invoices — Electronic invoicing records
CREATE TABLE e_invoices (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    invoice_number          VARCHAR(100)    NOT NULL,
    invoice_date            DATE            NOT NULL,
    buyer_gstin             VARCHAR(15),
    seller_gstin            VARCHAR(15),
    total_amount            DECIMAL(19,4)   NOT NULL,
    tax_amount              DECIMAL(19,4)   NOT NULL DEFAULT 0,
    irn                     VARCHAR(100),
    status                  VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    e_way_bill_number       VARCHAR(20),
    journal_transaction_id  BIGINT          REFERENCES journal_transactions(id),
    metadata                JSONB           NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_e_invoices_tenant_number UNIQUE (tenant_id, invoice_number),
    CONSTRAINT chk_e_invoice_status CHECK (
        status IN ('DRAFT', 'GENERATED', 'CANCELLED')
    )
);

ALTER TABLE e_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY e_invoice_tenant_isolation ON e_invoices
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON e_invoices TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE e_invoices_id_seq TO onebook_app;

CREATE INDEX idx_e_invoices_tenant_status ON e_invoices(tenant_id, status);
CREATE INDEX idx_e_invoices_tenant_date ON e_invoices(tenant_id, invoice_date);

-- 5. Bank Feed Transactions — Bank reconciliation feed
CREATE TABLE bank_feed_transactions (
    id                          BIGSERIAL       PRIMARY KEY,
    tenant_id                   TEXT            NOT NULL DEFAULT current_tenant_id(),
    bank_account_id             BIGINT          NOT NULL REFERENCES ledger_accounts(id),
    external_transaction_id     VARCHAR(100)    NOT NULL,
    transaction_date            DATE            NOT NULL,
    amount                      DECIMAL(19,4)   NOT NULL,
    description                 TEXT,
    matched                     BOOLEAN         NOT NULL DEFAULT FALSE,
    matched_journal_entry_id    BIGINT          REFERENCES journal_entries(id),
    source                      VARCHAR(50)     NOT NULL DEFAULT 'MANUAL',
    metadata                    JSONB           NOT NULL DEFAULT '{}',
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_bank_feed_tenant_ext_id UNIQUE (tenant_id, external_transaction_id),
    CONSTRAINT chk_bank_feed_source CHECK (
        source IN ('MANUAL', 'OPEN_BANKING', 'CSV_IMPORT')
    )
);

ALTER TABLE bank_feed_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY bank_feed_transaction_tenant_isolation ON bank_feed_transactions
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON bank_feed_transactions TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE bank_feed_transactions_id_seq TO onebook_app;

CREATE INDEX idx_bank_feed_txn_tenant_date ON bank_feed_transactions(tenant_id, transaction_date);
CREATE INDEX idx_bank_feed_txn_tenant_unmatched ON bank_feed_transactions(tenant_id, matched)
    WHERE matched = FALSE;

-- 6. Intercompany Eliminations — Intercompany transaction eliminations
CREATE TABLE intercompany_eliminations (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    source_branch_id        BIGINT          NOT NULL REFERENCES branches(id),
    target_branch_id        BIGINT          NOT NULL REFERENCES branches(id),
    journal_transaction_id  BIGINT          NOT NULL REFERENCES journal_transactions(id),
    elimination_amount      DECIMAL(19,4)   NOT NULL,
    eliminated              BOOLEAN         NOT NULL DEFAULT FALSE,
    elimination_date        DATE,
    metadata                JSONB           NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ic_elim_different_branches CHECK (source_branch_id != target_branch_id)
);

ALTER TABLE intercompany_eliminations ENABLE ROW LEVEL SECURITY;
CREATE POLICY intercompany_elimination_tenant_isolation ON intercompany_eliminations
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON intercompany_eliminations TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE intercompany_eliminations_id_seq TO onebook_app;

CREATE INDEX idx_ic_elim_tenant_eliminated ON intercompany_eliminations(tenant_id, eliminated);
CREATE INDEX idx_ic_elim_tenant_source ON intercompany_eliminations(tenant_id, source_branch_id);
CREATE INDEX idx_ic_elim_tenant_target ON intercompany_eliminations(tenant_id, target_branch_id);
