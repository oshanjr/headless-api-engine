import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[Engine Received Payload]:", body); 

    const { tenant_id, customer_name, customer_phone, customer_address, distance_km = 5 } = body;

    if (!tenant_id || !customer_name || !customer_phone || !customer_address) {
      return NextResponse.json(
        { error: "Validation Failed: Missing required fields" }, 
        { status: 400 }
      );
    }

    // [SECURITY GUARD]: Check if the tenant is active and subscription is active
    const tenantCheckRes = await query(`
      SELECT is_active, subscription_expires_at 
      FROM tenants 
      WHERE id = $1
      LIMIT 1
    `, [tenant_id]);
    
    const tenantStatus = tenantCheckRes.rows[0];
    
    if (!tenantStatus) {
       return NextResponse.json({ error: "Invalid System ID" }, { status: 404 });
    }

    const { is_active, subscription_expires_at } = tenantStatus;
    const isExpired = subscription_expires_at ? new Date(subscription_expires_at) < new Date() : false;

    if (!is_active || isExpired) {
      return NextResponse.json(
         { error: "Your account is suspended. Please contact the administrator to settle your monthly fee." }, 
         { status: 403 }
      );
    }

    const settingsRes = await query(`SELECT current_fuel_price, base_fare_1km, fuel_efficiency FROM global_settings LIMIT 1`);
    const settings = settingsRes.rows[0];

    // FIX: Force PostgreSQL string numbers into actual JavaScript numbers!
    const fuelPrice = Number(settings.current_fuel_price) || 398;
    const baseFare = Number(settings.base_fare_1km) || 145;
    const efficiency = Number(settings.fuel_efficiency) || 40;

    // The Math Engine
    const petrolCostPerKm = fuelPrice / efficiency;
    const extraDistance = Math.max(0, distance_km - 1);
    const deliveryFee = Math.round(baseFare + (extraDistance * petrolCostPerKm));

    // Inject the order with the safely calculated deliveryFee ($5)
    const insertRes = await query(
      `INSERT INTO orders (tenant_id, customer_name, customer_phone, customer_address, delivery_fee, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') 
       RETURNING *`,
      [tenant_id, customer_name, customer_phone, customer_address, deliveryFee]
    );

    console.log(`[Engine Success]: Order inserted. Fee calculated: Rs. ${deliveryFee}`);
    return NextResponse.json(insertRes.rows[0], { status: 200 });

  } catch (error: any) {
    console.error("[Engine Checkout Crash]:", error.message);
    return NextResponse.json(
      { error: "Engine Misfire", details: error.message }, 
      { status: 500 }
    );
  }
}