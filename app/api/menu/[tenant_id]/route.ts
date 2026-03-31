import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { tenant_id: string } }
) {
  try {
    const { tenant_id } = params;

    if (!tenant_id) {
      return NextResponse.json({ error: 'Tenant Identifier is missing.' }, { status: 400 });
    }

    // Provide strict Database boundary fetching specific to this single Node
    // Returning pure API data specifically architected for external Client interfaces (Wordpress/React/HTML)
    const menuItemsRes = await query(
      `SELECT id, name, description, price, is_available 
       FROM menu_items 
       WHERE tenant_id = $1 AND is_available = true 
       ORDER BY name ASC`,
      [tenant_id]
    );

    return NextResponse.json(menuItemsRes.rows, { status: 200 });
    
  } catch (error: any) {
    console.error('Headless Menu Retrieval Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Request Error fetching headless architecture.' }, 
      { status: 500 }
    );
  }
}
