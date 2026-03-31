import { query } from '../../../lib/db';
import RiderTable from './RiderTable';
import { Bike } from 'lucide-react';

export default async function RiderFleetPage() {
  
  // Fetch all riders with their earnings and commission data
  const riderRes = await query(`
    SELECT 
      r.id,
      r.name,
      r.phone_number,
      r.status,
      r.is_active,
      r.commission_rate,
      r.commission_paid,
      r.created_at,
      COUNT(o.id)::int                                                  AS total_deliveries,
      COALESCE(SUM(o.delivery_fee), 0)                                  AS total_earnings,
      COALESCE(SUM(o.delivery_fee) * r.commission_rate / 100, 0)        AS commission_due
    FROM riders r
    LEFT JOIN orders o ON o.rider_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `);

  const riders = riderRes.rows;

  // Quick summary numbers for the top cards
  const totalRiders    = riders.length;
  const activeRiders   = riders.filter((r) => r.is_active).length;
  const unpaidRiders   = riders.filter((r) => !r.commission_paid).length;
  const totalCommission = riders.reduce((sum, r) => sum + Number(r.commission_due), 0);

  return (
    <div className="w-full">

      {/* Page Header */}
      <header className="border-b border-slate-800/60 pb-8 pt-6 px-6 bg-slate-950/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-400 flex items-center justify-center">
                <Bike className="w-4 h-4 text-white" />
              </div>
              Delivery Riders
            </h1>
            <p className="text-slate-400 text-sm ml-11">
              Manage your riders, track earnings, and handle commission payments.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-violet-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            {totalRiders} riders registered
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Total Riders</p>
            <p className="text-3xl font-black text-white">{totalRiders}</p>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Active Riders</p>
            <p className="text-3xl font-black text-emerald-400">{activeRiders}</p>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Unpaid Commission</p>
            <p className="text-3xl font-black text-rose-400">{unpaidRiders}</p>
            <p className="text-[10px] text-slate-500 mt-1">riders haven't paid</p>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">Total Commission Due</p>
            <p className="text-3xl font-black text-amber-400">
              Rs. {Number(totalCommission).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </div>

        </div>

        {/* Riders Table */}
        <section className="bg-slate-900/60 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <h2 className="font-bold text-white text-base">All Riders</h2>
            <span className="text-xs text-slate-400">{totalRiders} total</span>
          </div>
          <RiderTable riders={riders} />
        </section>

      </main>
    </div>
  );
}
