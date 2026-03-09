-- ============================================================
-- V2: Organizational Hierarchy
-- ============================================================
-- Establishes the Enterprise → Branch → Cost Center hierarchy.
-- Each level enforces tenant isolation via RLS and foreign keys
-- guarantee strict data isolation across organizational units.
-- ============================================================

-- 1. Enterprises (Top Level)
CREATE TABLE enterprises (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       TEXT            NOT NULL DEFAULT current_tenant_id(),
    code            VARCHAR(50)     NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    metadata        JSONB           NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_enterprise_tenant_code UNIQUE (tenant_id, code)
);

ALTER TABLE enterprises ENABLE ROW LEVEL SECURITY;
CREATE POLICY enterprise_tenant_isolation ON enterprises
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON enterprises TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE enterprises_id_seq TO onebook_app;

-- 2. Branches (Second Level — belongs to an Enterprise)
CREATE TABLE branches (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       TEXT            NOT NULL DEFAULT current_tenant_id(),
    enterprise_id   BIGINT          NOT NULL REFERENCES enterprises(id),
    code            VARCHAR(50)     NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    metadata        JSONB           NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_branch_enterprise_code UNIQUE (enterprise_id, code)
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_tenant_isolation ON branches
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON branches TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE branches_id_seq TO onebook_app;

-- 3. Cost Centers (Third Level — belongs to a Branch)
CREATE TABLE cost_centers (
    id              BIGSERIAL       PRIMARY KEY,
    tenant_id       TEXT            NOT NULL DEFAULT current_tenant_id(),
    branch_id       BIGINT          NOT NULL REFERENCES branches(id),
    code            VARCHAR(50)     NOT NULL,
    name            VARCHAR(255)    NOT NULL,
    metadata        JSONB           NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cost_center_branch_code UNIQUE (branch_id, code)
);

ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY cost_center_tenant_isolation ON cost_centers
    USING (tenant_id = current_tenant_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON cost_centers TO onebook_app;
GRANT USAGE, SELECT ON SEQUENCE cost_centers_id_seq TO onebook_app;
