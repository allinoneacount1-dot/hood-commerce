'use client';

import React, { useState } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Sparkles, Terminal, Mic, Send, AlertTriangle } from 'lucide-react';

export function HeroIntentTerminal() {
  const { executeIntent, policy, sessionKey } = useAgent();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetPrompts = [
    'Buy Hood Pioneer NFT #88 if floor drops < 0.05 ETH',
    'Allocate $15 USDC into Robinhood Chain yield aggregator',
    'Hire CodeBot for smart contract vulnerability audit ($10 USDC)',
    'Subscribe to DataBot real-time orderbook feed ($0.5 USDC/mo)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    setIsProcessing(true);
    await executeIntent(prompt);
    setPrompt('');
    setIsProcessing(false);
  };

  const handleSelectPreset = (text: string) => {
    setPrompt(text);
  };

  return (
    <section className="relative w-full pt-12 pb-16 border-b border-slate-border/50 bg-gradient-to-b from-bg-base via-bg-alt to-bg-base">
      <div className="shell">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Asymmetric Hero & Natural Language Input (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-surface border border-slate-border text-xs text-accent-emerald font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTENT-BASED AUTONOMOUS COMMERCE</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 leading-[1.1]">
              AI Agents That Can <span className="text-accent-emerald">Buy, Sell & Pay</span> Onchain.
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              Issue natural language commands to your autonomous economic actor. Protected by Account Abstraction Session Keys, real-time transaction simulation, and dynamic spending guardrails.
            </p>

            {/* Interactive Intent Terminal Form */}
            <form onSubmit={handleSubmit} className="relative w-full bg-bg-surface border border-slate-border rounded-xl p-2 shadow-2xl focus-within:border-accent-emerald/60 transition-colors">
              <div className="flex items-center gap-3 px-3 py-2">
                <Terminal className="w-5 h-5 text-accent-emerald shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask agent: 'Buy Hood NFT under 0.05 ETH' or 'Hire CodeBot for audit'..."
                  className="w-full bg-transparent text-slate-100 text-sm focus:outline-none placeholder:text-slate-500 font-mono"
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  className="p-2 rounded-lg text-slate-400 hover:text-accent-emerald hover:bg-bg-elevated transition-colors"
                  title="Voice command simulator"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!prompt.trim() || isProcessing}
                  className="px-4 py-2.5 rounded-lg bg-accent-emerald text-bg-base font-medium text-sm flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <span>{isProcessing ? 'SIMULATING...' : 'EXECUTE'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Quick Commands</span>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-bg-surface border border-slate-border text-slate-300 hover:border-accent-emerald/40 hover:text-accent-emerald transition-all text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Agent Status Telemetry Card (5 Cols) */}
          <div className="lg:col-span-5 bg-bg-surface border border-slate-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-border/80 pb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-100">Agent Wallet Telemetry</h3>
                <p className="text-xs text-slate-400 font-mono">Robinhood Chain (7070)</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-emeraldGlow text-accent-emerald text-xs font-mono border border-accent-emerald/30">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Balance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-bg-base border border-slate-border">
                <span className="text-xs text-slate-400 font-mono block">Agent Balance</span>
                <span className="font-mono text-xl font-bold text-slate-100">$1,250.00 <span className="text-xs font-normal text-slate-400">USDC</span></span>
              </div>
              <div className="p-3.5 rounded-lg bg-bg-base border border-slate-border">
                <span className="text-xs text-slate-400 font-mono block">Gas Reserve</span>
                <span className="font-mono text-xl font-bold text-slate-100">0.45 <span className="text-xs font-normal text-slate-400">ETH</span></span>
              </div>
            </div>

            {/* Daily Policy Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Daily Spending Allowance</span>
                <span className="text-accent-emerald font-semibold">${policy.spentTodayUsd.toFixed(2)} / ${policy.dailyLimitUsd.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-bg-base border border-slate-border overflow-hidden">
                <div
                  className="h-full bg-accent-emerald transition-all duration-500"
                  style={{ width: `${Math.min(100, (policy.spentTodayUsd / policy.dailyLimitUsd) * 100)}%` }}
                />
              </div>
            </div>

            {/* Session Key Info */}
            <div className="p-3.5 rounded-lg bg-bg-base/60 border border-slate-border/80 flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-400 block">Session Key Signer</span>
                <span className="text-slate-200">{sessionKey.address}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                {sessionKey.expiresAt}
              </span>
            </div>

            {/* Security Guardrail Note */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Transactions exceeding $30.00 USDC cap require biometric / manual confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
