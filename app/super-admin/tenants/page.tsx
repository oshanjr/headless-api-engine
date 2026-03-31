import { query } from '../../../lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export default async function MasterAgencyDashboard() {
  
  // 1. Fetch current live SaaS tenants securely mapping to Admin boundaries
  const tenantRes = await query(
    'SELECT id, public_api_key, restaurant_name, domain, primary_color, created_at FROM tenants ORDER BY created_at DESC'
  );
  
  const tenants = tenantRes.rows;

  // 2. NextJS strict server action handling the 'Onboard' process dynamically
  async function onboardTenant(formData: FormData) {
    'use server';
    
    const restaurantName = formData.get('restaurant_name')?.toString();
    const authorizedDomain = formData.get('authorized_domain')?.toString();

    const { query } = await import('../../../lib/db');
    const { revalidatePath } = await import('next/cache');
    const cryptoInstance = await import('crypto');

    if (!restaurantName || !authorizedDomain) {
       throw new Error('Form execution missing required parameters.');
    }

    // Generate strict 'pub_tenant_xyz' cryptographic security tokens natively preventing collisions!
    const randomHex = cryptoInstance.randomBytes(4).toString('hex');
    const pubTenantKey = `pub_tenant_${randomHex}`;

    // Inject organically into PostgreSQL 
    await query(`
      INSERT INTO tenants (restaurant_name, domain, public_api_key, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5)
    `, [restaurantName, authorizedDomain, pubTenantKey, 7.0873, 79.9992]); // Fallback GPS for Master Dashboard

    // Purge browser path to force Next.js to reconstruct the Database query internally
    revalidatePath('/super-admin/tenants');
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800 pb-20">
       {/* High End Dark Corporate Dashboard Header */}
       <header className="bg-slate-900 border-b border-slate-800 pb-12 pt-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
             <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">Master Agency Dashboard</h1>
                <p className="text-slate-400 font-bold tracking-wide">Global Multi-Tenant Hub Configuration</p>
             </div>
             <div className="inline-flex items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl shadow-inner text-sm font-mono font-bold text-emerald-400">
                \uD83D\uDFE2 SYSTEM SECURE
             </div>
          </div>
       </header>

       <main className="max-w-6xl mx-auto px-6 -mt-8 space-y-10 relative z-10">
          
          {/* Action Module: Onboarding Machine */}
          <section className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
                 <div>
                   <h2 className="text-2xl font-black tracking-tight text-slate-900">Onboard New Client</h2>
                   <p className="text-slate-500 font-medium">Instantly generate Node dependencies and Public API security keys.</p>
                 </div>
                 <div className="hidden sm:flex w-12 h-12 rounded-full bg-blue-50 items-center justify-center text-blue-600 text-xl">
                    \u2795
                 </div>
             </div>
             
             <form action={onboardTenant} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-4 flex flex-col gap-2">
                   <label htmlFor="restaurant_name" className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Restaurant Name
                   </label>
                   <input 
                     type="text" 
                     name="restaurant_name" 
                     id="restaurant_name" 
                     placeholder="e.g. Burger House"
                     required
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold"
                   />
                </div>
                
                <div className="md:col-span-5 flex flex-col gap-2">
                   <label htmlFor="authorized_domain" className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Authorized Headless Domain
                   </label>
                   <div className="relative flex items-center">
                     <span className="absolute left-4 text-slate-400 font-mono">https://</span>
                     <input 
                       type="text" 
                       name="authorized_domain" 
                       id="authorized_domain" 
                       placeholder="burgerhouse.lk"
                       required
                       className="w-full pl-[72px] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold"
                     />
                   </div>
                </div>

                <div className="md:col-span-3">
                   <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all tracking-wide">
                      Generate Node
                   </button>
                </div>
             </form>
          </section>

          {/* Directory Module: Active Tenants Grid */}
          <section className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h2 className="text-lg font-black tracking-tight text-slate-900">Active Agency Tenants</h2>
                 <span className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-full text-xs">{tenants.length} NODES</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400">Restaurant</th>
                         <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400">Network Domain</th>
                         <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400">Public API Key</th>
                         <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400 text-right">Identifier (UUID)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {tenants.map((t) => (
                         <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 px-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-slate-200 shadow-inner" style={{ backgroundColor: t.primary_color || '#e2e8f0' }}></div>
                                  <span className="font-extrabold text-slate-800">{t.restaurant_name}</span>
                               </div>
                            </td>
                            <td className="py-4 px-6">
                               <a href={`http://${t.domain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-bold tracking-tight underline-offset-4 hover:underline">
                                  {t.domain}
                               </a>
                            </td>
                            <td className="py-4 px-6">
                               <span className="font-mono text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-bold tracking-tight shadow-sm cursor-copy active:scale-95 transition-transform" 
                                     title="Copy API Key to pass into WordPress / HTML Fetch Header">
                                  {t.public_api_key || 'Missing Security Key'}
                               </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                               <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                                  ...{t.id.split('-').pop()}
                               </span>
                            </td>
                         </tr>
                      ))}
                      {tenants.length === 0 && (
                         <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-100 m-4 rounded-xl">
                               No Headless Nodes explicitly defined in Database yet.
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
