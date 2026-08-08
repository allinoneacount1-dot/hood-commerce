export interface SpendingPolicy {
  dailyLimitUsd: number;
  spentTodayUsd: number;
  perTxCapUsd: number;
  allowedCategories: string[];
  blockedCategories: string[];
}

export interface SessionKey {
  address: string;
  expiresAt: string;
  isActive: boolean;
  permissionScope: string[];
}

export interface SimulationStep {
  id: string;
  stepName: string;
  status: 'pending' | 'success' | 'failed';
  detail: string;
  gasEstimatedEth: string;
}

export interface IntentResult {
  rawPrompt: string;
  actionType: 'NFT_BUY' | 'DEFI_DCA' | 'AGENT_PAY' | 'SUB_PAY';
  targetAsset: string;
  amountUsd: number;
  riskScorePercent: number;
  simulationSteps: SimulationStep[];
  txHash?: string;
  status: 'idle' | 'simulating' | 'policy_check' | 'executed' | 'blocked';
  timestamp: string;
}

export interface AgentMarketplaceItem {
  id: string;
  name: string;
  role: string;
  priceUsd: number;
  reputationPercent: number;
  totalVolumeUsd: string;
  capabilities: string[];
}
