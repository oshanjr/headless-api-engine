'use client';

import React, { useTransition, useState } from 'react';
import { toggleRiderAccess, markCommissionPaid, setCommissionRate, deleteRider } from './actions';
import { Power, Trash2, CheckCircle, XCircle, AlertTriangle, X, Pencil, Check } from 'lucide-react';

type RiderRow = {
  id: string;
  name: string;
  phone_number: string;
  status: string;
  is_active: boolean;
  commission_rate: number;
  commission_paid: boolean;
  total_deliveries: number;
  total_earnings: number;
  commission_due: number;
};

export default function RiderTable({ riders }: { riders: RiderRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget]   = useState<{ id: string; name: string } | null>(null);
  const [editRateId, setEditRateId]       = useState<string | null>(null);
  const [rateInput, setRateInput]         = useState<string>('');
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  const handleToggleAccess = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleRiderAccess(id, !current);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const handleMarkPaid = (id: string, currentPaid: boolean) => {
    startTransition(async () => {
      const res = await markCommissionPaid(id, !currentPaid);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const openRateEdit = (id: string, currentRate: number) => {
    setEditRateId(id);
    setRateInput(String(currentRate));
  };

  const saveRate = (id: string) => {
    const rate = parseFloat(rateInput);
    if (isNaN(rate)) return;
    setEditRateId(null);
    startTransition(async () => {
      const res = await setCommissionRate(id, rate);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteRider(deleteTarget.id);
      if (res?.error) setErrorMsg(res.error);
      setDeleteTarget(null);
    });
  };

  return (
    <div className="relative">

      {/* Error Toast */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-950/90 border border-rose-500/40 px-5 py-3 rounded-xl backdrop-blur-md flex items-center gap-3 max-w-lg w-full shadow-lg">
          <AlertTriangle className="text-rose-400 w-5 h-5 flex-shrink-0" />
          <span className="text-sm text-rose-200 flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-sm w-full p-7 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="text-lg font-black text-white text-center mb-2">Remove Rider?</h3>
            <p className="text-slate-400 text-center text-sm mb-6">
              This will permanently remove <span className="text-white font-bold">{deleteTarget.name}</span> from the system. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={isPending}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors border border-rose-500"
              >
                {isPending ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isPending && !deleteTarget && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-b-2xl">
          <span className="text-white text-sm font-bold animate-pulse">Saving...</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-white/5">
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap">Rider</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap text-right">Deliveries</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap text-right">Total Earnings</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap text-right">Commission Rate</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap text-right">Commission Due</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap text-center">Payment</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap text-center">Account</th>
              <th className="py-4 px-5 text-xs font-bold text-slate-400 whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {riders.map((r) => (
              <tr
                key={r.id}
                className={`hover:bg-slate-800/30 transition-colors ${!r.is_active ? 'opacity-60' : ''}`}
              >
                {/* Rider Info */}
                <td className="py-4 px-5">
                  <p className="font-bold text-white">{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.phone_number}</p>
                </td>

                {/* Deliveries Count */}
                <td className="py-4 px-5 text-right">
                  <span className="font-bold text-white">{r.total_deliveries}</span>
                  <p className="text-[10px] text-slate-500">deliveries</p>
                </td>

                {/* Total Earnings */}
                <td className="py-4 px-5 text-right">
                  <span className="font-bold text-emerald-400">
                    Rs. {Number(r.total_earnings).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </td>

                {/* Commission Rate (editable) */}
                <td className="py-4 px-5 text-right">
                  {editRateId === r.id ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="w-16 px-2 py-1 bg-slate-800 border border-violet-500/50 rounded-lg text-right text-white text-sm outline-none"
                        autoFocus
                      />
                      <span className="text-slate-400 text-sm">%</span>
                      <button
                        onClick={() => saveRate(r.id)}
                        className="p-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white ml-1"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditRateId(null)}
                        className="p-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openRateEdit(r.id, r.commission_rate)}
                      className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white group"
                    >
                      <span className="font-bold">{Number(r.commission_rate).toFixed(1)}%</span>
                      <Pencil className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </button>
                  )}
                </td>

                {/* Commission Due */}
                <td className="py-4 px-5 text-right">
                  <span className={`font-bold ${r.commission_paid ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                    Rs. {Number(r.commission_due).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </td>

                {/* Payment Status + Action */}
                <td className="py-4 px-5 text-center">
                  <button
                    onClick={() => handleMarkPaid(r.id, r.commission_paid)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      r.commission_paid
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                    }`}
                  >
                    {r.commission_paid ? (
                      <><CheckCircle className="w-3.5 h-3.5" /> Paid</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> Unpaid</>
                    )}
                  </button>
                </td>

                {/* Account Status */}
                <td className="py-4 px-5 text-center">
                  <button
                    onClick={() => handleToggleAccess(r.id, r.is_active)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      r.is_active
                        ? 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700'
                        : 'bg-rose-950 border-rose-900 text-rose-400 hover:bg-rose-900'
                    }`}
                    title={r.is_active ? 'Click to suspend this rider' : 'Click to reactivate this rider'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {r.is_active ? 'Active' : 'Suspended'}
                  </button>
                </td>

                {/* Delete */}
                <td className="py-4 px-5">
                  <button
                    onClick={() => setDeleteTarget({ id: r.id, name: r.name })}
                    className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all border border-transparent hover:border-rose-900"
                    title="Remove this rider"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {riders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500 text-sm">
                  No riders registered yet. Riders will appear here once they sign up through the rider app.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
