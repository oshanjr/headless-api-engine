-- PostgreSQL Database Schema for Multi-Tenant Delivery Platform

-- ==========================================
-- 1. Global Settings
-- ==========================================
-- This table stores platform-wide configurations and DOES NOT have a tenant_id.
CREATE TABLE global_settings (
    id SERIAL PRIMARY KEY,
    current_fuel_price NUMERIC(10, 2) NOT NULL DEFAULT 398.00,
    base_fare_1km NUMERIC(10, 2) NOT NULL DEFAULT 145.00,
    fuel_efficiency NUMERIC(10, 2) NOT NULL DEFAULT 40.00, -- Measured in km/L
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the default global settings
INSERT INTO global_settings (current_fuel_price, base_fare_1km, fuel_efficiency) 
VALUES (398.00, 145.00, 40.00);

-- ==========================================
-- 2. Tenants Table
-- ==========================================
-- Stores tenant (restaurant) information. Coordinates for Gampaha are stored as lat/lng.
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,  -- e.g., 7.0873 for Gampaha
    longitude NUMERIC(10, 7) NOT NULL, -- e.g., 79.9992 for Gampaha
    logo_url TEXT,                     -- URL to the restaurant's logo
    primary_color VARCHAR(20) DEFAULT '#000000', -- Brand primary color (HEX code)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast domain lookup (often used in multi-tenant middleware to resolve tenant)
CREATE INDEX idx_tenants_domain ON tenants(domain);

-- ==========================================
-- 3. Menu Items
-- ==========================================
-- Linked to a tenant. Contains products that the restaurant offers.
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Multi-tenant isolation indexing 
CREATE INDEX idx_menu_items_tenant_id ON menu_items(tenant_id);

-- ==========================================
-- 4. Riders
-- ==========================================
-- Linked to a tenant. Represents delivery personnel available to the specific restaurant.
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'motorcycle',
    is_active BOOLEAN DEFAULT false,           -- Changed default to false
    active_until TIMESTAMP WITH TIME ZONE,     -- The time the 24h pass expires
    wallet_balance NUMERIC(10, 2) DEFAULT 0.00,-- Rider's pre-paid balance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_riders_tenant_id ON riders(tenant_id);

-- ==========================================
-- 5. Orders
-- ==========================================
-- Linked to a tenant. Stores delivery orders, customer details, and assigned rider.
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_latitude NUMERIC(10, 7) NOT NULL,
    delivery_longitude NUMERIC(10, 7) NOT NULL,
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, preparing, ready, out_for_delivery, delivered, cancelled
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_rider_id ON orders(rider_id);

-- ==========================================
-- 6. Order Items (Architect's Addition)
-- ==========================================
-- Necessary for a normalized database to link orders with their respective menu items.
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_tenant_id ON order_items(tenant_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

/*
========================================================================
Architectural Note: Row-Level Security (RLS) for Bulletproof Isolation
========================================================================
To strictly prevent cross-tenant data leaks, you can enable PostgreSQL's RLS.
Example setup:

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY menu_items_isolation_policy ON menu_items
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

Your application code would then set this session variable when connecting:
SET app.current_tenant_id = 'your-resolved-tenant-uuid';
*/
