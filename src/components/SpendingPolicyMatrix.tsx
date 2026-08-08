'use client';

import React from 'react';
import { useAgent } from '@/context/AgentContext';
import { Sliders, ShieldAlert, Check, X } from 'lucide-react';

export function SpendingPolicyMatrix() {
  const { policy, updatePolicy } = useAgent();

  const toggleCategory = (category: string, type: 'allowed' | 'blocked') => {
    if (type === 'allowed') {
      const updated = policy.allowedCategories.includes(category)
        ? policy.allowedCategories.filter((c) => c !== category)
        : [...policy.allowedCategories, category];
      updatePolicy({ allowedCategories: updated });
    } else {
      const updated = policy.blockedCategories.includes(category)
        ? policy.blockedCategories.filter((c) => c !== category)
        : [...policy.blockedCategories, category];
      updatePolicy({ blockedCategories: updated });
    }
  };

  return (
    <div className="bg-bg-surface border border-slate-border rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-border/80 pb-4">
        <div className="p-2 rounded-lg bg-bg-elevated text-accent-gold">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-slate-100">Spending Policy & Guardrails Matrix</h3>
          <p className="text-xs text-slate-400 font-mono">No Private Key Handover — Autonomous Permission Scope</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders & Caps */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Daily Spending Limit Cap</span>
              <span className="text-accent-emerald font-bold">${policy.dailyLimitUsd} USDC</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={policy.dailyLimitUsd}
              onChange={(e) => updatePolicy({ dailyLimitUsd: Number(e.target.value) })}
              className="w-full accent-accent-emerald bg-bg-base rounded-lg h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Single Transaction Ceiling</span>
              <span className="text-accent-gold font-bold">${policy.perTxCapUsd} USDC</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={policy.perTxCapUsd}
              onChange={(e) => updatePolicy({ perTxCapUsd: Number(e.target.value) })}
              className="w-full accent-accent-gold bg-bg-base rounded-lg h-2"
            />
          </div>
        </div>

        {/* Categories Whitelist & Blacklist */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Allowed Categories</span>
            <div className="flex flex-wrap gap-2">
              {['SaaS', 'API Credits', 'NFT Commerce', 'DeFi Yield', 'Physical Goods'].map((cat) => {
                const isAllowed = policy.allowedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat, 'allowed')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                      isAllowed
                        ? 'bg-accent-emeraldGlow border-accent-emerald/40 text-accent-emerald'
                        : 'bg-bg-base border-slate-border text-slate-500'
                    }`}
                  >
                    {isAllowed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">Strictly Blocked Risks</span>
            <div className="flex flex-wrap gap-2">
              {['Gambling', 'High Leverage', 'Unverified Contracts', 'Unknown Tokens'].map((cat) => {
                const isBlocked = policy.blockedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat, 'blocked')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                      isBlocked
                        ? 'bg-accent-crimson/10 border-accent-crimson/40 text-accent-crimson'
                        : 'bg-bg-base border-slate-border text-slate-500'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
