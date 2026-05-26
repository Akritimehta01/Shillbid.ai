import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { BiddersRisk } from './pages/BiddersRisk';
import { AuctionsMonitor } from './pages/AuctionsMonitor';
import { FraudNetworkPage } from './pages/FraudNetworkPage';
import { AlertsFeed } from './pages/AlertsFeed';
import { Navigation } from './components/Navigation';

export type Page = 'dashboard' | 'bidders' | 'auctions' | 'network' | 'alerts';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'bidders': return <BiddersRisk />;
      case 'auctions': return <AuctionsMonitor />;
      case 'network': return <FraudNetworkPage />;
      case 'alerts': return <AlertsFeed />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="p-6">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
