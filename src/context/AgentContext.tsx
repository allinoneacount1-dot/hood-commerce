'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SpendingPolicy, SessionKey, IntentResult, AgentMarketplaceItem } from '@/types/agent';

interface AgentContextType {
  policy: SpendingPolicy;
  sessionKey: SessionKey;
  recentIntents: IntentResult[];
  marketplaceAgents: AgentMarketplaceItem[];
  protocolTreasuryFeesUsd: number;
  updatePolicy: (newPolicy: Partial<SpendingPolicy>) => void;
  toggleSessionKey: () => void;
  executeIntent: (prompt: string) => Promise<IntentResult>;
  hireAgent: (agent: AgentMarketplaceItem) => Promise<boolean>;
}

const defaultPolicy: SpendingPolicy = {
  dailyLimitUsd: 100.0,
  spentTodayUsd: 18.5,
  perTxCapUsd: 30.0,
  allowedCategories: ['SaaS', 'API Credits', 'NFT Commerce', 'DeFi Yield'],
  blockedCategories: ['Gambling', 'High Leverage', 'Unverified Contracts'],
};

const defaultSessionKey: SessionKey = {
  address: '0xa4b8...4e1f',
  expiresAt: '24h Remaining',
  isActive: true,
  permissionScope: ['DEX Swap', 'NFT Purchase', 'Micro-Payments'],
};

