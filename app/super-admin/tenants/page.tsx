import { query } from '../../../lib/db';
import { revalidatePath } from 'next/cache';
import TenantTable from './TenantTable';

export default async function MasterAgencyDashboard() {
  
  // 1. Fetch current live SaaS tenants securely mapping to Admin boundaries, including new fields
  const tenantRes = await query(
    'SELECT id, restaurant_name, domain, primary_color, created_at, is_active, subscription_expires_at FROM tenants ORDER BY created_at DESC'
  );
  
  // Ensure the timestamp formatting matches perfectly across SSR and Client if needed or leave raw
  const tenants = tenantRes.rows;

  // 2. NextJS strict server action handling the 'Onboard' process dynamically
  async function onboardTenant(formData: FormData) {
    'use server';
    
    const name = formData.get('restaurant_name')?.toString();
    const domain = formData.get('authorized_domain')?.toString();

    const { query } = await import('../../../lib/db');
    const { revalidatePath } = await import('next/cache');

    if (!name || !domain) {
       throw new Error('Form execution missing required parameters.');
    }

    const publicId = `pub_tenant_${Math.random().toString(36).substring(2, 10)}`;

    try {
      // Create new tenants with an automatic 30-day lease
      await query(
        `INSERT INTO tenants (id, restaurant_name, domain, latitude, longitude, is_active, subscription_expires_at) 
         VALUES ($1, $2, $3, $4, $5, true, NOW() + INTERVAL '30 days')`,
        [publicId, name, domain, 7.0873, 79.9992]
      );

      console.log(`[Super Admin]: Successfully onboarded ${name} with natively mapped ID ${publicId}`);
      
      // Refresh the page data logically
      revalidatePath('/super-admin/tenants');
    } catch (error: any) {
      console.error("[Super Admin Error]:", error.message);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-300 pb-20 selection:bg-cyan-500/30">
       
       <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan-900/20 via-slate-900/5 to-transparent pointer-events-none z-0"></div>

       {/* High End Dark Corporate Dashboard Header */}
       <header className="border-b border-slate-800/60 pb-12 pt-16 px-6 relative z-10 backdrop-blur-md bg-slate-950/50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
             <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3 flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-400"></div>
                   Master Control Console
                </h1>
                <p className="text-cyan-600/60 font-mono text-sm font-bold tracking-widest uppercase">Global Multi-Tenant Hub Configuration</p>
             </div>
             <div className="inline-flex items-center px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-inner text-xs font-mono font-bold text-emerald-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                SYSTEM SECURE (TCP: 443)
             </div>
          </div>
       </header>

       <main className="max-w-6xl mx-auto px-6 -mt-8 space-y-10 relative z-20">
          
          {/* Action Module: Onboarding Machine */}
          <section className="bg-slate-900/80 p-8 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
             
             {/* Cyberpunk Accents */}
             <div className="absolute top-0 right-10 w-32 h-1 bg-cyan-500/50"></div>
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500/50 to-transparent"></div>

             <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
                 <div>
                   <h2 className="text-xl font-black tracking-tight text-white uppercase">Initialize Node</h2>
                   <p className="text-slate-500 font-mono text-xs mt-1">Allocate independent PGSQL boundaries and assign domain proxy tracking.</p>
                 </div>
                 <div className="hidden sm:flex w-12 h-12 rounded-xl border border-slate-800 bg-slate-950 items-center justify-center text-cyan-500 text-xl shadow-inner">
                    \u2795
                 </div>
             </div>
             
             <form action={onboardTenant} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-4 flex flex-col gap-2 relative group">
                   <label htmlFor="restaurant_name" className="text-[10px] font-mono tracking-widest text-cyan-600 uppercase">
                      Entity Designation
                   </label>
                   <input 
                     type="text" 
                     name="restaurant_name" 
                     id="restaurant_name" 
                     placeholder="e.g. Neo Tokyo Dining"
                     required
                     className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all outline-none font-bold text-slate-200 placeholder-slate-700 shadow-inner group-hover:border-slate-700"
                   />
                </div>
                
                <div className="md:col-span-5 flex flex-col gap-2 relative group">
                   <label htmlFor="authorized_domain" className="text-[10px] font-mono tracking-widest text-cyan-600 uppercase">
                      Network Gateway
                   </label>
                   <div className="relative flex items-center">
                     <span className="absolute left-4 text-slate-600 font-mono text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800 z-10">HTTPS</span>
                     <input 
                       type="text" 
                       name="authorized_domain" 
                       id="authorized_domain" 
                       placeholder="neo-tokyo-api.net"
                       required
                       className="w-full pl-[90px] pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all outline-none font-bold text-slate-200 placeholder-slate-700 shadow-inner group-hover:border-slate-700"
                     />
                   </div>
                </div>

                <div className="md:col-span-3">
                   <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-slate-950 font-black rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all tracking-wide border border-cyan-400">
                      DEPLOY NODE
                   </button>
                </div>
             </form>
          </section>

          {/* Directory Module: Active Tenants Grid */}
          <section className="bg-slate-900/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800 backdrop-blur-sm">
             <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                 <h2 className="text-xl font-black tracking-tight text-white uppercase">Active Pipeline Topology</h2>
                 <span className="bg-cyan-950/50 border border-cyan-900 text-cyan-400 font-mono px-3 py-1.5 rounded-lg text-xs tracking-wider shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]">TOTAL CONFIGS: {tenants.length}</span>
             </div>
             
             {/* Client Component For Interactions */}
             <TenantTable tenants={tenants} />

          </section>

       </main>
    </div>
  );
}
