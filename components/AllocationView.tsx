import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Asset } from '../types';

interface AllocationViewProps {
  assets: Asset[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const AllocationView: React.FC<AllocationViewProps> = ({ assets }) => {
  const data = assets.map(a => ({
    name: a.symbol,
    value: a.amount * a.currentPrice
  })).filter(d => d.value > 0);

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Asset Allocation</h2>

      <div className="bg-crypto-card border border-white/5 rounded-3xl p-6 h-[400px] flex flex-col items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-crypto-muted text-xs uppercase tracking-wider">Total</p>
            <p className="text-white font-bold text-lg">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.sort((a, b) => b.value - a.value).map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
              <span className="font-medium text-white">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="block text-white font-mono">${item.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              <span className="text-xs text-crypto-muted">{((item.value / totalValue) * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocationView;
