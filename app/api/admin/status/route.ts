import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, current_status, tenant_id } = body;

    if (!order_id || !tenant_id || !current_status) {
      return NextResponse.json({ error: 'Missing Required Payload Headers.' }, { status: 400 });
    }

    let newStatus = 'pending';
    if (current_status === 'pending') newStatus = 'preparing';
    else if (current_status === 'preparing') newStatus = 'out_for_delivery';
    else if (current_status === 'out_for_delivery') newStatus = 'delivered';
    
    // Execute live mutation into the central core DB directly isolated from physical UI
    const updateRes = await query(
       'UPDATE orders SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *', 
       [newStatus, order_id, tenant_id]
    );

    if (updateRes.rows.length === 0) {
       return NextResponse.json({ error: 'Invalid Order Node Reference or Unauthorized Tenant Action.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, updated_order: updateRes.rows[0] }, { status: 200 });

  } catch (error: any) {
    console.error('Headless Status Mutation Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
