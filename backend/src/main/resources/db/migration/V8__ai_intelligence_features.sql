-- ============================================================
-- V8 — Advanced Intelligence & AI Features
-- Milestone 8: Forecasting, MTM, Corporate Actions, Digital Assets
-- ============================================================

-- 1. Investment Holdings — Share-market portfolio tracking
CREATE TABLE investment_holdings (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    symbol                  VARCHAR(20)     NOT NULL,
    holding_name            VARCHAR(255)    NOT NULL,
    holding_type            VARCHAR(30)     NOT NULL,
    quantity                DECIMAL(19,4)   NOT NULL DEFAULT 0,
    cost_basis              DECIMAL(19,4)   NOT NULL DEFAULT 0,
    current_market_price    DECIMAL(19,4)   DEFAULT 0,
    market_value            DECIMAL(19,4)   DEFAULT 0,
    unrealized_gain_loss    DECIMAL(19,4)   DEFAULT 0,
    last_valuation_date     DATE,
    ledger_account_id       BIGINT          REFERENCES ledger_accounts(id),
    metadata                TEXT            NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_investment_holdings_tenant_symbol UNIQUE (tenant_id, symbol),
    CONSTRAINT chk_investment_holding_type CHECK (
        holding_type IN ('EQUITY_SHARE', 'MUTUAL_FUND', 'BOND', 'DERIVATIVE', 'ETF')
    )
);

ALTER TABLE investment_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY investment_holdings_tenant_isolation ON investment_holdings
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON investment_holdings TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE investment_holdings_id_seq TO onebook_app;

-- 2. Corporate Actions — Stock Splits, Dividends, Bonus Issues
CREATE TABLE corporate_actions (
    id                  BIGSERIAL       PRIMARY KEY,
    tenant_id           TEXT            NOT NULL DEFAULT current_tenant_id(),
    holding_id          BIGINT          NOT NULL REFERENCES investment_holdings(id),
    action_type         VARCHAR(30)     NOT NULL,
    record_date         DATE            NOT NULL,
    execution_date      DATE,
    ratio               DECIMAL(10,4),
    amount_per_unit     DECIMAL(19,4),
    processed           BOOLEAN         NOT NULL DEFAULT FALSE,
    metadata            TEXT            NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_corporate_action_type CHECK (
        action_type IN ('STOCK_SPLIT', 'BONUS_ISSUE', 'DIVIDEND', 'RIGHTS_ISSUE', 'BUYBACK')
    )
);

ALTER TABLE corporate_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY corporate_actions_tenant_isolation ON corporate_actions
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON corporate_actions TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE corporate_actions_id_seq TO onebook_app;

-- 3. Digital Assets — Crypto & Digital Token Tracking
CREATE TABLE digital_assets (
    id                      BIGSERIAL       PRIMARY KEY,
    tenant_id               TEXT            NOT NULL DEFAULT current_tenant_id(),
    symbol                  VARCHAR(20)     NOT NULL,
    asset_name              VARCHAR(255)    NOT NULL,
    asset_type              VARCHAR(30)     NOT NULL,
    quantity                DECIMAL(19,8)   NOT NULL DEFAULT 0,
    cost_basis              DECIMAL(19,4)   NOT NULL DEFAULT 0,
    current_price           DECIMAL(19,4)   DEFAULT 0,
    market_value            DECIMAL(19,4)   DEFAULT 0,
    unrealized_gain_loss    DECIMAL(19,4)   DEFAULT 0,
    wallet_address          VARCHAR(255),
    last_valuation_date     DATE,
    ledger_account_id       BIGINT          REFERENCES ledger_accounts(id),
    metadata                TEXT            NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_digital_assets_tenant_symbol UNIQUE (tenant_id, symbol),
    CONSTRAINT chk_digital_asset_type CHECK (
        asset_type IN ('CRYPTOCURRENCY', 'STABLECOIN', 'TOKEN', 'NFT')
    )
);

ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY digital_assets_tenant_isolation ON digital_assets
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON digital_assets TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE digital_assets_id_seq TO onebook_app;
