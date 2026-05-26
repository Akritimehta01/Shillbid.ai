import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color?: 'cyan' | 'red' | 'amber' | 'emerald' | 'blue';
}

const colorVariants = {
  cyan: 'from-cyan-500 to-blue-600',
  red: 'from-red-500 to-rose-600',
  amber: 'from-amber-500 to-orange-600',
  emerald: 'from-emerald-500 to-green-600',
  blue: 'from-blue-500 to-indigo-600',
};

export function StatCard({ title, value, subtitle, trend, trendValue, icon, color = 'cyan' }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : null}
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorVariants[color]} shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
