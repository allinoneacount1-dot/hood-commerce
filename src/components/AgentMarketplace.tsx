'use client';

import React, { useState } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Bot, Star, DollarSign, Check, Zap } from 'lucide-react';
import { AgentMarketplaceItem } from '@/types/agent';

export function AgentMarketplace() {
  const { marketplaceAgents, hireAgent } = useAgent();
  const [hiringId, setHiringId] = useState<string | null>(null);

  const handleHire = async (agent: AgentMarketplaceItem) => {
    setHiringId(agent.id);
    await hireAgent(agent);
    setHiringId(null);
  };

  return (
    <div className="bg-bg-surface border border-slate-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-bg-elevated text-accent-emerald">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-100">Agent-to-Agent Micro-Marketplace</h3>
            <p className="text-xs text-slate-400 font-mono">Machine-to-Machine Autonomous Commerce</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-bg-base border border-slate-border text-accent-emerald">
          Robinhood Escrow Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketplaceAgents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 rounded-xl bg-bg-base border border-slate-border hover:border-accent-emerald/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-bold text-slate-100">{agent.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{agent.role}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-accent-gold">
                  <Star className="w-3.5 h-3.5 fill-accent-gold" />
                  <span>{agent.reputationPercent}%</span>
                </div>
              </div>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1 pt-1">
                {agent.capabilities.map((cap, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-surface text-slate-300 border border-slate-border">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Action */}
            <div className="pt-3 border-t border-slate-border/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">MICRO-FEE</span>
                <span className="font-mono text-sm font-bold text-slate-100">${agent.priceUsd.toFixed(2)} <span className="text-xs font-normal text-slate-400">USDC</span></span>
              </div>

              <button
                onClick={() => handleHire(agent)}
                disabled={hiringId === agent.id}
                className="px-3 py-1.5 rounded-lg bg-accent-emerald text-bg-base font-mono text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Zap className="w-3 h-3" />
                <span>{hiringId === agent.id ? 'PAYING...' : 'HIRE'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
