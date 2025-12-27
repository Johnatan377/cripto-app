
import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Trash2, ChevronDown, ChevronUp, Lock, CloudDownload, CloudUpload, Zap } from 'lucide-react';
import { UserTier } from '../types';
import { supabase } from '../services/supabaseClient';

interface AllocationEntry {
  id: string;
  destino: string;
  moeda: string;
  quantidade: string;
  protocolo: string;
  wallet: string;
}

interface ControlCriptoViewProps {
  userTier: UserTier;
  onUpgradeRequest: () => void;
}

const CATEGORIES = [
  { name: 'DEX Perpétuos', color: '#00FFFF' }, // Ciano Neon
  { name: 'Exchange', color: '#FFB852' },    // Laranja Fantasma
  { name: 'DeFi de Stable', color: '#FFFF00' }, // Amarelo Pac
  { name: 'Empréstimos', color: '#FFB8FF' },    // Rosa Fantasma
  { name: 'Pool de Liquidez', color: '#2121ff' }, // Azul Labirinto
  { name: 'Projeto de Airdrop', color: '#00FF00' }, // Verde Sucesso
  { name: 'Prediction Market', color: '#FF0000' }, // Vermelho Fantasma
  { name: 'Outros..', color: '#94a3b8' },
];

const ControlCriptoView: React.FC<ControlCriptoViewProps> = ({ userTier, onUpgradeRequest }) => {
  const [entries, setEntries] = useState<AllocationEntry[]>([]);
  const [syncing, setSyncing] = useState(false);

  // 1. Carregar dados (Local -> Nuvem)
  useEffect(() => {
    const loadData = async () => {
      // Primeiro tenta Local
      const saved = localStorage.getItem('control_cripto_entries');
      let initialData: AllocationEntry[] = [];
      if (saved) {
        try { initialData = JSON.parse(saved); } catch (e) { console.error(e); }
      }

      // Se houver usuário, tenta Nuvem para "Recuperar" o que sumiu
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSyncing(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('strategies_json')
          .single();
        
        if (!error && data?.strategies_json) {
          // Se os dados da nuvem forem diferentes/mais recentes, recuperamos eles
          initialData = data.strategies_json;
        }
        setSyncing(false);
      }

      if (initialData.length === 0) {
        initialData = [{ id: '1', destino: 'DeFi de Stable', moeda: 'ETH/USDC', quantidade: '2.50', protocolo: 'PENDLE', wallet: '0x000...ENDEREÇO' }];
      }
      setEntries(initialData);
    };

    loadData();
  }, []);

  // 2. Salvar dados (Local + Nuvem)
  useEffect(() => {
    if (entries.length === 0) return;
    
    localStorage.setItem('control_cripto_entries', JSON.stringify(entries));

    const syncToCloud = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            strategies_json: entries,
            updated_at: new Date().toISOString()
          });
      }
    };
    
    const timeout = setTimeout(syncToCloud, 2000); // Debounce de 2s para não sobrecarregar
    return () => clearTimeout(timeout);
  }, [entries]);

  const addEntry = () => {
    if (userTier === 'free' && entries.length >= 3) {
      onUpgradeRequest();
      return;
    }

    const newEntry: AllocationEntry = {
      id: Math.random().toString(36).substr(2, 9),
      destino: 'DEX Perpétuos',
      moeda: '',
      quantidade: '',
      protocolo: '',
      wallet: ''
    };
    setEntries(prev => [...prev, newEntry]);
    setTimeout(() => handleScroll('down', 500), 100);
  };

  const updateEntry = (id: string, field: keyof AllocationEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleScroll = (direction: 'up' | 'down', amount: number = 250) => {
    const container = document.querySelector('.custom-scrollbar');
    if (container) container.scrollBy({ top: direction === 'up' ? -amount : amount, behavior: 'smooth' });
  };

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => counts[cat.name] = 0);
    entries.forEach(e => { if (counts[e.destino] !== undefined) counts[e.destino] += 1; });
    const result = CATEGORIES.map(cat => ({ name: cat.name, value: counts[cat.name] || 0, color: cat.color })).filter(c => c.value > 0);
    return result.length > 0 ? result : [{ name: 'Vazio', value: 1, color: '#1a1a1a' }];
  }, [entries]);

  const getCategoryColor = (name: string) => CATEGORIES.find(c => c.name === name)?.color || '#ffffff';

  return (
    <div className="flex-1 flex flex-col items-center w-full animate-in fade-in duration-700 pb-20 bg-black/40 min-h-full relative font-arcade">
      
      {/* Indicador de Sincronismo */}
      {syncing && (
        <div className="fixed top-24 right-4 z-[70] flex items-center gap-2 text-[6px] text-cyan-400 animate-pulse">
          <CloudDownload size={10} /> RECUPERANDO DADOS...
        </div>
      )}

      {/* Botões de Rolagem */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-3 pointer-events-none">
        <button onClick={() => handleScroll('up')} className="w-10 h-10 bg-black/80 border-2 border-blue-600 rounded-lg flex items-center justify-center text-yellow-400 pointer-events-auto shadow-[0_0_10px_rgba(33,33,255,0.5)]"><ChevronUp size={20} /></button>
        <button onClick={() => handleScroll('down')} className="w-10 h-10 bg-black/80 border-2 border-blue-600 rounded-lg flex items-center justify-center text-yellow-400 pointer-events-auto shadow-[0_0_10px_rgba(33,33,255,0.5)]"><ChevronDown size={20} /></button>
      </div>

      <div className="text-center mb-2 shrink-0 pt-4">
        <h2 className="text-[12px] font-black uppercase tracking-tighter text-yellow-400 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]">ESTRATÉGIAS</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            {userTier === 'free' && (
                <span className="flex items-center gap-1 text-[6px] font-black bg-pink-500/20 text-pink-500 border border-pink-500/40 px-2 py-0.5 rounded uppercase">
                    <Lock size={8} /> SLOTS: {entries.length}/3
                </span>
            )}
        </div>
      </div>

      {/* Gráfico Arcade */}
      <div className="w-full h-[220px] relative mb-4 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
              {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-white/30 uppercase">MISÕES</span>
            <span className="text-xl font-black text-white drop-shadow-[0_0_8px_white]">{entries.length}</span>
          </div>
        </div>
      </div>

      {/* Cabeçalho Ativo */}
      <div className="w-full flex items-center justify-between px-4 mb-4 shrink-0 sticky top-0 z-20 py-3 bg-black/90 border-b-2 border-blue-600">
        <span className="text-[8px] font-black uppercase text-cyan-400">INPUT PROTOCOLO</span>
        <button 
          onClick={addEntry}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${userTier === 'free' && entries.length >= 3 ? 'bg-neutral-800 text-white/20' : 'bg-yellow-400 text-black shadow-[4px_4px_0_0_#2121ff] active:translate-y-1 active:shadow-none'}`}
        >
          <Plus size={20} strokeWidth={4} />
        </button>
      </div>

      {/* Lista de Alocações Estilo Retro */}
      <div className="w-full space-y-6 px-4 flex-1">
        {entries.map((item) => (
          <div 
            key={item.id} 
            className="relative p-4 bg-black/60 rounded-xl border-2 transition-all duration-300"
            style={{ borderColor: getCategoryColor(item.destino) }}
          >
            <div className="grid grid-cols-[1.2fr_1fr] gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[6px] text-white/40 uppercase">TIPO MISSÃO</span>
                <div className="relative">
                  <select 
                      value={item.destino}
                      onChange={(e) => updateEntry(item.id, 'destino', e.target.value)}
                      className="w-full bg-transparent text-[8px] font-black uppercase outline-none appearance-none"
                      style={{ color: getCategoryColor(item.destino) }}
                  >
                      {CATEGORIES.map(cat => <option key={cat.name} value={cat.name} className="bg-neutral-900 text-white">{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[6px] text-white/40 uppercase text-right">MOEDA</span>
                <input 
                    type="text" 
                    placeholder="BTC"
                    value={item.moeda}
                    onChange={(e) => updateEntry(item.id, 'moeda', e.target.value)}
                    className="w-full bg-blue-900/20 border-b border-blue-600 text-[8px] font-black text-yellow-400 text-right outline-none uppercase placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-[0.8fr_1.2fr_0.3fr] gap-2 items-end">
               <div className="flex flex-col gap-1">
                  <span className="text-[6px] text-white/40 uppercase">QUANT</span>
                  <input 
                      type="text" 
                      placeholder="0.00"
                      value={item.quantidade}
                      onChange={(e) => updateEntry(item.id, 'quantidade', e.target.value)}
                      className="w-full bg-blue-900/20 border-b border-blue-600 text-[8px] font-black text-white outline-none placeholder:text-white/10"
                  />
               </div>
               
               <div className="flex flex-col gap-1">
                  <span className="text-[6px] text-white/40 uppercase">PROTOCOLO</span>
                  <input 
                      type="text" 
                      placeholder="NAME"
                      value={item.protocolo}
                      onChange={(e) => updateEntry(item.id, 'protocolo', e.target.value)}
                      className="w-full bg-blue-900/20 border-b border-blue-600 text-[8px] font-black text-cyan-400 outline-none uppercase placeholder:text-white/10"
                  />
               </div>

               <button 
                  onClick={() => removeEntry(item.id)}
                  className="flex items-center justify-center p-2 text-pink-500/40 hover:text-pink-500 transition-colors"
               >
                  <Trash2 size={14} />
               </button>
            </div>
            
            <div className="mt-4 pt-2 border-t border-white/5">
                <span className="text-[5px] text-white/20 uppercase block mb-1">ENDEREÇO DA WALLET</span>
                <input 
                    type="text" 
                    placeholder="0x..."
                    value={item.wallet}
                    onChange={(e) => updateEntry(item.id, 'wallet', e.target.value)}
                    className="w-full bg-transparent text-[6px] font-mono text-white/30 outline-none truncate"
                />
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-xl">
            <p className="text-[8px] font-black uppercase text-white/20">SEM DADOS RECUPERADOS</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-900/10 border border-blue-600/20 rounded-xl w-full max-w-[340px] mb-20">
        <p className="text-[6px] font-black text-cyan-400/60 uppercase text-center leading-relaxed">
          DADOS SINCRONIZADOS COM A NUVEM VIA SUPABASE.<br/>
          PLAYER: {supabase.auth.getUser() ? 'LOGADO' : 'GUEST'}
        </p>
      </div>
    </div>
  );
};

export default ControlCriptoView;
