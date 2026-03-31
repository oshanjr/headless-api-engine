-- Phase 2: Super Admin API Security Schema

-- 1. Create the new column to hold the secure headless identifier natively in the database
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS public_api_key VARCHAR(100) UNIQUE;

-- 2. Backfill existing legacy test tenants explicitly so they don't crash Dashboard grid rendering natively
UPDATE tenants 
SET public_api_key = 'pub_tenant_' || substring(md5(random()::text) from 1 for 10) 
WHERE public_api_key IS NULL;

-- 3. Optional constraint to ensure absolute strict security going forward (run after backfilling old rows)
ALTER TABLE tenants 
ALTER COLUMN public_api_key SET NOT NULL;
