import { defineChain } from 'viem';

// Robinhood Chain EVM Configuration
export const robinhoodChain = defineChain({
  id: 7070,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: {
    name: 'Robinhood Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.robinhood.org', 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public'],
    },
    public: {
      http: ['https://rpc.robinhood.org', 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Explorer',
      url: 'https://explorer.robinhood.org',
    },
  },
  testnet: true,
});
