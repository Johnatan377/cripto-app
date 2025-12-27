import React from 'react';
import { PortfolioStats } from '../types';
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PortfolioSummaryProps {
  stats: PortfolioStats;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ stats }) => {
  const [hidden, setHidden] = React.useState(false);
  const isPositive = stats.totalChangePercent >= 0;

  return (
    <div className="bg-gradient-to-br from-crypto-card to-crypto-dark border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-2xl shadow-black/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <p className="text-crypto-muted text-sm font-medium">Total Balance</p>
          <button onClick={() => setHidden(!hidden)} className="text-crypto-muted hover:text-white transition-colors">
            {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
          {hidden ? '•••••••' : `$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </h2>

        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-md border border-white/5 ${isPositive ? 'bg-crypto-success/20 text-crypto-success' : 'bg-crypto-danger/20 text-crypto-danger'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>
            {isPositive ? '+' : ''}{stats.totalChangePercent.toFixed(2)}%
            <span className="opacity-60 ml-1">(${Math.abs(stats.totalChange24h).toLocaleString('en-US')})</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
