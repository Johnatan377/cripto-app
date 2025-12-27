import React from 'react';
// Added Zap to the lucide-react icon imports
import { BarChart3, TrendingUp, LineChart, History, Zap } from 'lucide-react';

const AdvancedChartsView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center w-full animate-in fade-in duration-700 pb-20 font-arcade pt-4">
      <div className="text-center mb-8">
        <h2 className="text-[12px] font-black uppercase tracking-tighter text-yellow-400 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]">ANÁLISE AVANÇADA</h2>
        <div className="h-1 w-16 bg-blue-600 mx-auto mt-2"></div>
      </div>

      {/* Placeholder para Gráfico de Candlestick ou Linha */}
      <div className="w-full h-64 bg-black/60 border-2 border-blue-600 rounded-2xl relative flex items-center justify-center overflow-hidden mb-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
          backgroundImage: 'linear-gradient(#2121ff 1px, transparent 1px), linear-gradient(90deg, #2121ff 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="p-4 bg-blue-600/20 rounded-full animate-pulse">
            <LineChart size={40} className="text-cyan-400" />
          </div>
          <p className="text-[8px] font-black text-white/40 uppercase text-center tracking-widest px-8 leading-relaxed">
            Área Reservada para<br/>Gráficos de Preço
          </p>
        </div>

        {/* Efeito Neon nos Cantos */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400"></div>
      </div>

      {/* Grid de Métricas Vazias */}
      <div className="grid grid-cols-2 gap-4 w-full px-2">
        <div className="p-4 bg-black/40 border-2 border-blue-900 rounded-xl flex flex-col items-center gap-2">
          <TrendingUp size={16} className="text-green-400" />
          <span className="text-[6px] text-white/30 uppercase">Volatilidade</span>
          <span className="text-[10px] font-black text-white">-- %</span>
        </div>
        <div className="p-4 bg-black/40 border-2 border-blue-900 rounded-xl flex flex-col items-center gap-2">
          <History size={16} className="text-cyan-400" />
          <span className="text-[6px] text-white/30 uppercase">Histórico</span>
          <span className="text-[10px] font-black text-white">-- D</span>
        </div>
      </div>

      <div className="mt-12 p-6 border-2 border-dashed border-white/10 rounded-2xl w-full flex flex-col items-center gap-4">
        <div className="text-pink-500 animate-bounce">
          {/* Fix: Using the Zap icon imported from lucide-react */}
          <Zap size={24} fill="currentColor" />
        </div>
        <p className="text-[7px] font-black text-white/20 uppercase text-center leading-relaxed px-4">
          EM BREVE:<br/>
          Integração com TradingView<br/>
          & Dados On-chain em tempo real.
        </p>
      </div>
      
      <div className="mt-auto pt-10">
        <span className="text-[6px] font-black text-yellow-400/20 uppercase animate-pulse">Waiting for market data...</span>
      </div>
    </div>
  );
};

export default AdvancedChartsView;