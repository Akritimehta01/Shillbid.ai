import { useEffect, useState } from 'react';
import { Search, User, Eye, AlertTriangle } from 'lucide-react';
import { fetchBidders, fetchPrediction, type Bidder, type Prediction } from '../lib/api';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function BiddersRisk() {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => { loadBidders(); }, [riskFilter]);

  const loadBidders = async () => {
    try {
      setLoading(true);
      const data = await fetchBidders({ risk_level: riskFilter || undefined, search: search || undefined, limit: 100 });
      setBidders(data.bidders);
    } catch (error) {
      console.error('Failed to load bidders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidderClick = async (bidder: Bidder) => {
    setSelectedBidder(bidder);
    setLoadingPrediction(true);
    try {
      const data = await fetchPrediction('bidder', bidder.bidder_id);
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Failed to load prediction:', error);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Scoring Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered fraud risk assessment for all bidders</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadBidders()}
            placeholder="Search bidders..."
            className="pl-3 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-48"
          />
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Bidder</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Risk Score</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Activity</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Win Ratio</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {bidders.map((bidder) => (
                      <tr key={bidder.id} onClick={() => handleBidderClick(bidder)} className={`cursor-pointer transition-colors ${selectedBidder?.id === bidder.id ? 'bg-cyan-500/10' : 'hover:bg-slate-700/30'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{bidder.name}</p>
                              <p className="text-xs text-slate-400">{bidder.bidder_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${bidder.fraud_risk_score > 0.7 ? 'bg-red-500' : bidder.fraud_risk_score > 0.5 ? 'bg-orange-500' : bidder.fraud_risk_score > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${bidder.fraud_risk_score * 100}%` }} />
                            </div>
                            <span className="text-sm text-white font-medium">{formatPercent(bidder.fraud_risk_score)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-white">{bidder.total_bids} bids</p>
                            <p className="text-slate-400 text-xs">{bidder.auctions_participated} auctions</p>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-sm text-white">{formatPercent(bidder.win_ratio)}</span></td>
                        <td className="px-6 py-4"><RiskBadge level={bidder.risk_level as 'low' | 'medium' | 'high' | 'critical'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 sticky top-6">
            {selectedBidder ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
                  <RiskBadge level={selectedBidder.risk_level as 'low' | 'medium' | 'high' | 'critical'} />
                </div>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Fraud Probability</p>
                    <p className="text-4xl font-bold text-white">{formatPercent(selectedBidder.fraud_risk_score)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-900/50 rounded-lg"><p className="text-xs text-slate-400">Total Bids</p><p className="text-lg font-semibold text-white">{selectedBidder.total_bids}</p></div>
                    <div className="p-3 bg-slate-900/50 rounded-lg"><p className="text-xs text-slate-400">Auctions</p><p className="text-lg font-semibold text-white">{selectedBidder.auctions_participated}</p></div>
                    <div className="p-3 bg-slate-900/50 rounded-lg"><p className="text-xs text-slate-400">Late Bids</p><p className="text-lg font-semibold text-amber-400">{formatPercent(selectedBidder.late_bidding_score)}</p></div>
                    <div className="p-3 bg-slate-900/50 rounded-lg"><p className="text-xs text-slate-400">Anomaly</p><p className="text-lg font-semibold text-orange-400">{formatPercent(selectedBidder.anomaly_score)}</p></div>
                  </div>

                  {loadingPrediction ? (
                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                  ) : prediction ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Risk Factors</span>
                      </div>
                      {prediction.top_positive_factors.length > 0 && (
                        <div className="space-y-2">
                          {prediction.top_positive_factors.slice(0, 5).map((factor, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                              <span className="text-xs text-slate-300 truncate flex-1">{factor.feature.replace(/_/g, ' ')}</span>
                              <span className="text-xs text-red-400 font-medium">+{(factor.value * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2">Model Explanation</p>
                        <p className="text-sm text-white">{prediction.explanation_summary}</p>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-slate-400 mb-2">Confidence</p>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${prediction.confidence * 100}%` }} />
                        </div>
                        <p className="text-right text-xs text-slate-400 mt-1">{(prediction.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No prediction available</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Select a bidder to view AI analysis and explainable insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
