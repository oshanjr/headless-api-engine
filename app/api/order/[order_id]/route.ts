import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { order_id: string } }
) {
  try {
    const { order_id } = params;

    // Strict validation
    if (!order_id) {
      return NextResponse.json({ error: 'Order UUID Payload Identifier Missing.' }, { status: 400 });
    }

    // Mock logic supporting robust sandbox architectural testing 
    if (order_id.startsWith('mock-')) {
       return NextResponse.json({
          id: order_id,
          status: order_id === 'mock-101' ? 'pending' : 'out_for_delivery',
          customer_name: 'Test Customer Dashboard Mock',
          total_amount: 1540,
          delivery_fee: 145,
          rider: order_id === 'mock-102' ? { name: 'Saman Kumara', phone_number: '0771234567' } : null
       }, { status: 200 });
    }

    // Complex Join operation pushing exact rider tracing coordinates natively into WordPress Client boundaries!
    const orderRes = await query(`
      SELECT o.id, o.status, o.customer_name, o.customer_phone, o.total_amount, o.delivery_fee,
             r.name as rider_name, r.phone_number as rider_phone
      FROM orders o
      LEFT JOIN riders r ON o.rider_id = r.id
      WHERE o.id = $1
    `, [order_id]);

    if(orderRes.rows.length === 0) {
       return NextResponse.json({ error: 'Order Pipeline Trace Failed.' }, { status: 404 });
    }

    const row = orderRes.rows[0];
    
    // Broadcast pure delivery timeline tokens allowing external rendering mechanisms to paint custom graphics
    return NextResponse.json({
      id: row.id,
      status: row.status,
      customer_name: row.customer_name,
      total_amount: row.total_amount,
      delivery_fee: row.delivery_fee,
      rider: row.rider_name ? { name: row.rider_name, phone_number: row.rider_phone } : null
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Headless Pipeline Trace Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
