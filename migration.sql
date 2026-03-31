-- Stage 1: White-Label SaaS Theming Upgrade

-- 1. Add requested columns gracefully (Assuming primary_color might already exist or need type adjustment)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20) DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20) DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS logo_text VARCHAR(255);

-- 2. Update existing test Tenant (localhost) to 'Kottu Hub' (Red Theme)
UPDATE tenants 
SET 
  restaurant_name = 'Kottu Hub',
  primary_color = '#dc2626', 
  secondary_color = '#991b1b',
  logo_text = 'Kottu Hub'
WHERE domain IN ('localhost', '127.0.0.1');

-- 3. Insert new 'Pizza Palace' (Green Theme) strictly mapping to sub-domain natively stripped of :ports
INSERT INTO tenants (
  domain, 
  restaurant_name, 
  latitude, 
  longitude, 
  primary_color, 
  secondary_color, 
  logo_text
) 
VALUES (
  'pizza.localhost', 
  'Gampaha Pizza Palace', 
  7.0910, 
  79.9980, 
  '#16a34a', 
  '#14532d', 
  'Pizza Palace'
)
ON CONFLICT (domain) 
DO UPDATE SET 
  primary_color = '#16a34a',
  logo_text = 'Pizza Palace',
  restaurant_name = 'Gampaha Pizza Palace';
