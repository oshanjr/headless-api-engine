-- 1. Add `is_active` to control monthly billing manually
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Add `subscription_expires_at` to handle automated 30-day locks
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;

-- 3. (Optional / Recommended) Update all existing tenants to ensure they have an initial 30 days active
UPDATE tenants 
SET subscription_expires_at = NOW() + INTERVAL '30 days' 
WHERE subscription_expires_at IS NULL;
