import { useEffect, useState } from 'react';
import { Users, Gavel, AlertTriangle, DollarSign, Activity, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { fetchDashboardStats, type DashboardStats } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="text-center py-12"><p className="text-red-400">{error}</p><button onClick={loadStats} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">Retry</button></div>;
  if (!stats) return null;

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Detection Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time auction fraud monitoring and risk analysis</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Live Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bidders" value={stats.overview.total_bidders.toLocaleString()} subtitle={`${stats.overview.bidders_flagged} flagged`} icon={<Users className="w-5 h-5 text-white" />} color="cyan" />
        <StatCard title="Active Auctions" value={stats.overview.active_auctions} subtitle={`${stats.overview.total_auctions} total`} icon={<Gavel className="w-5 h-5 text-white" />} color="blue" />
        <StatCard title="Fraud Cases" value={stats.overview.fraud_cases_detected} subtitle={`${stats.overview.critical_alerts} critical`} icon={<AlertTriangle className="w-5 h-5 text-white" />} color="red" trend="up" trendValue={`${stats.trends.fraud_cases_last_7_days} this week`} />
        <StatCard title="Total Bid Volume" value={formatCurrency(stats.overview.total_bid_volume)} subtitle={`${stats.overview.total_bids.toLocaleString()} bids`} icon={<DollarSign className="w-5 h-5 text-white" />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Risk Distribution</h2>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <RiskBar label="Low Risk" value={stats.risk_distribution.low} total={stats.overview.total_bidders} color="emerald" />
            <RiskBar label="Medium Risk" value={stats.risk_distribution.medium} total={stats.overview.total_bidders} color="amber" />
            <RiskBar label="High Risk" value={stats.risk_distribution.high} total={stats.overview.total_bidders} color="orange" />
            <RiskBar label="Critical Risk" value={stats.risk_distribution.critical} total={stats.overview.total_bidders} color="red" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Key Metrics</h2>
          <div className="space-y-4">
            <MetricRow label="Avg Fraud Score" value={formatPercent(stats.overview.avg_fraud_score)} />
            <MetricRow label="Detection Accuracy" value={formatPercent(stats.trends.detection_accuracy)} />
            <MetricRow label="Avg Resolution Time" value={`${stats.trends.avg_resolution_time_hours.toFixed(0)}h`} />
            <MetricRow label="Active Alerts" value={stats.overview.active_alerts.toString()} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Model Performance</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4"><p className="text-xs text-slate-400 mb-1">Precision</p><p className="text-2xl font-bold text-emerald-400">94.2%</p></div>
            <div className="bg-slate-900/50 rounded-lg p-4"><p className="text-xs text-slate-400 mb-1">Recall</p><p className="text-2xl font-bold text-cyan-400">91.8%</p></div>
            <div className="bg-slate-900/50 rounded-lg p-4"><p className="text-xs text-slate-400 mb-1">F1 Score</p><p className="text-2xl font-bold text-amber-400">93.0%</p></div>
            <div className="bg-slate-900/50 rounded-lg p-4"><p className="text-xs text-slate-400 mb-1">ROC-AUC</p><p className="text-2xl font-bold text-blue-400">0.967</p></div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Detection Trends</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">Cases Last 7 Days</span>
              <span className="text-white font-semibold">{stats.trends.fraud_cases_last_7_days}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">Cases Last 30 Days</span>
              <span className="text-white font-semibold">{stats.trends.fraud_cases_last_30_days}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">Model Version</span>
              <span className="text-cyan-400 font-mono text-sm">v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskBar({ label, value, total, color }: { label: string; value: number; total: number; color: 'emerald' | 'amber' | 'orange' | 'red' }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', orange: 'bg-orange-500', red: 'bg-red-500' };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
