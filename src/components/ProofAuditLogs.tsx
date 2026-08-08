'use client';

import React from 'react';
import { useAgent } from '@/context/AgentContext';
import { Landmark, ArrowUpRight, DollarSign, Activity } from 'lucide-react';

export function ProofAuditLogs() {
  const { recentIntents, protocolTreasuryFeesUsd } = useAgent();

  return (
    <div className="bg-bg-surface border border-slate-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-bg-elevated text-accent-gold">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-100">Protocol Monetization & Revenue Audit</h3>
            <p className="text-xs text-slate-400 font-mono">0.25% Commerce Volume Fee Split to Stakers & Treasury</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-bg-base border border-slate-border text-slate-200">
            <span className="text-slate-400">Accrued Protocol Fees: </span>
            <span className="text-accent-gold font-bold">${protocolTreasuryFeesUsd.toFixed(4)} USDC</span>
          </div>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-border text-slate-400">
              <th className="py-2.5 px-3">TIMESTAMP</th>
              <th className="py-2.5 px-3">INTENT / ACTION</th>
              <th className="py-2.5 px-3">ASSET / AGENT</th>
              <th className="py-2.5 px-3">VOLUME (USDC)</th>
              <th className="py-2.5 px-3">FEE (0.25%)</th>
              <th className="py-2.5 px-3">ONCHAIN PROOF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-border/40 text-slate-300">
            {recentIntents.map((intent, idx) => (
              <tr key={idx} className="hover:bg-bg-base/50 transition-colors">
                <td className="py-3 px-3 text-slate-400">{intent.timestamp}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {intent.actionType}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-100 font-medium">{intent.targetAsset}</td>
                <td className="py-3 px-3 text-slate-100 font-bold">${intent.amountUsd.toFixed(2)}</td>
                <td className="py-3 px-3 text-accent-gold">${(intent.amountUsd * 0.0025).toFixed(4)}</td>
                <td className="py-3 px-3">
                  {intent.txHash ? (
                    <a
                      href={`https://explorer.robinhood.org/tx/${intent.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent-emerald hover:underline"
                    >
                      <span>{intent.txHash.slice(0, 8)}...</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-500">N/A (BLOCKED)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
