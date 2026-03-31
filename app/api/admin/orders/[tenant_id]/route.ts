import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { tenant_id: string } }
) {
  try {
    const { tenant_id } = params;

    // Secure Headless verification layer
    if (!tenant_id) {
      return NextResponse.json({ error: 'Tenant Identifier is specifically strictly required.' }, { status: 400 });
    }

    // Isolate Admin Order pipeline to exclusively return un-delivered rows for live dispatch processing arrays
    const ordersRes = await query(
      `SELECT * FROM orders 
       WHERE tenant_id = $1 AND status != 'delivered' 
       ORDER BY created_at DESC`,
      [tenant_id]
    );

    // Blast the payload directly back into whatever Custom Administrator Dashboard the agency built
    return NextResponse.json(ordersRes.rows, { status: 200 });
    
  } catch (error: any) {
    console.error('Headless Admin Dashboard Sync Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Request Error fetching headless architecture.' }, 
      { status: 500 }
    );
  }
}
