'use client';

import React from 'react';
import { useAgent } from '@/context/AgentContext';
import { ShieldCheck, Cpu, ArrowRight, CheckCircle2, XCircle, FileText } from 'lucide-react';

export function SimulationTerminal() {
  const { recentIntents } = useAgent();

  return (
    <div className="bg-bg-surface border border-slate-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-bg-elevated text-accent-emerald">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-100">Live Simulation & Execution Sandbox</h3>
            <p className="text-xs text-slate-400 font-mono">Tenderly-style Dry-Run & On-Chain Proofs</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">Total Logged: {recentIntents.length}</span>
      </div>

      <div className="space-y-4">
        {recentIntents.map((intent, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-bg-base border border-slate-border space-y-3">
            {/* Header / Status row */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {intent.actionType}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{intent.timestamp}</span>
                </div>
                <p className="text-sm text-slate-200 font-mono font-medium">"{intent.rawPrompt}"</p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                    intent.status === 'executed'
                      ? 'bg-accent-emeraldGlow text-accent-emerald border-accent-emerald/30'
                      : 'bg-accent-crimson/10 text-accent-crimson border-accent-crimson/30'
                  }`}
                >
                  {intent.status === 'executed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {intent.status.toUpperCase()}
                </span>
                <span className="block text-xs font-mono text-slate-400 mt-1">${intent.amountUsd.toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Simulation Pipeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-border/50">
              {intent.simulationSteps.map((step) => (
                <div key={step.id} className="p-2.5 rounded bg-bg-surface border border-slate-border/60 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{step.stepName}</span>
                    <span className={step.status === 'success' ? 'text-accent-emerald' : 'text-accent-crimson'}>
                      {step.status === 'success' ? 'PASSED' : 'BLOCKED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{step.detail}</p>
                </div>
              ))}
            </div>

            {/* Transaction Proof Link */}
            {intent.txHash && (
              <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-400 border-t border-slate-border/30">
                <span className="flex items-center gap-1.5 text-accent-emerald">
                  <ShieldCheck className="w-3.5 h-3.5" /> MEV Protection & Zero Drainer Guarantee
                </span>
                <a
                  href={`https://explorer.robinhood.org/tx/${intent.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-accent-emerald transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Hash: {intent.txHash.slice(0, 10)}...{intent.txHash.slice(-6)}
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
