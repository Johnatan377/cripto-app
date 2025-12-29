
import React, { useState, useEffect, useRef } from 'react';
import { PortfolioData, AppTheme } from '../types';
import { Trash2, PenLine, MoreVertical, Plus, TrendingUp, TrendingDown, Bell, BellPlus } from 'lucide-react';
import { THEME_STYLES, COLORS } from '../constants';

interface Props {
  data: PortfolioData[];
  onRemove: (id: string) => void;
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
  const isGameTheme = theme === 'game';
  const isWhiteTheme = theme === 'white';

  const formatPrice = (price: number) => {
    if (price === 0) return '0.00';
    if (price < 0.01) {
      // For very small prices, show up to 8 decimal places and remove trailing zeros
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).replace(/0+$/, '').replace(/\.$/, '.00'); // Ensure at least .00 or similar if it becomes too clean, but usually this is fine
    }
    // Standard 2 decimal places for everything else
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Logic to sync colors with Pie Chart
  const validAssetsForColor = data.filter(d => d.totalValue > 0);

  // Helper to generate fake sparkline data if missing (based on 24h change to look realistic but STABLE)
  const getSparklineData = (change: number, price: number, id: string) => {
    const points = 24; // Represents hours
    const data = [];
    // Correct formula for start price: current / (1 + change%)
    // Example: 100 with +10% -> Start was ~90.9
    const startPrice = price / (1 + (change / 100));

    // Create a seed based on the asset ID to make the graph consistent (no jitter on re-render)
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const step = (price - startPrice) / points;

    for (let i = 0; i < points; i++) {
      // Deterministic noise using sin/cos based on seed and index
      // This ensures the shape is always the same for the same asset ID
      const noiseFactor = Math.sin(seed + i * 0.5) * Math.cos(seed * i);
      const noise = noiseFactor * (price * 0.005); // Small realistic variation (0.5%)

      // Linear interpolation + noise
      const trend = startPrice + (step * i);
      data.push(trend + noise);
    }
    data.push(price); // Ensure it ends at current price
    return data;
  };

