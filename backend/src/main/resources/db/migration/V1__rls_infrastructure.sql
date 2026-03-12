-- ============================================================
-- V1: Row-Level Security (RLS) Infrastructure
-- ============================================================
-- Sets up the foundational RLS mechanism for multi-tenant
-- data isolation. All future tables holding tenant-scoped data
-- should enable RLS and attach the onebook_tenant_isolation policy.
--
-- PREREQUISITES (run once as a PostgreSQL superuser before first migration):
--   CREATE EXTENSION IF NOT EXISTS pgcrypto;       -- needed for gen_random_uuid() on PG < 13
--   DO $$ BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'onebook_app') THEN
--       CREATE ROLE onebook_app NOLOGIN;
--     END IF;
--   END $$;
--   GRANT onebook_app TO onebook;                  -- the application db user
-- ============================================================

-- 1. Helper function: returns the current tenant ID from the
--    session variable 'app.current_tenant'. Every authenticated
--    request must SET this variable before querying.
--    Returns NULL when not set (second param = true). RLS policies
--    using this function should treat NULL as "deny all" by comparing
--    with tenant_id (NULL != NULL evaluates to false in SQL, so no
--    rows are returned when the tenant context is missing).
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_tenant', true);
END;
$$ LANGUAGE plpgsql STABLE;

