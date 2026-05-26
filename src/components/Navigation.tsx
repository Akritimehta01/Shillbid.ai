import { Activity, Users, Gavel, Network, Bell, Shield } from 'lucide-react';
import type { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const navItems: Array<{ id: Page; label: string; icon: typeof Activity }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'bidders', label: 'Risk Scoring', icon: Users },
  { id: 'auctions', label: 'Auctions', icon: Gavel },
  { id: 'network', label: 'Fraud Network', icon: Network },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ShillBid AI</h1>
              <p className="text-xs text-slate-400">Fraud Detection Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
