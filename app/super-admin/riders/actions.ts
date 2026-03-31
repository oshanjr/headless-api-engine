'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Enable or suspend a rider's account
export async function toggleRiderAccess(id: string, newStatus: boolean) {
  try {
    await query(`UPDATE riders SET is_active = $1 WHERE id = $2`, [newStatus, id]);
    revalidatePath('/super-admin/riders');
    return { success: true };
  } catch (err: any) {
    console.error("[Riders] toggleRiderAccess error:", err.message);
    return { error: err.message };
  }
}

// Mark a rider's commission as paid or unpaid
export async function markCommissionPaid(id: string, paid: boolean) {
  try {
    await query(`UPDATE riders SET commission_paid = $1 WHERE id = $2`, [paid, id]);
    revalidatePath('/super-admin/riders');
    return { success: true };
  } catch (err: any) {
    console.error("[Riders] markCommissionPaid error:", err.message);
    return { error: err.message };
  }
}

// Update a rider's commission rate (%)
export async function setCommissionRate(id: string, rate: number) {
  try {
    if (rate < 0 || rate > 100) return { error: 'Rate must be between 0 and 100.' };
    await query(`UPDATE riders SET commission_rate = $1 WHERE id = $2`, [rate, id]);
    revalidatePath('/super-admin/riders');
    return { success: true };
  } catch (err: any) {
    console.error("[Riders] setCommissionRate error:", err.message);
    return { error: err.message };
  }
}

// Permanently delete a rider
export async function deleteRider(id: string) {
  try {
    // Un-assign this rider from any orders first
    await query(`UPDATE orders SET rider_id = NULL WHERE rider_id = $1`, [id]);
    await query(`DELETE FROM riders WHERE id = $1`, [id]);
    revalidatePath('/super-admin/riders');
    return { success: true };
  } catch (err: any) {
    console.error("[Riders] deleteRider error:", err.message);
    return { error: err.message };
  }
}
