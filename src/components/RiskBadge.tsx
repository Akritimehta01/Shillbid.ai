interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md';
}

const riskConfig = {
  low: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Low' },
  medium: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Medium' },
  high: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', label: 'High' },
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', label: 'Critical' },
};

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const config = riskConfig[level];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.border} ${config.text} border ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
