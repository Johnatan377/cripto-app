
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PortfolioData, AppTheme } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { COLORS } from '../constants';

interface PortfolioPieChartProps {
  data: PortfolioData[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  currency: 'usd' | 'brl' | 'eur';
  btcPrice?: number;
  theme: AppTheme;
  privacyMode: boolean;
  displayInBTC: boolean;
  onToggleBTC: () => void;
  large?: boolean;
}

const PortfolioPieChart: React.FC<PortfolioPieChartProps> = ({
  data, totalValue, totalPnL, totalPnLPercentage, currency, btcPrice, theme, privacyMode,
  displayInBTC, onToggleBTC, large = false
}) => {
  const symbol = currency === 'brl' ? 'R$' : currency === 'eur' ? '€' : '$';

  const chartData = data
    .filter(d => d.totalValue > 0)
    .map(d => ({
      name: d.name,
      symbol: d.symbol.toUpperCase(),
      value: d.totalValue,
      allocation: d.allocation,
      id: d.id
    }));

  const displayBalance = React.useMemo(() => {
    if (privacyMode) return '****';
    if (displayInBTC && btcPrice) {
      return `₿ ${(totalValue / btcPrice).toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
    }
    const maxDecimals = totalValue < 1 ? 4 : 2;
    return `${symbol}${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: maxDecimals })}`;
  }, [privacyMode, displayInBTC, btcPrice, totalValue, symbol]);

  const fontSizeClass = React.useMemo(() => {
    const len = displayBalance.length;
    if (len <= 8) return 'md:text-8xl';
    if (len <= 11) return 'md:text-7xl';
    if (len <= 14) return 'md:text-6xl';
    return 'md:text-5xl';
  }, [displayBalance]);

  return (
    <div className="flex flex-col items-center w-full bg-transparent p-2 relative z-20">
      <div className="flex flex-col items-center w-full gap-4">

        <div className={`relative w-[340px] h-[340px] md:w-[780px] md:h-[780px] flex items-center justify-center shrink-0 transition-all duration-500`}>
          <style>
            {`
              .recharts-pie-sector {
                filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.2));
              }
              .recharts-pie-sector:hover {
                filter: drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.5));
                transform: scale(1.02);
                transform-origin: center;
              }
            `}
          </style>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]}
                innerRadius="86%"
                outerRadius="96%"
                paddingAngle={chartData.length > 1 ? 4 : 0}
                dataKey="value"
                stroke="none"
                cornerRadius={8}
                animationBegin={0}
                animationDuration={800}
                startAngle={90}
                endAngle={450}
              >
                {chartData.length > 0 ? (
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                ) : (
                  <Cell fill="#1a1a1a" />
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={onToggleBTC}
              disabled={privacyMode}
              className="w-[78%] h-[78%] md:w-[84%] md:h-[84%] rounded-full bg-black/80 flex flex-col items-center justify-center border-2 border-blue-600 shadow-[0_0_20px_rgba(33,33,255,0.4)] active:scale-95 transition-all outline-none pt-4"
            >
              <div className="flex flex-col items-center justify-center">
                <h2 className={`text-4xl ${fontSizeClass} font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] tracking-tighter leading-none text-center px-1`}>
                  {displayBalance}
                </h2>
              </div>

              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">{displayInBTC ? 'MODO BTC' : 'TOTAL SCORE'}</span>

              <div className={`mt-2 flex items-center gap-1 px-2 py-0.5 rounded-full ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span className="text-sm font-black tracking-tighter drop-shadow-[0_0_5px_rgba(0,0,0,1)]">
                  {privacyMode ? '****' : `${totalPnLPercentage >= 0 ? '+' : ''}${totalPnLPercentage.toFixed(1)}%`}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 w-full px-2 max-w-2xl mt-4">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 bg-black/80 border border-blue-600/50 px-3 py-1.5 rounded-lg shadow-lg">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs font-black text-white uppercase tracking-wide">{item.symbol}</span>
              <span className="text-xs font-bold text-white/50">{item.allocation.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPieChart;
