-- V4: Seed data for initial Chart of Accounts structure
-- Provides a default enterprise, branch, cost center, and standard accounts.
-- Uses a default tenant 'default-tenant' for demonstration purposes.

-- Default organizational hierarchy
INSERT INTO enterprises (tenant_id, code, name, metadata, created_at, updated_at)
VALUES ('default-tenant', 'ENT-001', 'Default Enterprise', '{}', NOW(), NOW());

INSERT INTO branches (tenant_id, enterprise_id, code, name, metadata, created_at, updated_at)
VALUES ('default-tenant', (SELECT id FROM enterprises WHERE code = 'ENT-001' AND tenant_id = 'default-tenant'),
        'BR-001', 'Head Office', '{}', NOW(), NOW());

INSERT INTO cost_centers (tenant_id, branch_id, code, name, metadata, created_at, updated_at)
VALUES ('default-tenant', (SELECT id FROM branches WHERE code = 'BR-001' AND tenant_id = 'default-tenant'),
        'CC-001', 'General', '{}', NOW(), NOW());

-- Standard Chart of Accounts (5 account types)
-- Assets
INSERT INTO ledger_accounts (tenant_id, cost_center_id, account_code, account_name, account_type, is_active, metadata, created_at, updated_at)
VALUES
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '1000', 'Cash', 'ASSET', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '1100', 'Accounts Receivable', 'ASSET', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '1200', 'Inventory', 'ASSET', true, '{}', NOW(), NOW());

-- Liabilities
INSERT INTO ledger_accounts (tenant_id, cost_center_id, account_code, account_name, account_type, is_active, metadata, created_at, updated_at)
VALUES
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '2000', 'Accounts Payable', 'LIABILITY', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '2100', 'Loans Payable', 'LIABILITY', true, '{}', NOW(), NOW());

-- Equity
INSERT INTO ledger_accounts (tenant_id, cost_center_id, account_code, account_name, account_type, is_active, metadata, created_at, updated_at)
VALUES
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '3000', 'Owner Equity', 'EQUITY', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '3100', 'Retained Earnings', 'EQUITY', true, '{}', NOW(), NOW());

-- Revenue
INSERT INTO ledger_accounts (tenant_id, cost_center_id, account_code, account_name, account_type, is_active, metadata, created_at, updated_at)
VALUES
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '4000', 'Sales Revenue', 'REVENUE', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '4100', 'Service Revenue', 'REVENUE', true, '{}', NOW(), NOW());

-- Expenses
INSERT INTO ledger_accounts (tenant_id, cost_center_id, account_code, account_name, account_type, is_active, metadata, created_at, updated_at)
VALUES
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '5000', 'Cost of Goods Sold', 'EXPENSE', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '5100', 'Salaries Expense', 'EXPENSE', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '5200', 'Rent Expense', 'EXPENSE', true, '{}', NOW(), NOW()),
    ('default-tenant', (SELECT id FROM cost_centers WHERE code = 'CC-001' AND tenant_id = 'default-tenant'),
     '5300', 'Utilities Expense', 'EXPENSE', true, '{}', NOW(), NOW());
