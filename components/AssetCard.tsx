import React from 'react';
import { Asset } from '../types';
import { TrendingUp, TrendingDown, Bitcoin } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const isPositive = asset.change24h >= 0;
  const totalValue = asset.amount * asset.currentPrice;

  return (
    <div className="bg-crypto-card border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
          {/* Simple fallback icon for coins */}
          <span className="font-bold text-white/80">{asset.symbol[0]}</span>
        </div>
        <div>
          <h3 className="font-bold text-white">{asset.name}</h3>
          <p className="text-sm text-crypto-muted">{asset.amount} {asset.symbol}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-crypto-success' : 'text-crypto-danger'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(asset.change24h)}%</span>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
