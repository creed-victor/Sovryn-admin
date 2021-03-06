import React from 'react';
import { useIsConnected } from '../../hooks/useAccount';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { TradingHistory } from '../TradingHistory';

export function TradingHistoryPage() {
  const isConnected = useIsConnected();
  return (
    <>
      <Header />
      <main className="container">
        <h2 className="mb-4">Trading History</h2>
        {!isConnected && <div>Please connect and authorize your wallet.</div>}
        {isConnected && <TradingHistory />}
      </main>
      <Footer />
    </>
  );
}
