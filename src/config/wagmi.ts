import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { robinhoodChain } from './robinhoodChain';
import { sepolia, arbitrumSepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'Centaurus Hood Commerce',
  projectId: 'a4b8c9d0e1f234567890abcdef123456', // Mock/Demo Project ID for RainbowKit
  chains: [robinhoodChain, arbitrumSepolia, sepolia],
  ssr: true,
});
