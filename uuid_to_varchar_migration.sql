-- Phase 3: The Headless String Key Refactor

-- 1. Detach all strictly typed Foreign Key boundaries locking the UI into UUID nodes
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_tenant_id_fkey;
ALTER TABLE riders DROP CONSTRAINT IF EXISTS riders_tenant_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_tenant_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_tenant_id_fkey;

-- 2. Violently rewrite the deeply nested PostgreSQL primitive types off UUID logic natively into Headless Client Strings
ALTER TABLE tenants ALTER COLUMN id TYPE VARCHAR(100) USING id::VARCHAR;
ALTER TABLE menu_items ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::VARCHAR;
ALTER TABLE riders ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::VARCHAR;
ALTER TABLE orders ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::VARCHAR;
ALTER TABLE order_items ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::VARCHAR;

-- 3. Purge the strict UUID autogeneration (Since Node.js/Server Actions now statically generate pub_tenant_...)
ALTER TABLE tenants ALTER COLUMN id DROP DEFAULT;

-- 4. Re-weld the massive Foreign Key architecture, intrinsically allowing string tokens (tenant_12345/pub_tenant_xyz) to route orders instantly
ALTER TABLE menu_items ADD CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE riders ADD CONSTRAINT riders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT order_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
