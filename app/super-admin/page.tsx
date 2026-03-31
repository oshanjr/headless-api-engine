import { query } from '../../lib/db';
import { TrendingUp, Activity, Database, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default async function SuperAdminDashboard() {
  
  // 1. Fetch live metrics from Engine PostgreSQL DB asynchronously using Promise.all to maximize SSR throughput
  const [revenueRes, ordersCountRes, activeTenantsRes, recentOrdersRes] = await Promise.all([
     query('SELECT SUM(delivery_fee) as total FROM orders'),
     query('SELECT COUNT(*) as total FROM orders'),
     query('SELECT COUNT(*) as total FROM tenants WHERE is_active = true'),
     query(`
        SELECT o.id, o.customer_name, o.delivery_fee, o.status, o.created_at, t.restaurant_name 
        FROM orders o 
        JOIN tenants t ON o.tenant_id = t.id 
        ORDER BY o.created_at DESC 
        LIMIT 10
     `)
  ]);

  const totalRevenue = revenueRes.rows[0]?.total || 0;
  const totalOrders = ordersCountRes.rows[0]?.total || 0;
  const activeTenantsCount = activeTenantsRes.rows[0]?.total || 0;
  const recentOrders = recentOrdersRes.rows;

  return (
    <div className="w-full">
      
       {/* Dashboard Header Plate */}
       <header className="border-b border-slate-800/60 pb-8 pt-6 px-6 relative z-10 bg-slate-950/20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
             <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-2 flex items-center gap-4">
                   <div className="w-6 h-6 rounded bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-violet-400"></div>
                   Global Network Command
                </h1>
                <p className="text-violet-400/70 font-mono text-sm font-bold tracking-widest uppercase ml-10">
                   Real-time Executive Dashboard
                </p>
             </div>
             
             {/* Small live heartbeat indicator */}
             <div className="inline-flex items-center px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg shadow-inner text-xs font-mono font-bold text-amber-500/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-2"></span>
                LIVE RELAY ACTIVE
             </div>
          </div>
       </header>

       <main className="max-w-6xl mx-auto px-6 py-8 space-y-8 relative z-20">
          
          {/* Top Row: Core Metrics HUD */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Card 1: Revenue Volume */}
             <div className="bg-slate-900/40 p-6 rounded-2xl shadow-xl border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Gross Platform Revenue</h3>
                   <div className="p-2 bg-emerald-950 rounded-lg border border-emerald-900/50">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black tracking-tighter text-white">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue)}
                   </span>
                   <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      +12%
                   </span>
                </div>
             </div>

             {/* Card 2: Order Volume */}
             <div className="bg-slate-900/40 p-6 rounded-2xl shadow-xl border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Global Order Volume</h3>
                   <div className="p-2 bg-cyan-950 rounded-lg border border-cyan-900/50">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black tracking-tighter text-white">
                      {new Intl.NumberFormat('en-US').format(totalOrders)}
                   </span>
                   <span className="text-xs font-mono text-cyan-500/50 ml-1">UNITS</span>
                </div>
             </div>

             {/* Card 3: Active Routing Nodes */}
             <div className="bg-slate-900/40 p-6 rounded-2xl shadow-xl border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Active Network Nodes</h3>
                   <div className="p-2 bg-violet-950 rounded-lg border border-violet-900/50">
                      <Database className="w-5 h-5 text-violet-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black tracking-tighter text-white">
                      {activeTenantsCount}
                   </span>
                   <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ONLINE
                   </span>
                </div>
             </div>

          </section>

          {/* Middle Section: Live Global Action Feed */}
          <section className="bg-slate-900/60 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm overflow-hidden">
             
             <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-3">
                   <Activity className="w-5 h-5 text-cyan-500 animate-pulse opacity-80" />
                   <h2 className="text-lg font-black tracking-tight text-white uppercase">Live Network Feed</h2>
                </div>
                <Link href="/super-admin/tenants" className="text-xs font-mono font-bold text-cyan-500 hover:text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded transition-colors tracking-wide">
                   VIEW TOPOLOGY \u2192
                </Link>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-950/60 border-b border-white/5">
                         <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-slate-500">TXID</th>
                         <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-slate-500">Origin Node</th>
                         <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-slate-500">Customer</th>
                         <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-slate-500">Status Vector</th>
                         <th className="py-4 px-6 text-[10px] font-mono tracking-widest uppercase text-slate-500 text-right">Fee Yield</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {recentOrders.map((order) => {
                         const timeFormatted = new Intl.DateTimeFormat('en-US', { 
                            hour: 'numeric', minute: '2-digit', second: '2-digit' 
                         }).format(new Date(order.created_at));

                         const isPending = order.status?.toLowerCase() === 'pending';
                         
                         return (
                           <tr key={order.id} className="hover:bg-cyan-950/20 transition-colors">
                              
                              {/* Transaction ID */}
                              <td className="py-4 px-6 align-middle">
                                 <span className="font-mono text-xs text-slate-400 hover:text-white transition-colors cursor-crosshair">
                                    {(order.id || '').toString().slice(0, 8).toUpperCase()}
                                 </span>
                                 <div className="text-[10px] font-mono text-slate-600 mt-1">{timeFormatted}</div>
                              </td>
                              
                              {/* Origin Node */}
                              <td className="py-4 px-6 align-middle">
                                 <span className="font-bold text-slate-200 text-sm tracking-wide">
                                    {order.restaurant_name}
                                 </span>
                              </td>

                              {/* Target */}
                              <td className="py-4 px-6 align-middle text-sm text-slate-300">
                                 <span className="font-medium text-slate-200">{order.customer_name}</span>
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-6 align-middle">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black font-mono rounded border uppercase tracking-widest ${
                                    isPending 
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]' 
                                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
                                 }`}>
                                    {isPending ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                    {order.status || 'UNKNOWN'}
                                 </span>
                              </td>

                              {/* Platform Yield */}
                              <td className="py-4 px-6 align-middle text-right text-sm font-black text-emerald-400 tabular-nums">
                                  +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.delivery_fee)}
                              </td>

                           </tr>
                         )
                      })}
                      
                      {recentOrders.length === 0 && (
                        <tr>
                           <td colSpan={5} className="py-12 text-center text-slate-600 font-mono text-sm border-2 border-dashed border-white/5 m-4 rounded-xl">
                              Awaiting primary data transmission. Zero live packets intercepted.
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

       </main>

    </div>
  );
}
