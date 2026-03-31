import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // 1. Standardize query constraints enforcing we only push unassigned local orders
    // Added a tenant_id optional search parameter in case Android riders filter by distinct zones
    const url = new URL(req.url);
    const tenantIdParam = url.searchParams.get('tenant_id');

    let sql = `
      SELECT o.id, o.customer_name, o.customer_phone, 
             o.delivery_latitude, o.delivery_longitude, 
             o.total_amount, o.delivery_fee, o.created_at, 
             t.restaurant_name 
      FROM orders o
      JOIN tenants t ON o.tenant_id = t.id
      WHERE o.status = 'pending'
    `;
    
    const preparedValues: any[] = [];

    // Map strict network isolation rules if Android filtered to one restaurant
    if (tenantIdParam) {
      sql += ` AND o.tenant_id = $1`;
      preparedValues.push(tenantIdParam);
    }
    
    // Sort oldest matrix demands globally to the absolute top of the queue 
    sql += ` ORDER BY o.created_at ASC`;

    const pendingOrdersRes = await query(sql, preparedValues);

    return NextResponse.json({
      success: true,
      network_count: pendingOrdersRes.rows.length,
      payload: pendingOrdersRes.rows
    });

  } catch (err: any) {
    console.error('Android Rider Open Orders API Fault:', err);
    return NextResponse.json({ error: 'Unable to stream dispatch locations.' }, { status: 500 });
  }
}
