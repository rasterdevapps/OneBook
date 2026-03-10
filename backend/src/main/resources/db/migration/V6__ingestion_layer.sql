-- Milestone 6: Sector-Agnostic Universal Ingestion Layer & Automation
-- Creates tables for the Financial Event Gateway, 3-Way Matching,
-- Corporate Card Integration, and supporting infrastructure.

-- Financial Events — normalised events from any external adapter
CREATE TABLE IF NOT EXISTS financial_events (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       VARCHAR(255)    NOT NULL,
    event_uuid      UUID            NOT NULL UNIQUE,
    adapter_type    VARCHAR(30)     NOT NULL,
    event_type      VARCHAR(100)    NOT NULL,
    description     TEXT,
    amount          DECIMAL(19,4),
    currency        VARCHAR(3),
    event_date      DATE,
    source_reference VARCHAR(255),
    debit_account_code  VARCHAR(50),
    credit_account_code VARCHAR(50),
    raw_payload     TEXT,
    industry_tags   TEXT DEFAULT '{}',
    status          VARCHAR(20)     NOT NULL DEFAULT 'RECEIVED',
    error_message   TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_financial_events_tenant_status ON financial_events(tenant_id, status);

-- Purchase Orders — for 3-Way Matching
CREATE TABLE IF NOT EXISTS purchase_orders (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       VARCHAR(255)    NOT NULL,
    po_number       VARCHAR(50)     NOT NULL,
    vendor_name     VARCHAR(255)    NOT NULL,
    description     TEXT,
    total_amount    DECIMAL(19,4)   NOT NULL,
    currency        VARCHAR(3),
    order_date      DATE            NOT NULL,
    line_items      TEXT DEFAULT '[]',
    metadata        TEXT DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_purchase_orders_tenant_po ON purchase_orders(tenant_id, po_number);

-- Goods Receipts — for 3-Way Matching
CREATE TABLE IF NOT EXISTS goods_receipts (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       VARCHAR(255)    NOT NULL,
    gr_number       VARCHAR(50)     NOT NULL,
    po_number       VARCHAR(50)     NOT NULL,
    received_quantity DECIMAL(19,4) NOT NULL,
    total_amount    DECIMAL(19,4)   NOT NULL,
    receipt_date    DATE            NOT NULL,
    line_items      TEXT DEFAULT '[]',
    metadata        TEXT DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_goods_receipts_tenant_gr ON goods_receipts(tenant_id, gr_number);
CREATE INDEX idx_goods_receipts_tenant_po ON goods_receipts(tenant_id, po_number);

-- Vendor Invoices — for 3-Way Matching and OCR processing
CREATE TABLE IF NOT EXISTS vendor_invoices (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       VARCHAR(255)    NOT NULL,
    invoice_number  VARCHAR(50)     NOT NULL,
    po_number       VARCHAR(50)     NOT NULL,
    vendor_name     VARCHAR(255)    NOT NULL,
    total_amount    DECIMAL(19,4)   NOT NULL,
    currency        VARCHAR(3),
    invoice_date    DATE            NOT NULL,
    line_items      TEXT DEFAULT '[]',
    ocr_extracted   BOOLEAN         NOT NULL DEFAULT FALSE,
    metadata        TEXT DEFAULT '{}',
    match_status    VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_vendor_invoices_tenant_inv ON vendor_invoices(tenant_id, invoice_number);
CREATE INDEX idx_vendor_invoices_tenant_po ON vendor_invoices(tenant_id, po_number);

-- Corporate Card Transactions
CREATE TABLE IF NOT EXISTS card_transactions (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       VARCHAR(255)    NOT NULL,
    external_id     VARCHAR(100)    NOT NULL,
    card_last_four  VARCHAR(4),
    merchant_name   VARCHAR(255),
    amount          DECIMAL(19,4)   NOT NULL,
    currency        VARCHAR(3),
    transaction_date DATE           NOT NULL,
    category        VARCHAR(100),
    description     TEXT,
    posted          BOOLEAN         NOT NULL DEFAULT FALSE,
    metadata        TEXT DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_card_transactions_tenant_ext ON card_transactions(tenant_id, external_id);
CREATE INDEX idx_card_transactions_tenant_unposted ON card_transactions(tenant_id, posted) WHERE posted = FALSE;
