-- Step 1: Link orders to riders
-- Each order can now be assigned to a specific rider
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_id VARCHAR(100) REFERENCES riders(id) ON DELETE SET NULL;

-- Step 2: Add commission tracking to the riders table
ALTER TABLE riders ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 10.00; -- % of delivery fee you take from each rider
ALTER TABLE riders ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT FALSE;       -- You manually flip this to TRUE when they pay
