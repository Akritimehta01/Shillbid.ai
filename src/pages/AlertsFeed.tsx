import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { fetchFraudAlerts, type FraudAlert } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function AlertsFeed() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => { loadAlerts(); }, [severityFilter, statusFilter]);
  useEffect(() => { const interval = setInterval(() => loadAlerts(true), 30000); return () => clearInterval(interval); }, [severityFilter, statusFilter]);

  const loadAlerts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchFraudAlerts({ severity: severityFilter || undefined, status: statusFilter || undefined, limit: 50 });
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'shill_bidding': case 'bid_inflation': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'collusion': case 'fraud_ring': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'last_minute_spike': return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Bell className="w-4 h-4 text-cyan-400" />;
      case 'investigating': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-red-400" />;
      case 'dismissed': case 'false_positive': return <XCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const newCount = alerts.filter((a) => a.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Alert Feed</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time detection alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="confirmed">Confirmed</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <button onClick={() => loadAlerts()} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Critical Alerts</p><p className="text-2xl font-bold text-red-400">{criticalCount}</p></div>
            <AlertTriangle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-400">New Alerts</p><p className="text-2xl font-bold text-cyan-400">{newCount}</p></div>
            <Bell className="w-8 h-8 text-cyan-400 opacity-50" />
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Total Alerts</p><p className="text-2xl font-bold text-white">{alerts.length}</p></div>
            <Bell className="w-8 h-8 text-slate-400 opacity-50" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No alerts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`bg-slate-800/50 rounded-xl border overflow-hidden transition-all hover:bg-slate-800 ${alert.severity === 'critical' ? 'border-red-500/50' : alert.severity === 'high' ? 'border-orange-500/50' : 'border-slate-700/50'}`}>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.alert_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white truncate">{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>{alert.severity}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{getTimeAgo(alert.created_at)}</span>
                      {alert.bidder_ref && <span className="text-slate-400">Bidder: {alert.bidder_ref}</span>}
                      {alert.auction_ref && <span className="text-slate-400">Auction: {alert.auction_ref}</span>}
                    </div>
                    {alert.contributing_factors && alert.contributing_factors.length > 0 && (
                      <div className="mt-3 p-2 bg-slate-900/50 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.contributing_factors.slice(0, 3).map((factor, i) => (
                            <span key={i} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded text-slate-300">{typeof factor === 'string' ? factor : factor.toString()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alert.fraud_score > 0.7 ? 'bg-red-500/20' : alert.fraud_score > 0.5 ? 'bg-orange-500/20' : 'bg-amber-500/20'}`}>
                      <span className="text-sm font-bold text-white">{Math.round(alert.fraud_score * 100)}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-center">Risk</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(alert.status)}
                  <span className="text-xs text-slate-400 capitalize">{alert.status.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-cyan-400 hover:text-cyan-300">Investigate</button>
                  <span className="text-slate-600">|</span>
                  <button className="text-xs text-slate-400 hover:text-slate-300">Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
