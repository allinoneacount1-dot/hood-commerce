import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { AgentProvider } from '@/context/AgentContext';

export const metadata: Metadata = {
  title: 'Centaurus // Hood Commerce Autonomous AI Agent',
  description: 'AI Agent Commerce system designed as an autonomous economic entity on Robinhood Chain EVM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-base text-slate-100 antialiased selection:bg-accent-emerald selection:text-bg-base">
        <Web3Provider>
          <AgentProvider>{children}</AgentProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