  return (
    <div className="space-y-4 pb-10 w-full overflow-x-auto">
      <div className="flex items-center justify-end px-1 mb-2">
        <span className="text-[7px] font-bold text-white/20">{data.length} UP</span>
      </div>

      <div className="hidden md:flex min-w-[800px] flex-col gap-2">
        {/* Header Row (Optional, but good for alignment if we wanted one) */}

        {data.map((asset) => {
          const isPositive = asset.price_change_percentage_24h >= 0;
          const colorClass = isPositive ? 'text-[#00ffa3]' : 'text-[#ff0055]';
          // Pass ID to make it deterministic
          const sparklineData = asset.sparkline || getSparklineData(asset.price_change_percentage_24h, asset.current_price, asset.id);

          // Determine Color
          const colorIndex = validAssetsForColor.findIndex(d => d.id === asset.id);
          const assetColor = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : '#888888';

          return (
            <div
              key={asset.id}
              onClick={() => onSelect && onSelect(asset)}
              className={`relative grid grid-cols-6 gap-4 items-center p-4 pr-32 rounded-lg border transition-all cursor-pointer hover:bg-white/5 
                ${theme === 'white' ? 'bg-neutral-950 border-transparent' : theme === 'yellow' ? 'bg-neutral-900/60 border-transparent' : 'bg-neutral-900/60 border-white/5'}
                ${isGameTheme ? 'border-blue-900 shadow-[2px_2px_0_0_#2121ff]' : ''}
              `}

            >
              {/* 1. Symbol & Name */}
              <div className="flex items-center gap-3 col-span-1">
                {asset.image && (
                  <img src={asset.image} alt="" className={`w-8 h-8 ${isGameTheme ? 'pixelated' : 'rounded-full'}`} style={isGameTheme ? { imageRendering: 'pixelated' } : {}} />
                )}
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-white tracking-tight leading-none">{asset.name}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{asset.symbol}</span>
                </div>
              </div>

              {/* 2. Value (Price) */}
              <div className="text-right font-black text-sm text-white tracking-tight col-span-1">
                {currencySymbol}{formatPrice(asset.current_price)}
              </div>

              {/* 3. 24h Variation */}
              <div className={`text-right text-xs font-black uppercase tracking-widest col-span-1 ${colorClass} ${isPositive ? 'drop-shadow-[0_0_5px_rgba(0,255,163,0.3)]' : 'drop-shadow-[0_0_5px_rgba(255,0,85,0.3)]'}`}>
                {isPositive ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
              </div>

              {/* 4. Line Chart (Sparkline) */}
              <div className="col-span-1 h-8 flex items-center justify-center relative opacity-80">
                <Sparkline data={sparklineData} color={assetColor} />
              </div>

              {/* 5. Quantity */}
              <div className="text-right flex flex-col items-end col-span-1">
                <span className={`text-sm font-bold ${isGameTheme ? 'text-blue-400' : 'text-blue-200'}`}>
                  {privacyMode ? '****' : asset.quantity.toFixed(4)}
                </span>
                <span className="text-[9px] text-white/30 font-bold uppercase">{asset.symbol}</span>
              </div>

              {/* 6. Allocated Value */}
              <div className="text-right font-black text-sm text-white tracking-tight col-span-1">
                {privacyMode ? '****' : `${currencySymbol}${formatPrice(asset.totalValue)}`}
              </div>

              {/* Actions Overlay (Hover) or Fixed? Keep clean first. Actions can be in Detail View or right click context? 
                   User requested specifc columns. I will add a small hover menu or keep actions hidden for now to match the "clean" image look.
                   Actually, let's keep the actions absolute positioned to not break the grid, appearing on hover?
                   Or just remove them as User didn't ask for them in the columns? 
                   I'll add them as a subtle absolute element on the far right.
               */}
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5 backdrop-blur-sm p-1 rounded-xl border border-white/5 ${theme === 'yellow' ? 'bg-black/80 border-transparent' : 'bg-black/40 border-white/5'}`}>
                <button onClick={(e) => { e.stopPropagation(); onAddAlert(asset); }} className={`p-2 rounded-lg transition-all active:scale-95 ${theme === 'yellow' ? 'bg-white/10 text-white/50 hover:bg-black hover:text-cyan-400' : 'bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400'}`} title="Alarmes"><Bell size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(asset); }} className={`p-2 rounded-lg transition-all active:scale-95 ${theme === 'yellow' ? 'bg-white/10 text-white/50 hover:bg-black hover:text-white' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'}`} title="Editar"><PenLine size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }} className={`p-2 rounded-lg transition-all active:scale-95 ${theme === 'yellow' ? 'bg-white/10 text-white/50 hover:bg-black hover:text-red-500' : 'bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500'}`} title="Excluir"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile View (Stacked Cards) */}
      <div className="flex md:hidden flex-col gap-3">
        {data.map((asset) => {
          const isPositive = asset.price_change_percentage_24h >= 0;
          const colorClass = isPositive ? 'text-[#00ffa3]' : 'text-[#ff0055]';
          // Pass ID to make it deterministic
          const sparklineData = asset.sparkline || getSparklineData(asset.price_change_percentage_24h, asset.current_price, asset.id);

          const colorIndex = validAssetsForColor.findIndex(d => d.id === asset.id);
          const assetColor = colorIndex >= 0 ? COLORS[colorIndex % COLORS.length] : '#888888';

          return (
            <div
              key={asset.id}
              onClick={() => onSelect && onSelect(asset)}
              className={`relative flex flex-col p-4 pr-16 rounded-lg border transition-all active:scale-95 cursor-pointer
                ${theme === 'white' ? 'bg-neutral-950 border-transparent' : theme === 'yellow' ? 'bg-neutral-900/60 border-transparent' : 'bg-neutral-900/60 border-white/5'}
                ${isGameTheme ? 'border-blue-900 shadow-[2px_2px_0_0_#2121ff]' : ''}
              `}
            >
              {/* Header: Icon, Name, Price */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {asset.image && (
                    <img src={asset.image} alt="" className={`w-10 h-10 ${isGameTheme ? 'pixelated' : 'rounded-full'}`} style={isGameTheme ? { imageRendering: 'pixelated' } : {}} />
                  )}
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

              {/* Middle: Sparkline - REMOVED for Mobile */}
              {/* <div className="h-12 w-full relative opacity-80 my-2">
                <Sparkline data={sparklineData} color={assetColor} />
              </div> */}

              {/* Bottom: Holdings & Value */}
              <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/30 font-bold uppercase mb-0.5">Holdings</span>
                  <span className={`text-xs font-bold ${isGameTheme ? 'text-blue-400' : 'text-blue-200'}`}>
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

              {/* Mobile Actions (Absolute Right) */}
              <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-2 bg-black/20 backdrop-blur-[2px] px-1.5 rounded-r-lg border-l border-white/5">
                <button
                  onClick={(e) => { e.stopPropagation(); onAddAlert(asset); }}
                  className="p-2.5 bg-white/5 rounded-xl text-white/30 hover:text-cyan-400 hover:bg-cyan-500/20 active:scale-90 transition-all"
                >
                  <Bell size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                  className="p-2.5 bg-white/5 rounded-xl text-white/30 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                >
                  <PenLine size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(asset.id); }}
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

// Simple Sparkline Component
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  // Generate Path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      {/* Gradient Defs */}
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
