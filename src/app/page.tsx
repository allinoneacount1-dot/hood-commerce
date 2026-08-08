'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { HeroIntentTerminal } from '@/components/HeroIntentTerminal';
import { SimulationTerminal } from '@/components/SimulationTerminal';
import { SpendingPolicyMatrix } from '@/components/SpendingPolicyMatrix';
import { AgentMarketplace } from '@/components/AgentMarketplace';
import { ProofAuditLogs } from '@/components/ProofAuditLogs';

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-base text-slate-100 flex flex-col space-y-12 pb-24">
      {/* Tactical Navigation */}
      <Header />

      {/* Hero Intent Terminal */}
      <HeroIntentTerminal />

      {/* Core Operational Modules in Shell */}
      <div className="shell space-y-12">
        {/* Module 1: Live Simulation & Execution Terminal */}
        <section>
          <SimulationTerminal />
        </section>

        {/* Module 2: Spending Policy & Guardrails Matrix */}
        <section>
          <SpendingPolicyMatrix />
        </section>

        {/* Module 3: Agent-to-Agent Micro-Marketplace */}
        <section>
          <AgentMarketplace />
        </section>

        {/* Module 4: Protocol Monetization & Proof Audit Logs */}
        <section>
          <ProofAuditLogs />
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-border/60 py-8 mt-16 text-center text-xs font-mono text-slate-500">
        <div className="shell flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>CENTAURUS HOOD COMMERCE PROTOCOL v1.0</span>
          <span>ROBINHOOD CHAIN TESTNET (7070)</span>
          <span>BUILT FOR HIGH-STAKES AUTONOMOUS COMMERCE</span>
        </div>
      </footer>
    </main>
  );
}
