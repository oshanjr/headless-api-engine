'use client';

import React, { useTransition, useState } from 'react';
import { toggleStatus, renewSubscription, deleteTenant } from './actions';
import { Power, RefreshCw, Trash2, Key, Link2, AlertTriangle, X } from 'lucide-react';

type TenantProps = {
  id: string;
  restaurant_name: string;
  domain: string;
  primary_color: string;
  created_at: string;
  is_active: boolean;
  subscription_expires_at: string | null;
};

export default function TenantTable({ tenants }: { tenants: TenantProps[] }) {
  const [isPending, startTransition] = useTransition();
  const [nodeToDelete, setNodeToDelete] = useState<{id: string, name: string} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = (id: string, currentStatus: boolean) => {
    setErrorMsg(null);
    startTransition(async () => {
      await toggleStatus(id, !currentStatus);
    });
  };

  const handleRenew = (id: string, name: string) => {
    setErrorMsg(null);
    if (confirm(`Authorize a 30-day renewal cycle for ${name}?`)) {
      startTransition(async () => {
        await renewSubscription(id);
      });
    }
  };

  const requestDelete = (id: string, name: string) => {
    setErrorMsg(null);
    setNodeToDelete({ id, name });
  };

  const confirmDelete = () => {
    if (!nodeToDelete) return;
    
    startTransition(async () => {
      const res = await deleteTenant(nodeToDelete.id);
      
      // Check if the deletion failed (e.g., due to Foreign Key Constraints like existing orders)
      if (res && res.error) {
         setErrorMsg(`Purge Failed: ${res.error}`);
      }
      
      setNodeToDelete(null);
    });
  };

  return (
    <div className="overflow-x-auto relative">
      
      {/* Error Message Toast */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-950/90 border border-rose-500/50 px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.4)] backdrop-blur-md flex items-center gap-4 max-w-xl w-full">
           <AlertTriangle className="text-rose-500 w-6 h-6 flex-shrink-0" />
           <div className="text-sm text-rose-200 font-mono flex-1">{errorMsg}</div>
           <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-rose-900 rounded-lg text-rose-400">
             <X className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* Cyberpunk Delete Confirmation Modal */}
      {nodeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
           <div className="bg-slate-900 border border-rose-500/30 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.15)] max-w-md w-full overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600"></div>
              
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 shadow-inner mx-auto">
                   <Trash2 className="w-8 h-8 text-rose-500" />
                </div>
                
                <h3 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tight">System Purge Initiated</h3>
                <p className="text-slate-400 text-center font-mono text-sm mb-8 leading-relaxed">
                  Are you sure you want to permanently delete <span className="text-rose-400 font-bold">{nodeToDelete.name}</span>? This will completely drop the node from the network.
                </p>
                
                <div className="flex gap-4">
                   <button 
                     disabled={isPending}
                     onClick={() => setNodeToDelete(null)}
                     className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700"
                   >
                     CANCEL
                   </button>
                   <button 
                     disabled={isPending}
                     onClick={confirmDelete}
                     className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black tracking-wide rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all border border-rose-400"
                   >
                     {isPending ? 'PURGING...' : 'CONFIRM PURGE'}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-900 border-b border-slate-800">
            <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400">Node</th>
            <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400">Live Status</th>
            <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-slate-400">Headless Target</th>
            <th className="py-4 px-6 text-xs font-black tracking-widest uppercase text-emerald-400">Control Vectors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 relative">
          
          {isPending && (!nodeToDelete) && (
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
               <span className="text-white font-mono font-bold animate-pulse text-sm">TRANSMITTING...</span>
             </div>
          )}

          {tenants.map((t) => {
            const isExpired = t.subscription_expires_at ? new Date(t.subscription_expires_at) < new Date() : false;
            
            return (
              <tr key={t.id} className="hover:bg-slate-800/50 transition-colors group">
                <td className="py-4 px-6 align-top">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shadow-inner ring-2 ring-slate-800" style={{ backgroundColor: t.primary_color || '#e2e8f0' }}></div>
                      <span className="font-extrabold text-white text-lg">{t.restaurant_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <Key className="w-3 h-3 text-slate-500" />
                       <span className="font-mono text-[10px] bg-slate-950 text-slate-500 px-2 py-1 rounded-md border border-slate-800 cursor-copy active:scale-95 transition-transform" title="Public ID string for this node.">
                         {t.id}
                       </span>
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-6 align-top">
                   <div className="flex flex-col gap-3 items-start">
                     <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                        !t.is_active 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                          : isExpired 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                     }`}>
                        {!t.is_active ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                     </span>
                     
                     {t.subscription_expires_at ? (
                        <div className="text-xs font-mono text-slate-500">
                          Exp: {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t.subscription_expires_at))}
                        </div>
                     ) : (
                        <div className="text-xs font-mono text-slate-500 italic">
                          No Cycle Configured
                        </div>
                     )}
                   </div>
                </td>
                
                <td className="py-4 px-6 align-top">
                  <a href={`http://${t.domain}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold tracking-tight underline-offset-4 hover:underline">
                    <Link2 className="w-4 h-4" />
                    {t.domain}
                  </a>
                </td>
                
                <td className="py-4 px-6 align-top">
                   <div className="flex items-center gap-3">
                       
                       <button 
                         onClick={() => handleToggle(t.id, t.is_active)}
                         className={`p-2 rounded-lg border transition-all ${t.is_active ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-rose-950 border-rose-900 text-rose-500 hover:bg-rose-900'}`}
                         title={t.is_active ? "Disable Node" : "Enable Node"}
                       >
                          <Power className="w-4 h-4" />
                       </button>

                       <button 
                         onClick={() => handleRenew(t.id, t.restaurant_name)}
                         className="p-2 bg-slate-800 border-slate-700 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded-lg border transition-all"
                         title="Add 30 Days Cycle"
                       >
                          <RefreshCw className="w-4 h-4" />
                       </button>

                       <button 
                         onClick={() => requestDelete(t.id, t.restaurant_name)}
                         className="p-2 ml-4 bg-transparent border-slate-800 text-slate-600 hover:text-rose-500 hover:bg-rose-950/50 rounded-lg border transition-all"
                         title="Purge Network"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                   </div>
                </td>
              </tr>
            );
          })}
          
          {tenants.length === 0 && (
            <tr>
              <td colSpan={4} className="py-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-800 m-4 rounded-xl">
                ZERO ACTIVE NODES DETECTED.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
