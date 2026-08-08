'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAgent } from '@/context/AgentContext';
import { ShieldCheck, Cpu, Key } from 'lucide-react';

export function Header() {
  const { sessionKey, toggleSessionKey } = useAgent();

  return (
    <header className="w-full border-b border-slate-border/80 bg-bg-base/90 backdrop-blur-md sticky top-0 z-50">
      <div className="shell py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bg-surface border border-slate-border flex items-center justify-center text-accent-emerald shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wider text-slate-100">CENTAURUS</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-emeraldGlow text-accent-emerald border border-accent-emerald/30">
                HOOD COMMERCE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Autonomous AI Agent Protocol on Robinhood Chain</p>
          </div>
        </div>

        {/* Network & Session Key & Wallet Controls */}
        <div className="flex items-center gap-4">
          {/* Session Key Delegation Status Badge */}
          <button
            onClick={toggleSessionKey}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              sessionKey.isActive
                ? 'bg-accent-emeraldGlow border-accent-emerald/40 text-accent-emerald hover:border-accent-emerald'
                : 'bg-bg-surface border-slate-border text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Session Key: {sessionKey.isActive ? 'DELEGATED' : 'PAUSED'}</span>
          </button>

          {/* RainbowKit Wallet Connect */}
          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
