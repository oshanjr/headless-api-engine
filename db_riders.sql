-- Fleet Architecture: Ground Routing Nodes
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  vehicle_type VARCHAR(50) DEFAULT 'motorcycle',
  status VARCHAR(50) DEFAULT 'offline', -- 'offline', 'available', 'delivering'
  is_active BOOLEAN DEFAULT TRUE,
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patch for existing tables missing new columns (safe to re-run anytime)
ALTER TABLE riders ADD COLUMN IF NOT EXISTS phone VARCHAR(50) UNIQUE;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50) DEFAULT 'motorcycle';
ALTER TABLE riders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'offline';
ALTER TABLE riders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) DEFAULT NULL;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) DEFAULT NULL;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