const initialAgents: AgentMarketplaceItem[] = [
  {
    id: 'agent-research',
    name: 'ResearchBot',
    role: 'Market & Sentiment Oracle',
    priceUsd: 2.0,
    reputationPercent: 99.4,
    totalVolumeUsd: '$148,200',
    capabilities: ['Twitter Sentiment', 'Whale Alert', 'Volume Spike'],
  },
  {
    id: 'agent-data',
    name: 'DataBot',
    role: 'High-Freq DEX Data',
    priceUsd: 0.5,
    reputationPercent: 98.9,
    totalVolumeUsd: '$89,400',
    capabilities: ['L2 Orderbook', 'Slippage Check', 'Liquidity Depth'],
  },
  {
    id: 'agent-code',
    name: 'CodeBot',
    role: 'Contract Audit & Anti-Rug',
    priceUsd: 10.0,
    reputationPercent: 99.8,
    totalVolumeUsd: '$312,900',
    capabilities: ['Bytecode Audit', 'Honeypot Test', 'Deployer History'],
  },
  {
    id: 'agent-design',
    name: 'DesignBot',
    role: 'Onchain Metadata & Logo',
    priceUsd: 5.0,
    reputationPercent: 97.5,
    totalVolumeUsd: '$42,100',
    capabilities: ['Generative NFT', 'SVG Compiler', 'IPFS Storage'],
  },
];

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [policy, setPolicy] = useState<SpendingPolicy>(defaultPolicy);
  const [sessionKey, setSessionKey] = useState<SessionKey>(defaultSessionKey);
  const [protocolTreasuryFeesUsd, setProtocolTreasuryFeesUsd] = useState<number>(14.25);
  const [recentIntents, setRecentIntents] = useState<IntentResult[]>([
    {
      rawPrompt: 'Hire CodeBot to scan smart contract 0x71a...99b for rug pull vulnerabilities',
      actionType: 'AGENT_PAY',
      targetAsset: 'CodeBot Audit API',
      amountUsd: 10.0,
      riskScorePercent: 1.2,
      simulationSteps: [
        { id: '1', stepName: 'Tenderly Sandbox Simulation', status: 'success', detail: '0 Error payloads found', gasEstimatedEth: '0.00012' },
        { id: '2', stepName: 'Anti-Scam Verification', status: 'success', detail: 'Passed 14 security checks', gasEstimatedEth: '0.00005' },
        { id: '3', stepName: 'Session Key Signing', status: 'success', detail: 'Signed via 0xa4b8...4e1f', gasEstimatedEth: '0.0' },
      ],
      txHash: '0x39a1b...8c90',
      status: 'executed',
      timestamp: '10 mins ago',
    },
    {
      rawPrompt: 'Subscribe to DataBot real-time Robinhood Chain orderbook feed',
      actionType: 'SUB_PAY',
      targetAsset: 'DataBot API Feed',
      amountUsd: 0.5,
      riskScorePercent: 0.5,
      simulationSteps: [
        { id: '1', stepName: 'Tenderly Sandbox Simulation', status: 'success', detail: 'Payload valid', gasEstimatedEth: '0.00008' },
        { id: '2', stepName: 'Spending Policy Check', status: 'success', detail: 'Within $30 per-tx cap', gasEstimatedEth: '0.0' },
      ],
      txHash: '0x88e72...1a2f',
      status: 'executed',
      timestamp: '25 mins ago',
    },
  ]);

  const updatePolicy = (newPolicy: Partial<SpendingPolicy>) => {
    setPolicy((prev) => ({ ...prev, ...newPolicy }));
  };

  const toggleSessionKey = () => {
    setSessionKey((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const executeIntent = async (prompt: string): Promise<IntentResult> => {
    const isNft = prompt.toLowerCase().includes('nft');
    const isDefi = prompt.toLowerCase().includes('dca') || prompt.toLowerCase().includes('yield') || prompt.toLowerCase().includes('usdc');
    
    const amountUsd = isNft ? 25.0 : isDefi ? 15.0 : 5.0;
    const actionType = isNft ? 'NFT_BUY' : isDefi ? 'DEFI_DCA' : 'AGENT_PAY';

    // Simulation delay
    await new Promise((res) => setTimeout(res, 1200));

    // Check policy limits
    if (policy.spentTodayUsd + amountUsd > policy.dailyLimitUsd) {
      const blockedResult: IntentResult = {
        rawPrompt: prompt,
        actionType,
        targetAsset: isNft ? 'Hood NFT Collection' : 'Robinhood Vault',
        amountUsd,
        riskScorePercent: 8.5,
        simulationSteps: [
          { id: '1', stepName: 'Daily Limit Verification', status: 'failed', detail: `Exceeds remaining daily limit of $${(policy.dailyLimitUsd - policy.spentTodayUsd).toFixed(2)}`, gasEstimatedEth: '0.0' },
        ],
        status: 'blocked',
        timestamp: 'Just now',
      };
      setRecentIntents((prev) => [blockedResult, ...prev]);
      return blockedResult;
    }

    const mockHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const executedResult: IntentResult = {
      rawPrompt: prompt,
      actionType,
      targetAsset: isNft ? 'Hood Pioneer NFT #88' : 'Robinhood USDC Liquidity',
      amountUsd,
      riskScorePercent: 1.8,
      simulationSteps: [
        { id: '1', stepName: 'Tenderly Sandbox Simulation', status: 'success', detail: '0 Error payloads found', gasEstimatedEth: '0.00014' },
        { id: '2', stepName: 'Spending Policy Check', status: 'success', detail: 'Allowed under daily cap', gasEstimatedEth: '0.0' },
        { id: '3', stepName: 'Robinhood Chain Settlement', status: 'success', detail: 'Executed via Session Key', gasEstimatedEth: '0.00021' },
      ],
      txHash: mockHash,
      status: 'executed',
      timestamp: 'Just now',
    };

    setPolicy((prev) => ({
      ...prev,
      spentTodayUsd: prev.spentTodayUsd + amountUsd,
    }));
    setProtocolTreasuryFeesUsd((prev) => prev + amountUsd * 0.0025);
    setRecentIntents((prev) => [executedResult, ...prev]);

    return executedResult;
  };

  const hireAgent = async (agent: AgentMarketplaceItem): Promise<boolean> => {
    const prompt = `Hire ${agent.name} (${agent.role}) for $${agent.priceUsd} USDC on Robinhood Chain`;
    const res = await executeIntent(prompt);
    return res.status === 'executed';
  };

  return (
    <AgentContext.Provider
      value={{
        policy,
        sessionKey,
        recentIntents,
        marketplaceAgents: initialAgents,
        protocolTreasuryFeesUsd,
        updatePolicy,
        toggleSessionKey,
        executeIntent,
        hireAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent must be used within AgentProvider');
  return context;
}
