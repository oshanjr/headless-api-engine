'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function toggleStatus(id: string, newStatus: boolean) {
  try {
    await query(`UPDATE tenants SET is_active = $1 WHERE id = $2`, [newStatus, id]);
    revalidatePath('/super-admin/tenants');
    return { success: true };
  } catch (err: any) {
    console.error("[Action Error - toggleStatus]:", err.message);
    return { error: err.message };
  }
}

export async function renewSubscription(id: string) {
  try {
    // Adds exactly 30 days securely via SQL Engine INTERVAL mathematics.
    // Handles NULL fields dynamically by comparing against current NOW() as fallback.
    await query(`
      UPDATE tenants 
      SET subscription_expires_at = COALESCE(subscription_expires_at, NOW()) + INTERVAL '30 days' 
      WHERE id = $1
    `, [id]);
    revalidatePath('/super-admin/tenants');
    return { success: true };
  } catch (err: any) {
    console.error("[Action Error - renewSubscription]:", err.message);
    return { error: err.message };
  }
}

export async function deleteTenant(id: string) {
  try {
    // 1. Purge all related orders first to avoid Foreign Key Constraint violations
    await query(`DELETE FROM orders WHERE tenant_id = $1`, [id]);
    
    // 2. Purge the tenant from existence
    await query(`DELETE FROM tenants WHERE id = $1`, [id]);
    
    revalidatePath('/super-admin/tenants');
    return { success: true };
  } catch (err: any) {
    console.error("[Action Error - deleteTenant]:", err.message);
    return { error: err.message };
  }
}
