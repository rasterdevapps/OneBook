-- ============================================================
-- V1: Row-Level Security (RLS) Infrastructure
-- ============================================================
-- Sets up the foundational RLS mechanism for multi-tenant
-- data isolation. All future tables holding tenant-scoped data
-- should enable RLS and attach the onebook_tenant_isolation policy.
-- ============================================================

-- 1. Helper function: returns the current tenant ID from the
--    session variable 'app.current_tenant'. Every authenticated
--    request must SET this variable before querying.
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_tenant', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Application role used by the Spring Boot service.
--    RLS policies are enforced for non-superuser roles.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'onebook_app') THEN
        CREATE ROLE onebook_app NOLOGIN;
    END IF;
END
$$;

-- Grant the application role to the current user so Spring Boot
-- connections can SET ROLE onebook_app when needed.
GRANT onebook_app TO CURRENT_USER;
