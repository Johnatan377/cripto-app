import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Save, ChevronDown, Coins, Zap, Target, Globe, Wallet, Trash2, LayoutGrid, X, FileText, Terminal, Activity, ChevronRight, Plus, PenLine, Minus } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { MissionLog } from '../types';

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}



const CATEGORIES: AllocationItem[] = [
  { name: 'Pool de Liquidez', value: 0, color: '#d946ef' }, // Neon Purple
  { name: 'Empréstimo', value: 0, color: '#facc15' },      // Neon Yellow
  { name: 'DeFi de Stable', value: 0, color: '#06b6d4' },  // Neon Cyan
  { name: 'Staker', value: 0, color: '#22c55e' },         // Neon Green
  { name: 'Corretoras', value: 0, color: '#ec4899' },     // Neon Pink
  { name: 'Protocolos da Airdrop', value: 0, color: '#3b82f6' }, // Bright Blue
  { name: 'Prediction Market', value: 0, color: '#f97316' }, // Neon Orange
  { name: 'PerpDex', value: 0, color: '#ef4444' },          // Red
  { name: 'Outros', value: 0, color: '#94a3b8' },         // Slate
];

const AllocationTypeView: React.FC<{
  totalBalance: number;
  currencySymbol: string;
  privacyMode: boolean;
  onCountChange?: (count: number) => void;
  onLimitReached?: () => void;
  isPremium?: boolean;
  onLogsChange?: (logs: MissionLog[]) => void;
  externalLogs?: MissionLog[];
  language?: 'pt' | 'en';
}> = ({ totalBalance, currencySymbol, privacyMode, onCountChange, onLimitReached, isPremium = false, onLogsChange, externalLogs, language = 'pt' }) => {
  const t = TRANSLATIONS[language].allocation;
  const g = TRANSLATIONS[language].general;

  const [categoria, setCategoria] = useState("");
  const [moeda, setMoeda] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [moeda2, setMoeda2] = useState("");
  const [quantidade2, setQuantidade2] = useState("");
  const [nomeProtocolo, setNomeProtocolo] = useState("");
  const [protocolUrl, setProtocolUrl] = useState("");
  const [wallet, setWallet] = useState("");

  const logs = useMemo(() => externalLogs || [], [externalLogs]);

  const [selectedLog, setSelectedLog] = useState<MissionLog | null>(null);

  const [editingLog, setEditingLog] = useState<MissionLog | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editQty2, setEditQty2] = useState("");
  const [isFormMinimized, setIsFormMinimized] = useState(false);

  // Notify parent of count changes for UI badges
  useEffect(() => {
    if (onCountChange) onCountChange(logs.length);
  }, [logs.length, onCountChange]);

  const handleParse = (val: string): number => {
    if (!val) return 0;
    let cleaned = val.trim().replace(/\s/g, '');
    if (cleaned.includes('.') && cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.');
    } else if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts[parts.length - 1].length === 3) cleaned = cleaned.replace(/\./g, '');
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const openEdit = (e: React.MouseEvent, log: MissionLog) => {
    e.stopPropagation();
    setEditingLog(log);
    setEditQty(log.quantidade.toString());
    setEditQty2(log.quantidade2?.toString() || "");
  };

  const saveEdit = () => {
    if (!editingLog || !onLogsChange) return;

    const updatedLog: MissionLog = {
      ...editingLog,
      quantidade: handleParse(editQty) || 0,
      quantidade2: editQty2 ? (handleParse(editQty2) || 0) : undefined
    };

    const newLogs = logs.map(l => l.id === editingLog.id ? updatedLog : l);
    onLogsChange(newLogs);

    if (selectedLog && selectedLog.id === editingLog.id) {
      setSelectedLog(updatedLog);
    }

    setEditingLog(null);
  };

  // Nova lógica do gráfico: Cada log = 1 fatia igual
  const chartData = useMemo(() => {
    if (logs.length === 0) return [{ name: 'Vazio', value: 1, color: '#1a1a1a' }];

    return logs.map(log => ({
      name: log.nomeProtocolo,
      value: 1, // Cada missão vale 1 unidade de tamanho no gráfico
      color: log.color
    }));
  }, [logs]);

  const handleSave = () => {
    try {
      // Limit Removed
      // if (!isPremium && logs.length >= 3) {
      //   if (onLimitReached) onLimitReached();
      //   return;
      // }

      if (!categoria || !moeda || !quantidade || !nomeProtocolo || !wallet) {
        alert(language === 'pt' ? "Preencha todos os campos, incluindo a CARTEIRA CONECTADA." : "Please fill all fields, including the CONNECTED WALLET.");
        return;
      }

      const isPool = categoria === 'Pool de Liquidez' || categoria === 'Empréstimo';
      const categoryData = CATEGORIES.find(c => c.name === categoria);

      const newLog: MissionLog = {
        id: Math.random().toString(36).substr(2, 9),
        categoria,
        moeda,
        quantidade: handleParse(quantidade) || 0,
        moeda2: isPool ? moeda2 : undefined,
        quantidade2: isPool ? (handleParse(quantidade2) || 0) : undefined,
        nomeProtocolo,
        protocolUrl,
        wallet,
        color: categoryData?.color || '#fff'
      };

      if (onLogsChange) {
        onLogsChange([newLog, ...logs]);
      }

      setCategoria("");
      setMoeda("");
      setQuantidade("");
      setMoeda2("");
      setQuantidade2("");
      setNomeProtocolo("");
      setProtocolUrl("");
      setWallet("");
      setIsFormMinimized(false);
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
      console.error(error);
    }
  };

  const removeLog = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onLogsChange) {
      onLogsChange(logs.filter(log => log.id !== id));
    }
    if (selectedLog?.id === id) setSelectedLog(null);
  };

  const isPoolSelected = categoria === 'Pool de Liquidez' || categoria === 'Empréstimo';

  return (
    <div className="bg-black min-h-[calc(100vh-160px)] -mx-4 -mt-4 px-4 pt-8 pb-32 animate-in fade-in duration-500 relative z-10 overflow-x-hidden">

      <div className="text-center mb-8">
        <h2 className="text-sm font-black uppercase text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,0,0.6)] tracking-tighter md:hidden">{t.title}</h2>
        <div className="h-0.5 w-12 bg-blue-600 mx-auto mt-2 shadow-[0_0_10px_#2121ff] md:hidden"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-8 px-4">
        {/* Gráfico de Missões - Contador Numérico */}
        <div className="w-full h-96 relative flex items-center justify-center bg-zinc-950/30 rounded-[40px] border-2 border-zinc-900 shadow-inner p-2 overflow-hidden mb-0 md:col-start-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={110}
                outerRadius={160}
                paddingAngle={chartData.length > 1 ? 5 : 0}
                cornerRadius={6}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-black text-white/10 uppercase mb-2 tracking-[0.3em]">{t.total_missions}</span>
            <span className="text-6xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              {logs.length}
            </span>
          </div>
        </div>



        {/* Left Column: Form */}
        <div className="w-full md:w-auto shrink-0 md:col-start-1 md:row-start-1 md:row-span-2">
          <div className="flex items-center justify-between mb-4 border-l-4 border-cyan-400 pl-3">
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest">{t.register_entry}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFormMinimized(true)}
                className={`p-1 rounded bg-black border border-blue-900 transition-all ${isFormMinimized ? 'text-blue-400 border-blue-400' : 'text-white/20'}`}
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setIsFormMinimized(false)}
                className={`p-1 rounded bg-black border border-blue-900 transition-all ${!isFormMinimized ? 'text-blue-400 border-blue-400' : 'text-white/20'}`}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/40 border-2 border-blue-600 rounded-[32px] p-6 space-y-5 shadow-[0_0_30px_rgba(33,33,255,0.15)] sticky top-24">
            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <Target size={14} className="text-white/60" />
                <label className="text-xs font-bold text-white uppercase">{t.choose_type}</label>
              </div>
              <div className="relative">
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-black/80 border-2 border-zinc-800 rounded-2xl p-4 text-base font-bold text-white outline-none appearance-none focus:border-white transition-all"
                >
                  <option value="" disabled className="bg-zinc-900 text-white">{t.select}</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name} className="bg-zinc-900 text-white">
                      {t.categories[cat.name] || cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                  <ChevronDown size={16} strokeWidth={3} />
                </div>
              </div>
            </div>

            {!isFormMinimized && (
              <div className="animate-in slide-in-from-top-4 duration-500 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                      <Coins size={14} className="text-white/60" />
                      <label className="text-xs font-bold text-white uppercase">
                        {categoria === 'Empréstimo' ? 'LEND' : (isPoolSelected ? 'Moeda A' : 'Moeda')}
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="EX: BTC"
                      value={moeda}
                      onChange={(e) => setMoeda(e.target.value.toUpperCase())}
                      className="w-full bg-black/50 border-b-2 border-zinc-800 p-3 text-base font-bold text-white outline-none focus:border-white transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-end mr-1">
                      <label className="text-xs font-bold text-white uppercase">{g.quantity.substring(0, 5)}.</label>
                      <Zap size={14} className="text-white/60" />
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      className="w-full bg-black/50 border-b-2 border-zinc-800 p-3 text-base font-bold text-white outline-none text-right focus:border-white transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {isPoolSelected && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 ml-1">
                        <Coins size={14} className="text-white/60" />
                        <label className="text-xs font-bold text-white uppercase">
                          {categoria === 'Empréstimo' ? 'BORROW' : 'Moeda B (Opcional)'}
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="EX: ETH"
                        value={moeda2}
                        onChange={(e) => setMoeda2(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border-b-2 border-zinc-800 p-3 text-base font-bold text-white outline-none focus:border-white transition-all placeholder:text-zinc-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-end mr-1">
                        <label className="text-xs font-bold text-white uppercase">{g.quantity.substring(0, 5)}.</label>
                        <Plus size={14} className="text-white/60" />
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={quantidade2}
                        onChange={(e) => setQuantidade2(e.target.value)}
                        className="w-full bg-black/50 border-b-2 border-zinc-800 p-3 text-base font-bold text-white outline-none text-right focus:border-white transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                      <Globe size={14} className="text-white/60" />
                      <label className="text-xs font-bold text-white uppercase">{t.protocol_name}</label>
                    </div>
                    <input
                      type="text"
                      placeholder="EX: UNISWAP V3"
                      value={nomeProtocolo}
                      onChange={(e) => setNomeProtocolo(e.target.value.toUpperCase())}
                      className="w-full bg-black/30 border-2 border-zinc-800 rounded-xl p-3 text-base font-bold text-white outline-none focus:border-white transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                      <Terminal size={14} className="text-white/60" />
                      <label className="text-xs font-bold text-white uppercase">{t.protocol_url}</label>
                    </div>
                    <input
                      type="text"
                      placeholder="EX: HTTPS://UNISWAP.ORG"
                      value={protocolUrl}
                      onChange={(e) => setProtocolUrl(e.target.value)}
                      className="w-full bg-black/30 border-2 border-zinc-800 rounded-xl p-3 text-sm font-bold text-cyan-400 outline-none focus:border-cyan-400 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                      <Wallet size={14} className="text-white/60" />
                      <label className="text-xs font-bold text-white uppercase">{t.connected_wallet}</label>
                    </div>
                    <input
                      type="text"
                      placeholder="0x... / METAMASK"
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      className="w-full bg-black/30 border-2 border-zinc-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-white transition-all placeholder:text-zinc-600 truncate"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!categoria || !moeda || !quantidade || !nomeProtocolo || !wallet}
                  className="w-full py-5 mt-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 font-bold text-sm uppercase rounded-2xl shadow-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                >
                  {t.confirm_deposit}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mission Inventory (Grid) */}
        <div className="flex-1 md:col-start-2">
          <div className="flex items-center justify-between mb-4 border-l-4 border-yellow-400 pl-3 pr-2">
            <h3 className="text-[10px] font-black uppercase text-white tracking-widest">{t.mission_inventory}</h3>
            <span className="text-[8px] font-black text-yellow-400/50 uppercase">{logs.length} {t.slots}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logs.length === 0 ? (
              <div className="col-span-full py-12 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 opacity-30">
                <LayoutGrid size={24} className="text-white" />
                <p className="text-[6px] font-black text-white uppercase tracking-widest">{t.no_active_missions}</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="relative bg-zinc-950 border-l-8 rounded-xl p-4 shadow-[4px_4px_15px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300 overflow-hidden cursor-pointer active:scale-95 transition-transform h-full flex flex-col justify-between"
                  style={{ borderLeftColor: log.color, borderRight: `1px solid ${log.color}20`, borderTop: `1px solid ${log.color}20`, borderBottom: `1px solid ${log.color}20` }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.05] rounded-full blur-2xl" style={{ backgroundColor: log.color }}></div>

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm inline-block w-fit text-black truncate max-w-full" style={{ backgroundColor: log.color }}>
                          {t.categories[log.categoria] || log.categoria}
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight truncate w-full" title={log.nomeProtocolo}>{log.nomeProtocolo}</h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => openEdit(e, log)}
                          className="p-1.5 text-yellow-500 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-all"
                          title="Editar Quantidade"
                        >
                          <PenLine size={14} />
                        </button>
                        <button
                          onClick={(e) => removeLog(e, log.id)}
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                          title="Excluir Alocação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t.asset_qty}</span>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-black text-yellow-400 uppercase">{log.moeda}</span>
                            <span className="text-[10px] font-black text-white">{log.quantidade}</span>
                          </div>
                          {log.moeda2 && (
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] font-black text-green-400 uppercase">{log.moeda2}</span>
                              <span className="text-[10px] font-black text-white">{log.quantidade2}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 items-end mt-4 pt-2 border-t border-white/5">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{t.link_address}</span>
                    <span className="text-[8px] font-mono text-cyan-400 truncate w-full text-right" title={log.wallet}>
                      {log.wallet.length > 8 ? `${log.wallet.substring(0, 4)}...${log.wallet.substring(log.wallet.length - 4)}` : log.wallet}
                    </span>
                  </div>

                  <div className="absolute bottom-0 right-0 w-2 h-2" style={{ borderRight: `2px solid ${log.color}`, borderBottom: `2px solid ${log.color}` }}></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {
        selectedLog && createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md bg-black/60">
            <div className="absolute inset-0" onClick={() => setSelectedLog(null)}></div>

            <div
              className="relative w-full max-w-sm bg-zinc-900 border-4 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-20 duration-500"
              style={{ borderColor: selectedLog.color }}
            >
              <div className="flex items-center justify-between p-4 border-b-4 bg-black/40" style={{ borderColor: `${selectedLog.color}40` }}>
                <div className="flex items-center gap-2">
                  <Terminal size={14} style={{ color: selectedLog.color }} className="animate-pulse" />
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">MISSON_DATA.BIN</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedLog(null); }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              <div className="p-6 space-y-8 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] overflow-y-auto max-h-[70vh] custom-scrollbar">

                <div className="space-y-2 animate-in slide-in-from-left duration-300 delay-100">
                  <div className="flex items-center gap-2 text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <Zap size={10} className="text-pink-500" /> {(selectedLog.categoria === 'Pool de Liquidez' || selectedLog.categoria === 'Empréstimo') ? 'Dual Load Detected' : 'Load Detected'}
                  </div>
                  <div className="bg-black/50 p-4 rounded-2xl border-2 border-dashed space-y-3" style={{ borderColor: `${selectedLog.color}40` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white tracking-widest">{selectedLog.quantidade}</span>
                        <span className="text-lg font-black text-yellow-400 uppercase">{selectedLog.moeda}</span>
                        {selectedLog.categoria === 'Empréstimo' && <span className="text-[10px] font-black text-yellow-400/50 uppercase ml-2">LEND</span>}
                      </div>
                      <button onClick={(e) => openEdit(e, selectedLog)} className="p-2 bg-yellow-400/10 rounded-lg text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all" title="Editar Quantidade"><PenLine size={18} /></button>
                    </div>
                    {selectedLog.moeda2 && (
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-white tracking-widest">{selectedLog.quantidade2}</span>
                          <span className="text-lg font-black text-green-400 uppercase">{selectedLog.moeda2}</span>
                          {selectedLog.categoria === 'Empréstimo' && <span className="text-[10px] font-black text-green-400/50 uppercase ml-2">BORROW</span>}
                        </div>
                        <button onClick={(e) => openEdit(e, selectedLog)} className="p-2 bg-green-400/10 rounded-lg text-green-400 hover:bg-green-400 hover:text-black transition-all" title="Editar Quantidade"><PenLine size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 animate-in slide-in-from-right duration-300 delay-200">
                  <div className="flex items-center gap-2 text-[6px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <Target size={10} className="text-blue-400" /> Allocated Inside:
                  </div>
                  <div
                    className="bg-white/5 p-4 rounded-2xl border-l-4 flex items-center justify-between group transition-all"
                    style={{ borderLeftColor: selectedLog.color }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-black rounded-lg group-hover:rotate-12 transition-transform">
                        <Globe size={20} style={{ color: selectedLog.color }} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-white uppercase tracking-tighter">{selectedLog.nomeProtocolo}</span>
                        {selectedLog.protocolUrl && (
                          <span className="text-[8px] font-bold text-cyan-400/60 lowercase tracking-tight">
                            {selectedLog.protocolUrl.replace(/^https?:\/\//, '')}
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedLog.protocolUrl && (
                      <button
                        onClick={() => window.open(selectedLog.protocolUrl.startsWith('http') ? selectedLog.protocolUrl : `https://${selectedLog.protocolUrl}`, '_blank')}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-[9px] font-black text-white uppercase rounded-xl border border-white/10 transition-all active:scale-95 flex items-center gap-2 shrink-0 ml-2"
                      >
                        {t.go_to_site} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 animate-in slide-in-from-left duration-300 delay-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                      <Wallet size={10} className="text-cyan-400" /> {t.connected_wallet}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLog.wallet);
                          const btn = document.getElementById('copy-btn');
                          if (btn) btn.innerHTML = 'COPIED!';
                          setTimeout(() => { if (btn) btn.innerHTML = 'COPY'; }, 2000);
                        }}
                        className="text-[8px] font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-widest"
                        id="copy-btn"
                      >
                        COPY
                      </button>
                      <div className="w-1 h-1 rounded-full bg-white/20"></div>
                      <button
                        onClick={() => window.open(`https://etherscan.io/address/${selectedLog.wallet}`, '_blank')}
                        className="text-[8px] font-black text-white/40 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                      >
                        EXPLORER
                      </button>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-cyan-400/30 flex items-center gap-4 overflow-hidden">
                      <div className="p-3 bg-cyan-400/10 rounded-xl border border-cyan-400/20 group-hover:scale-110 transition-transform">
                        <Wallet size={20} className="text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-mono font-bold text-white break-all leading-relaxed tracking-wider">
                          {selectedLog.wallet}
                        </p>
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-white/5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-black rounded-full border border-white/10">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-ping"></div>
                    <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">{t.sector}: {t.categories[selectedLog.categoria] || selectedLog.categoria}</span>
                  </div>
                  <p className="text-[6px] font-black text-white/10 uppercase leading-loose tracking-widest text-center">
                    {t.system_report} <br />
                    {new Date().toLocaleDateString()} @ {new Date().toLocaleTimeString()}
                  </p>

                  <button
                    onClick={(e) => removeLog(e, selectedLog.id)}
                    className="w-full py-3 bg-red-500/10 border border-red-500/50 text-red-500 font-black text-[8px] uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={12} /> {t.delete_record}
                  </button>
                </div>
              </div>

              <div className="h-4 w-full flex bg-zinc-950">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex-1 h-full flex flex-col items-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 opacity-50"></div>
                    <div className="flex-1 w-full border-r border-white/5"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )
      }

      <div className="mt-20 px-6 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
        <p className="text-[6px] font-black text-white/10 uppercase leading-loose tracking-[0.2em]">
          {t.retro_system} <br />
          {t.operational}
        </p>
      </div>

      {
        editingLog && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setEditingLog(null)}></div>
            <div className="relative w-full max-w-xs bg-zinc-900 border-2 border-yellow-400 rounded-2xl p-6 shadow-[0_0_30px_rgba(250,204,21,0.3)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{t.edit_qty}</h3>
                <button onClick={() => setEditingLog(null)}><X size={16} className="text-white/40" /></button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[6px] font-black text-white/40 uppercase ml-1">{g.quantity} ({editingLog.moeda})</label>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none focus:border-yellow-400 transition-all text-center"
                    autoFocus
                  />
                </div>

                {editingLog.moeda2 && (
                  <div className="space-y-1">
                    <label className="text-[6px] font-black text-white/40 uppercase ml-1">{g.quantity} ({editingLog.moeda2})</label>
                    <input
                      type="number"
                      value={editQty2}
                      onChange={(e) => setEditQty2(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none focus:border-green-400 transition-all text-center"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={saveEdit}
                className="w-full py-3 bg-yellow-400 text-black font-black text-[9px] uppercase rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                {g.save_changes}
              </button>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default AllocationTypeView;
