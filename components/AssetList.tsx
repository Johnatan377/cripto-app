
import React from 'react';
import { PortfolioData, AppTheme } from '../types';
import { Trash2, PenLine, Bell } from 'lucide-react';
import { COLORS } from '../constants';

interface Props {
  data: PortfolioData[];
  onRemove: (localId: string) => void;
  onEdit: (asset: PortfolioData) => void;
  onAddAlert: (asset: PortfolioData) => void;
  onManageAlerts: () => void;
  currency: string;
  theme?: AppTheme;
  privacyMode?: boolean;
  onSelect?: (asset: PortfolioData) => void;
}

const AssetList: React.FC<Props> = ({
  data, onRemove, onEdit, onAddAlert, currency, theme = 'black', privacyMode = false, onSelect
}) => {
  const currencySymbol = currency === 'brl' ? 'R$' : currency === 'eur' ? '€' : '$';

  const formatPrice = (price: number) => {
    if (price === 0) return '0.00';
    if (price < 0.01) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).replace(/0+$/, '').replace(/\.$/, '.00');
    }
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const validAssetsForColor = data.filter(d => d.totalValue > 0);

  const getSparklineData = (change: number, price: number, id: string) => {
    const points = 24;
    const result = [];
    const startPrice = price / (1 + (change / 100));
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const step = (price - startPrice) / points;

    for (let i = 0; i < points; i++) {
      const noiseFactor = Math.sin(seed + i * 0.5) * Math.cos(seed * i);
      const noise = noiseFactor * (price * 0.005);
      const trend = startPrice + (step * i);
      result.push(trend + noise);
    }
    result.push(price);
    return result;
  };

  return (
    <div className="space-y-4 pb-10 w-full overflow-x-auto">
      <div className="flex items-center justify-end px-1 mb-2">
        <span className="text-[7px] font-bold text-white/20">{data.length} UP</span>
      </div>

      <div className="hidden md:flex min-w-[800px] flex-col gap-2">
        {data.map((asset) => {
          const isPositive = asset.price_change_percentage_24h >= 0;
          const colorClass = isPositive ? 'text-[#00ffa3]' : 'text-[#ff0055]';
          const sparklineData = asset.sparkline || getSparklineData(asset.price_change_percentage_24h, asset.current_price, asset.id);
          const colorIndex = validAssetsForColor.findIndex(d => d.localId === asset.localId);
          const assetColor = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : '#888888';

          return (
            <div
              key={asset.localId}
              onClick={() => onSelect && onSelect(asset)}
              className={`relative grid grid-cols-6 gap-4 items-center p-4 pr-32 rounded-lg border transition-all cursor-pointer hover:bg-white/5 
                ${theme === 'white' ? 'bg-neutral-950 border-white/5' : 'bg-neutral-900/60 border-white/5'}
              `}
            >
              <div className="flex items-center gap-3 col-span-1">
                {asset.image && <img src={asset.image} alt="" className="w-8 h-8 rounded-full" />}
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-white tracking-tight leading-none">{asset.name}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{asset.symbol}</span>
                </div>
              </div>

              <div className="text-right font-black text-sm text-white tracking-tight col-span-1">
                {currencySymbol}{formatPrice(asset.current_price)}
              </div>

              <div className={`text-right text-xs font-black uppercase tracking-widest col-span-1 ${colorClass}`}>
                {isPositive ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
              </div>

              <div className="col-span-1 h-8 flex items-center justify-center relative opacity-80">
                <Sparkline data={sparklineData} color={assetColor} />
              </div>

              <div className="text-right flex flex-col items-end col-span-1">
                <span className="text-sm font-bold text-blue-200">
                  {privacyMode ? '****' : asset.quantity.toFixed(4)}
                </span>
                <span className="text-[9px] text-white/30 font-bold uppercase">{asset.symbol}</span>
              </div>

              <div className="text-right font-black text-sm text-white tracking-tight col-span-1">
                {privacyMode ? '****' : `${currencySymbol}${formatPrice(asset.totalValue)}`}
              </div>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-xl border border-white/5">
                <button onClick={(e) => { e.stopPropagation(); onAddAlert(asset); }} className="p-2 bg-white/5 rounded-lg hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-all active:scale-95" title="Alarmes"><Bell size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(asset); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95" title="Editar"><PenLine size={14} /></button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  console.log("Delete clicked (Desktop), localId:", asset.localId);
                  onRemove(asset.localId);
                }} className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all active:scale-95" title="Excluir"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex md:hidden flex-col gap-3">
        {data.map((asset) => {
          const isPositive = asset.price_change_percentage_24h >= 0;
          const colorClass = isPositive ? 'text-[#00ffa3]' : 'text-[#ff0055]';
          const sparklineData = asset.sparkline || getSparklineData(asset.price_change_percentage_24h, asset.current_price, asset.id);
          const colorIndex = validAssetsForColor.findIndex(d => d.localId === asset.localId);
          const assetColor = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : '#888888';

          return (
            <div
              key={asset.localId}
              onClick={() => onSelect && onSelect(asset)}
              className={`relative flex flex-col p-4 pr-16 rounded-lg border transition-all active:scale-95 cursor-pointer
                ${theme === 'white' ? 'bg-neutral-950 border-white/5' : 'bg-neutral-900/60 border-white/5'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {asset.image && <img src={asset.image} alt="" className="w-10 h-10 rounded-full" />}
                  <div className="flex flex-col">
                    <span className="font-extrabold text-white tracking-tight leading-none text-base">{asset.name}</span>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{asset.symbol}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-black text-white tracking-tight text-base">
                    {currencySymbol}{formatPrice(asset.current_price)}
                  </span>
                  <div className={`text-xs font-black uppercase tracking-widest ${colorClass}`}>
                    {isPositive ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/30 font-bold uppercase mb-0.5">Holdings</span>
                  <span className="text-xs font-bold text-blue-200">
                    {privacyMode ? '****' : `${asset.quantity.toFixed(4)} ${asset.symbol}`}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-white/30 font-bold uppercase mb-0.5">Total Value</span>
                  <span className="text-white font-black text-sm">
                    {privacyMode ? '****' : `${currencySymbol}${formatPrice(asset.totalValue)}`}
                  </span>
                </div>
              </div>

              <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-2 bg-black/20 backdrop-blur-[2px] px-1.5 rounded-r-lg border-l border-white/5">
                <button onClick={(e) => { e.stopPropagation(); onAddAlert(asset); }} className="p-2.5 bg-white/5 rounded-xl text-white/30 hover:text-cyan-400 hover:bg-cyan-500/20 active:scale-90 transition-all"><Bell size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(asset); }} className="p-2.5 bg-white/5 rounded-xl text-white/30 hover:text-white hover:bg-white/10 active:scale-90 transition-all"><PenLine size={16} /></button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Delete clicked (Mobile), localId:", asset.localId);
                    onRemove(asset.localId);
                  }}
                  className="p-2.5 bg-white/5 rounded-xl text-white/30 hover:text-red-500 hover:bg-red-500/20 active:scale-90 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,${height} ${points} L${width},${height} Z`} fill={`url(#grad-${color})`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default AssetList;
