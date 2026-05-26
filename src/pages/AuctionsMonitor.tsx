import { useEffect, useState } from 'react';
import { Gavel, Clock, DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { fetchAuctions, type Auction } from '../lib/api';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function AuctionsMonitor() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  useEffect(() => { loadAuctions(); }, [statusFilter, riskFilter]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await fetchAuctions({ status: statusFilter || undefined, risk_level: riskFilter || undefined, limit: 100 });
      setAuctions(data.auctions);
    } catch (error) {
      console.error('Failed to load auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  const getTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${minutes}m`;
  };

  const highRiskCount = auctions.filter((a) => a.risk_level === 'high' || a.risk_level === 'critical').length;
  const activeFraudAuctions = auctions.filter((a) => a.status === 'active' && a.fraud_risk_score > 0.5).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Auction Risk Monitor</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor auction-level fraud indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
            <option value="">All Risk</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg"><Gavel className="w-5 h-5 text-cyan-400" /></div>
            <div><p className="text-xs text-slate-400">Total Auctions</p><p className="text-xl font-bold text-white">{auctions.length}</p></div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg"><Clock className="w-5 h-5 text-emerald-400" /></div>
            <div><p className="text-xs text-slate-400">Active</p><p className="text-xl font-bold text-white">{auctions.filter((a) => a.status === 'active').length}</p></div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
            <div><p className="text-xs text-slate-400">High Risk</p><p className="text-xl font-bold text-red-400">{highRiskCount}</p></div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg"><TrendingUp className="w-5 h-5 text-orange-400" /></div>
            <div><p className="text-xs text-slate-400">Active Fraud</p><p className="text-xl font-bold text-orange-400">{activeFraudAuctions}</p></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <div key={auction.id} className={`bg-slate-800/50 rounded-xl border overflow-hidden ${auction.fraud_risk_score > 0.5 ? 'border-red-500/50' : 'border-slate-700/50'}`}>
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${auction.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>{auction.status.toUpperCase()}</span>
                      <span className="text-xs text-slate-500">{auction.category}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white truncate">{auction.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{auction.auction_id}</p>
                  </div>
                  <RiskBadge level={auction.risk_level as 'low' | 'medium' | 'high' | 'critical'} size="sm" />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-400"><DollarSign className="w-4 h-4" /><span className="text-xs">Current</span></div>
                  <span className="text-lg font-bold text-white">{formatCurrency(auction.current_price || auction.starting_price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-400"><TrendingUp className="w-4 h-4" /><span className="text-xs">Inflation</span></div>
                  <span className={`text-sm font-medium ${auction.price_inflation_percent > 30 ? 'text-red-400' : 'text-white'}`}>{auction.price_inflation_percent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-400"><Users className="w-4 h-4" /><span className="text-xs">Bidders</span></div>
                  <span className="text-sm text-white">{auction.unique_bidders} unique</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-400"><Clock className="w-4 h-4" /><span className="text-xs">Time</span></div>
                  <span className="text-sm text-white">{getTimeRemaining(auction.end_time)}</span>
                </div>
                <div className="pt-2 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Fraud Risk</span>
                    <span className="text-xs font-medium text-white">{(auction.fraud_risk_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${auction.fraud_risk_score > 0.7 ? 'bg-red-500' : auction.fraud_risk_score > 0.5 ? 'bg-orange-500' : auction.fraud_risk_score > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${auction.fraud_risk_score * 100}%` }} />
                  </div>
                </div>
                {auction.is_flagged && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400">Flagged for review</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
