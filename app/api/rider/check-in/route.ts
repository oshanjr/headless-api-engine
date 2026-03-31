import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rider_id } = body;

    if (!rider_id) {
      return NextResponse.json({ error: 'Missing rider_id parameter' }, { status: 400 });
    }

    // 1. Validate the Rider's Ledger
    const riderRes = await query(
       'SELECT wallet_balance, is_active FROM riders WHERE id = $1', 
       [rider_id]
    );
    
    if (riderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized: Rider profile not found in network.' }, { status: 404 });
    }

    const rider = riderRes.rows[0];

    // Check if they are already operating to prevent double subtraction
    if (rider.is_active) {
      return NextResponse.json({ 
        success: true, 
        message: 'Rider is already online and active in the dispatch matrix.' 
      }, { status: 200 });
    }

    // 2. Daily Commission Financial Bound Enforcement
    if (parseFloat(rider.wallet_balance) < 150) {
      return NextResponse.json({ 
         error: 'Insufficient Balance', 
         message: 'You need a minimum of 150 LKR Top-Up to activate your daily network pass.' 
      }, { status: 403 });
    }

    // 3. Mutate Rider State natively on the Cloud
    // Appending a distinct 24-hour expiration token limit
    const activeUntilTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await query(
      `UPDATE riders 
       SET wallet_balance = wallet_balance - 150, 
           is_active = true, 
           active_until = $1 
       WHERE id = $2`,
      [activeUntilTimestamp, rider_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Check-In Successful. Welcome online. 150 LKR daily commission applied.',
      active_until_utc: activeUntilTimestamp,
      ledger: {
        previous_balance: parseFloat(rider.wallet_balance),
        remaining_balance: parseFloat(rider.wallet_balance) - 150
      }
    });

  } catch (err: any) {
    console.error('Android Rider Check-In API Fault:', err);
    return NextResponse.json({ error: 'Internal Dispatch Sync Fault' }, { status: 500 });
  }
}
