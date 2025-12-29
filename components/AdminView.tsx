
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    LayoutDashboard, Plus, Trash2, Edit2,
    CheckCircle, X, Search, Mail, User, Clock,
    Loader2, ChevronRight, Save, Globe, Info, Zap, Calendar, Link as LinkIcon,
    Flame, Rocket, Bell, AlertTriangle, ShieldCheck, Heart, Star
} from 'lucide-react';
import { fetchAirdrops, createAirdrop, updateAirdrop, deleteAirdrop } from '../services/airdropService';
import { fetchTickerAnnouncements, createTickerAnnouncement, updateTickerAnnouncement, deleteTickerAnnouncement } from '../services/tickerService';
import { fetchAdminStats, AdminStats } from '../services/adminService';
import { fetchSupportMessages, markMessageAsRead, deleteSupportMessage, sendSupportReply, SupportMessage } from '../services/messageService';
import { AirdropProject, AirdropStep, TickerAnnouncement } from '../types';

import { supabase } from '../services/supabaseClient';

interface AdminViewProps {
    language: 'pt' | 'en';
    userAccount: any;
}

const CATEGORIES = ['DeFi', 'Testnet', 'GameFi', 'L2', 'Stable Coin', 'PerpDex', 'Node', 'Outros'];

const AdminView: React.FC<AdminViewProps> = ({ language, userAccount }) => {
    const [activeTab, setActiveTab] = useState<'airdrops' | 'messages' | 'ticker' | 'stats'>('airdrops');
    const [airdrops, setAirdrops] = useState<AirdropProject[]>([]);

    const [announcements, setAnnouncements] = useState<TickerAnnouncement[]>([]);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadingRef = useRef(true);
    const timeoutRef = useRef<any>(null);
    const abortControllerRef = useRef<AbortController | null>(null);


    // Reply State
    const [replyingTo, setReplyingTo] = useState<SupportMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replyLanguage, setReplyLanguage] = useState<'pt' | 'en'>('pt');


    // Form States
    const [isAirdropModalOpen, setIsAirdropModalOpen] = useState(false);
    const [editingAirdrop, setEditingAirdrop] = useState<AirdropProject | null>(null);
    const [ptSteps, setPtSteps] = useState<AirdropStep[]>([]);
    const [enSteps, setEnSteps] = useState<AirdropStep[]>([]);
    const [stepLanguage, setStepLanguage] = useState<'pt' | 'en'>('pt');

    // Ticker Form State
    const [isTickerModalOpen, setIsTickerModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<TickerAnnouncement | null>(null);
    const [tickerFormData, setTickerFormData] = useState<Partial<TickerAnnouncement>>({
        content_pt: '',
        content_en: '',
        icon: 'zap',
        priority: 0,
        active: true
    });

    const [formData, setFormData] = useState<Partial<AirdropProject>>({
        title_pt: '', title_en: '',
        description_pt: '', description_en: '',
        content_pt: '', content_en: '',
        category: 'DeFi',
        status: 'Active',
        reward_potential: 'Médio',
        image_url: '',
        banner_url: '',
        cost: 'Grátis',
        chain: ''
    });

    useEffect(() => {
        if (editingAirdrop) {
            setFormData(editingAirdrop);

            // Parse PT Steps
            try {
                if (editingAirdrop.content_pt?.trim().startsWith('[')) {
                    setPtSteps(JSON.parse(editingAirdrop.content_pt));
                } else {
                    setPtSteps([]);
                }
            } catch (e) { setPtSteps([]); }

            // Parse EN Steps
            try {
                if (editingAirdrop.content_en?.trim().startsWith('[')) {
                    setEnSteps(JSON.parse(editingAirdrop.content_en));
                } else {
                    setEnSteps([]);
                }
            } catch (e) { setEnSteps([]); }

            setStepLanguage(language);
        } else {
            setFormData({
                title_pt: '', title_en: '',
                description_pt: '', description_en: '',
                content_pt: '', content_en: '',
                category: 'DeFi',
                status: 'Active',
                reward_potential: 'Médio',
                image_url: '',
                banner_url: '',
                cost: 'Grátis',
                chain: ''
            });
            setPtSteps([]);
            setEnSteps([]);
            setStepLanguage(language);
        }
    }, [editingAirdrop, isAirdropModalOpen]);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Delay mounting data fetch by 100ms to allow parent session to stabilize
        const t = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (isMounted) {
            console.log(`[AdminView] Effect triggered by: [Tab: ${activeTab}]`);
            loadData();
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [activeTab, isMounted]);

    const isFetching = useRef(false);

    const loadData = useCallback(async () => {
        if (!userAccount) {
            console.warn("AdminView: No userAccount in props, skipping fetch");
            return;
        }

        if (isFetching.current) {
            console.warn("AdminView: Fetch already in progress, skipping...");
            return;
        }

        console.log(`[AdminView] Starting loadData for [${activeTab}] (User: ${userAccount.email})`);

        isFetching.current = true;
        // Abort previous requests if they exist
        if (abortControllerRef.current) {
            console.log(`AdminView: Aborting previous fetch for [${activeTab}]`);
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        loadingRef.current = true;
        setError(null);

        // Increased Fallback safety timeout (20 seconds) for stability
        timeoutRef.current = setTimeout(() => {
            if (loadingRef.current) {
                console.warn(`AdminView: loadData timeout hit for [${activeTab}]`);
                setLoading(false);
                loadingRef.current = false;
                setError(language === 'pt'
                    ? 'A conexão com o servidor está lenta. Tente recarregar ou verifique sua internet.'
                    : 'Server connection is slow. Try refreshing or check your internet.');
            }
        }, 20000);

        try {
            console.log(`AdminView: Parallel fetching starting...`);

            // Helper to wrap each fetcher with an individual timeout
            const withTimeout = async (promise: Promise<any>, name: string) => {
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Timeout fetching ${name}`)), 15000)
                );
                try {
                    console.log(`AdminView: [Fetcher] ${name} starting...`);
                    const result = await Promise.race([promise, timeout]);
                    console.log(`AdminView: [Fetcher] ${name} done`);
                    return result;
                } catch (e: any) {
                    console.warn(`AdminView: [Fetcher] ${name} failed/timed out:`, e.message);
                    return { data: null, error: e };
                }
            };

            const fetchers = [
                activeTab === 'airdrops' ? withTimeout(supabase.from('airdrops').select('*').order('created_at', { ascending: false }).abortSignal(abortControllerRef.current.signal), 'Airdrops') : Promise.resolve({ data: null }),
                activeTab === 'messages' ? withTimeout(fetchSupportMessages(), 'Messages') : Promise.resolve(null),
                activeTab === 'ticker' ? withTimeout(fetchTickerAnnouncements(), 'Ticker') : Promise.resolve(null),
                withTimeout(fetchAdminStats(), 'Stats')
            ];

            const results = await Promise.allSettled(fetchers);
            console.log("AdminView: Results received:", results.map(r => r.status));

            // 1. Airdrops
            const airdropsResult = results[0];
            if (airdropsResult.status === 'fulfilled' && airdropsResult.value?.data) {
                setAirdrops(airdropsResult.value.data);
                console.log(`AdminView: ${airdropsResult.value.data.length} airdrops loaded`);
            } else if (airdropsResult.status === 'rejected') {
                console.error("Airdrops fetch rejected:", airdropsResult.reason);
            }

            // 2. Messages
            const messagesResult = results[1];
            if (messagesResult.status === 'fulfilled' && messagesResult.value) {
                setMessages(messagesResult.value);
            }

            // 3. Ticker
            const tickerResult = results[2];
            if (tickerResult.status === 'fulfilled' && tickerResult.value) {
                setAnnouncements(tickerResult.value);
            }

            // 4. Stats
            const statsResult = results[3];
            if (statsResult.status === 'fulfilled' && statsResult.value) {
                setStats(statsResult.value);
            }


        } catch (err: any) {
            console.error('AdminView: Global error in loadData:', err);
            setError(language === 'pt' ? 'Erro inesperado: ' + (err.message || 'Verifique o console') : 'Unexpected error: ' + (err.message || 'Check console'));
        } finally {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current = null;
            }
            setLoading(false);
            loadingRef.current = false;
            console.log(`AdminView: loadData cycle finished for [${activeTab}]`);
        }
    }, [activeTab, userAccount, language]);

    const handleAirdropSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const projectData = {
            ...formData,
            content_pt: JSON.stringify(ptSteps),
            content_en: JSON.stringify(enSteps)
        };

        // Limpar campos que não devem ser enviados no update
        delete (projectData as any).id;
        delete (projectData as any).created_at;

        try {
            let result;
            if (editingAirdrop) {
                result = await updateAirdrop(editingAirdrop.id, projectData);
            } else {
                result = await createAirdrop(projectData as any);
            }

            if (result) {
                alert(language === 'pt' ? 'Salvo com sucesso!' : 'Saved successfully!');
                setIsAirdropModalOpen(false);
                setEditingAirdrop(null);
                setPtSteps([]);
                setEnSteps([]);
                await loadData();
            } else {
                alert(language === 'pt' ? 'Erro ao salvar. Verifique o console ou permissões.' : 'Error saving. Check console or permissions.');
            }
        } catch (error) {
            console.error('Error saving airdrop:', error);
            alert(language === 'pt' ? 'Erro ao salvar: ' + (error as any).message : 'Error saving: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAirdrop = async (id: string) => {
        if (!confirm(language === 'pt' ? 'Tem certeza que deseja excluir?' : 'Are you sure?')) return;
        await deleteAirdrop(id);
        await loadData();
    };



    const handleTickerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = { ...tickerFormData };
        delete (data as any).id;
        delete (data as any).created_at;

        try {
            let result;
            if (editingAnnouncement) {
                result = await updateTickerAnnouncement(editingAnnouncement.id, data);
            } else {
                result = await createTickerAnnouncement(data as any);
            }

            if (result) {
                alert(language === 'pt' ? 'Salvo com sucesso!' : 'Saved successfully!');
                setIsTickerModalOpen(false);
                setEditingAnnouncement(null);
                setTickerFormData({ content_pt: '', content_en: '', icon: 'zap', priority: 0, active: true });
                await loadData();
            }
        } catch (error) {
            console.error('Error saving ticker:', error);
            alert('Erro ao salvar ticker.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTicker = async (id: string) => {
        if (!confirm(language === 'pt' ? 'Tem certeza que deseja excluir?' : 'Are you sure?')) return;
        await deleteTickerAnnouncement(id);
        await loadData();
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-32 animate-in fade-in duration-500">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Zap className="text-yellow-400 fill-yellow-400" />
                            ADMIN PAINEL
                        </h1>
                        <p className="text-xs text-white/40 uppercase font-bold mt-1 tracking-widest">Controle total do ecossistema</p>
                    </div>

                    <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('airdrops')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'airdrops' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/40 hover:text-white'}`}
                        >
                            <Globe size={16} /> Airdrops
                        </button>

                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'messages' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/40 hover:text-white'}`}
                        >
                            <Mail size={16} /> Mensagens
                        </button>

                        <button
                            onClick={() => setActiveTab('ticker')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'ticker' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/40 hover:text-white'}`}
                        >
                            <LayoutDashboard size={16} /> Ticker
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/40 hover:text-white'}`}
                        >
                            <Flame size={16} /> Stats
                        </button>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="max-w-6xl mx-auto">
                {activeTab === 'airdrops' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black uppercase">{language === 'pt' ? 'Gerenciar Airdrops' : 'Manage Airdrops'}</h2>
                            <button
                                onClick={() => {
                                    setEditingAirdrop(null);
                                    setIsAirdropModalOpen(true);
                                }}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/10 active:scale-95"
                            >
                                <Plus size={18} /> Novo Airdrop
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-400" size={40} /></div>
                        ) : error ? (
                            <div className="text-center py-20 text-rose-500 uppercase font-black text-xs tracking-widest border border-rose-500/20 bg-rose-500/5 rounded-3xl p-8">
                                <AlertTriangle size={32} className="mx-auto mb-4 opacity-50" />
                                <p>Erro ao carregar dados</p>
                                <p className="text-[10px] opacity-60 mt-2 lowercase">{error}</p>
                                <button onClick={loadData} className="mt-4 px-4 py-2 bg-rose-500/20 rounded-lg hover:bg-rose-500/30 transition-all">Tentar Novamente</button>
                            </div>
                        ) : airdrops.length === 0 ? (
                            <div className="text-center py-20 text-white/20 uppercase font-bold text-xs tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">
                                Nenhum resultado encontrado
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {airdrops.map(airdrop => (
                                    <div
                                        key={airdrop.id}
                                        onClick={() => {
                                            setEditingAirdrop(airdrop);
                                            setIsAirdropModalOpen(true);
                                        }}
                                        className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5 hover:border-yellow-400/50 transition-all group cursor-pointer active:scale-95 flex flex-col"
                                    >
                                        <div className="relative h-32 rounded-2xl overflow-hidden mb-4 border border-white/5 bg-black">
                                            <img src={airdrop.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <div className="p-2 bg-black/80 text-white rounded-lg group-hover:bg-yellow-400 group-hover:text-black transition-all">
                                                    <Edit2 size={14} />
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAirdrop(airdrop.id);
                                                    }}
                                                    className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-black uppercase text-sm mb-1">{airdrop.title_pt}</h3>
                                        <p className="text-[10px] text-white/40 uppercase font-bold">{airdrop.category} • {airdrop.chain}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}



                {activeTab === 'messages' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black uppercase">{language === 'pt' ? 'Mensagens de Suporte' : 'Support Messages'}</h2>
                            <button
                                onClick={loadData}
                                className="bg-white/5 hover:bg-white/10 text-white/40 hover:text-white p-3 rounded-xl transition-all"
                            >
                                <Rocket size={18} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-400" size={40} /></div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-20 text-white/20 uppercase font-bold text-xs tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">
                                Nenhuma mensagem encontrada
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 transition-all flex flex-col gap-4 group ${!msg.read ? 'border-yellow-400/30 bg-yellow-400/5' : 'hover:border-white/10'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${!msg.read ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black uppercase text-sm flex items-center gap-2">
                                                        {msg.name}
                                                        {!msg.read && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>}
                                                    </h3>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{msg.email}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock size={10} className="text-white/20" />
                                                        <span className="text-[9px] text-white/20 font-bold">
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(msg);
                                                        setReplyText('');
                                                        setReplyLanguage(language); // Default to current view language
                                                        if (!msg.read) {
                                                            markMessageAsRead(msg.id);
                                                            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
                                                        }
                                                    }}
                                                    className="p-3 bg-white text-black rounded-xl hover:bg-yellow-400 transition-all text-[10px] font-black uppercase flex items-center gap-2"
                                                >
                                                    <Mail size={14} /> {language === 'pt' ? 'RESPONDER' : 'REPLY'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm(language === 'pt' ? 'Excluir mensagem?' : 'Delete message?')) return;
                                                        await deleteSupportMessage(msg.id);
                                                        setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                    }}
                                                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                            <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                        </div>
                                        {!msg.read && (
                                            <button
                                                onClick={async () => {
                                                    await markMessageAsRead(msg.id);
                                                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
                                                }}
                                                className="self-end text-[9px] font-black uppercase text-yellow-400/50 hover:text-yellow-400 transition-colors"
                                            >
                                                MARCAR COMO LIDA
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {activeTab === 'ticker' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black uppercase">{language === 'pt' ? 'Gerenciar Ticker' : 'Manage Ticker'}</h2>
                            <button
                                onClick={() => {
                                    setEditingAnnouncement(null);
                                    setTickerFormData({ content_pt: '', content_en: '', icon: 'zap', priority: 0, active: true });
                                    setIsTickerModalOpen(true);
                                }}
                                className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-yellow-400/10 active:scale-95"
                            >
                                <Plus size={18} /> Novo Anúncio
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-yellow-400" size={40} /></div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center py-20 text-white/20 uppercase font-bold text-xs tracking-widest border-2 border-dashed border-white/5 rounded-[40px]">
                                Nenhum anúncio encontrado
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {announcements.map(ann => (
                                    <div key={ann.id} className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 hover:border-yellow-400/30 transition-all flex items-center justify-between gap-6 group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl border border-yellow-400/20 flex items-center justify-center text-yellow-400">
                                                {ann.icon === 'fire' && <Flame size={24} />}
                                                {ann.icon === 'rocket' && <Rocket size={24} />}
                                                {ann.icon === 'bell' && <Bell size={24} />}
                                                {ann.icon === 'check' && <CheckCircle size={24} />}
                                                {ann.icon === 'zap' && <Zap size={24} />}
                                                {ann.icon === 'alert' && <AlertTriangle size={24} />}
                                                {ann.icon === 'info' && <Info size={24} />}
                                                {ann.icon === 'shield' && <ShieldCheck size={24} />}
                                                {ann.icon === 'heart' && <Heart size={24} />}
                                                {ann.icon === 'star' && <Star size={24} />}
                                                {!ann.icon && <Zap size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-black uppercase text-sm">{ann.content_pt}</h3>
                                                    {!ann.active && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded">Inativo</span>}
                                                </div>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{ann.content_en}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-[9px] text-yellow-400/50 uppercase font-bold">Prioridade: {ann.priority}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingAnnouncement(ann);
                                                    setTickerFormData(ann);
                                                    setIsTickerModalOpen(true);
                                                }}
                                                className="p-3 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTicker(ann.id)}
                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && stats && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-black uppercase">{language === 'pt' ? 'Métricas do Ecossistema' : 'Ecosystem Metrics'}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Total Users */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-500/30 transition-all group">
                                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                    <User size={32} />
                                </div>
                                <h3 className="text-4xl font-black text-white">{stats.totalUsers}</h3>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total Usuários</p>
                            </div>

                            {/* Card 2: Premium Users */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center gap-2 hover:border-yellow-400/30 transition-all group">
                                <div className="p-4 bg-yellow-400/10 text-yellow-400 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                    <Star size={32} fill="currentColor" />
                                </div>
                                <h3 className="text-4xl font-black text-yellow-400">{stats.premiumUsers}</h3>
                                <div className="flex flex-col items-center">
                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Premium</p>
                                    <span className="text-[9px] text-green-500 font-bold">R$ {stats.premiumUsers * 19.90}/mês (est.)</span>
                                </div>
                            </div>

                            {/* Card 3: Free Users */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center gap-2 hover:border-white/30 transition-all group">
                                <div className="p-4 bg-white/5 text-white/60 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                    <User size={32} />
                                </div>
                                <h3 className="text-4xl font-black text-white/60">{stats.freeUsers}</h3>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Free</p>
                            </div>

                            {/* Card 4: Payments/Referrals */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:border-green-500/30 transition-all group">

                                <div className="w-full flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[10px] text-white/40 uppercase font-bold">Pagantes (Stripe)</span>
                                    <span className="text-lg font-black text-green-400">{stats.validPayments}</span>
                                </div>

                                <div className="w-full flex justify-between items-center">
                                    <span className="text-[10px] text-white/40 uppercase font-bold">Convidados (Ref)</span>
                                    <span className="text-lg font-black text-purple-400">{stats.referralUsers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Airdrop Modal */}
            {isAirdropModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsAirdropModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
                            <h2 className="text-xl font-black uppercase tracking-tighter">
                                {editingAirdrop ? 'Editar Airdrop' : 'Novo Airdrop'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsAirdropModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAirdropSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* PT */}
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <label className="text-[9px] font-black uppercase text-yellow-400 mb-2 block">PT</label>
                                        <input
                                            placeholder="Título PT"
                                            value={formData.title_pt}
                                            onChange={e => setFormData({ ...formData, title_pt: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-xs outline-none focus:border-yellow-400 mb-4"
                                            required
                                        />
                                        <textarea
                                            placeholder="Descrição Curta PT"
                                            value={formData.description_pt}
                                            onChange={e => setFormData({ ...formData, description_pt: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-xs outline-none focus:border-yellow-400 h-20 resize-none"
                                        />
                                    </div>
                                </div>
                                {/* EN */}
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <label className="text-[9px] font-black uppercase text-blue-400 mb-2 block">EN</label>
                                        <input
                                            placeholder="Title EN"
                                            value={formData.title_en}
                                            onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-xs outline-none focus:border-blue-400 mb-4"
                                            required
                                        />
                                        <textarea
                                            placeholder="Short Description EN"
                                            value={formData.description_en}
                                            onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-xs outline-none focus:border-blue-400 h-20 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400 appearance-none text-white font-bold"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Rede (Chain)</label>
                                    <input
                                        placeholder="Ethereum, Solana..."
                                        value={formData.chain}
                                        onChange={e => setFormData({ ...formData, chain: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400 appearance-none text-white font-bold"
                                    >
                                        <option value="Active" className="bg-zinc-900">Ativo</option>
                                        <option value="Inactive" className="bg-zinc-900">Inativo</option>
                                        <option value="Confirmado" className="bg-zinc-900">Confirmado</option>
                                        <option value="Rumor" className="bg-zinc-900">Rumor</option>
                                        <option value="Expirado" className="bg-zinc-900">Expirado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Custo (Cost)</label>
                                    <select
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400 appearance-none text-white font-bold"
                                    >
                                        <option value="Grátis" className="bg-zinc-900">Grátis</option>
                                        <option value="Baixo Custo" className="bg-zinc-900">Baixo Custo</option>
                                        <option value="Alto Custo" className="bg-zinc-900">Alto Custo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Potencial de Recompensa</label>
                                    <select
                                        value={formData.reward_potential}
                                        onChange={e => setFormData({ ...formData, reward_potential: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400 appearance-none text-white font-bold"
                                    >
                                        <option value="Baixo" className="bg-zinc-900">Baixo</option>
                                        <option value="Médio" className="bg-zinc-900">Médio</option>
                                        <option value="Alto" className="bg-zinc-900">Alto</option>
                                        <option value="Muito Alto" className="bg-zinc-900">Muito Alto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">URL do Projeto</label>
                                    <input
                                        placeholder="https://..."
                                        value={formData.project_url || ''}
                                        onChange={e => setFormData({ ...formData, project_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-white/40 block">Links de Mídia</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="URL da Imagem (Thumbnail)"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                    <input
                                        placeholder="URL do Banner"
                                        value={formData.banner_url}
                                        onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="Twitter URL"
                                        value={formData.twitter_url || ''}
                                        onChange={e => setFormData({ ...formData, twitter_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                    <input
                                        placeholder="Discord URL"
                                        value={formData.discord_url || ''}
                                        onChange={e => setFormData({ ...formData, discord_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="Telegram URL"
                                        value={formData.telegram_url || ''}
                                        onChange={e => setFormData({ ...formData, telegram_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                    <input
                                        placeholder="Video Tutorial URL"
                                        value={formData.video_url || ''}
                                        onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400"
                                    />
                                </div>
                            </div>

                            <div className="bg-black/50 p-6 rounded-[32px] border border-white/5 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black uppercase text-yellow-400 block tracking-widest">Passos do Airdrop (Steps)</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setStepLanguage('pt')}
                                                className={`text-[8px] font-bold uppercase py-1 px-3 rounded-md transition-all ${stepLanguage === 'pt' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/40'}`}
                                            >
                                                PT
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStepLanguage('en')}
                                                className={`text-[8px] font-bold uppercase py-1 px-3 rounded-md transition-all ${stepLanguage === 'en' ? 'bg-blue-400 text-black' : 'bg-white/5 text-white/40'}`}
                                            >
                                                EN
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newStep = { content: '' };
                                            if (stepLanguage === 'pt') setPtSteps([...ptSteps, newStep]);
                                            else setEnSteps([...enSteps, newStep]);
                                        }}
                                        className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-zinc-700 active:scale-95 transition-all border border-white/10"
                                    >
                                        + Adicionar Passo ({stepLanguage.toUpperCase()})
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(stepLanguage === 'pt' ? ptSteps : enSteps).map((step, idx) => (
                                        <div key={idx} className={`bg-white/5 p-4 rounded-2xl border space-y-3 relative group/step ${stepLanguage === 'pt' ? 'border-yellow-400/10' : 'border-blue-400/10'}`}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (stepLanguage === 'pt') setPtSteps(ptSteps.filter((_, i) => i !== idx));
                                                    else setEnSteps(enSteps.filter((_, i) => i !== idx));
                                                }}
                                                className="absolute top-2 right-2 text-white/20 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    placeholder={stepLanguage === 'pt' ? "Título do Passo" : "Step Title"}
                                                    value={step.title || ''}
                                                    onChange={e => {
                                                        if (stepLanguage === 'pt') {
                                                            const newSteps = [...ptSteps];
                                                            newSteps[idx].title = e.target.value;
                                                            setPtSteps(newSteps);
                                                        } else {
                                                            const newSteps = [...enSteps];
                                                            newSteps[idx].title = e.target.value;
                                                            setEnSteps(newSteps);
                                                        }
                                                    }}
                                                    className="bg-transparent border-b border-white/10 p-1 text-[10px] outline-none focus:border-yellow-400"
                                                />
                                                <input
                                                    placeholder={stepLanguage === 'pt' ? "Data (Opcional)" : "Date (Optional)"}
                                                    type="date"
                                                    value={step.date || ''}
                                                    onChange={e => {
                                                        if (stepLanguage === 'pt') {
                                                            const newSteps = [...ptSteps];
                                                            newSteps[idx].date = e.target.value;
                                                            setPtSteps(newSteps);
                                                        } else {
                                                            const newSteps = [...enSteps];
                                                            newSteps[idx].date = e.target.value;
                                                            setEnSteps(newSteps);
                                                        }
                                                    }}
                                                    className="bg-transparent border-b border-white/10 p-1 text-[10px] outline-none text-white/40 focus:text-white"
                                                />
                                            </div>

                                            <textarea
                                                placeholder={stepLanguage === 'pt' ? "Conteúdo / Instruções" : "Content / Instructions"}
                                                value={step.content}
                                                onChange={e => {
                                                    if (stepLanguage === 'pt') {
                                                        const newSteps = [...ptSteps];
                                                        newSteps[idx].content = e.target.value;
                                                        setPtSteps(newSteps);
                                                    } else {
                                                        const newSteps = [...enSteps];
                                                        newSteps[idx].content = e.target.value;
                                                        setEnSteps(newSteps);
                                                    }
                                                }}
                                                className="w-full bg-white/5 rounded-xl p-3 text-[10px] outline-none h-20 resize-none focus:border-white/20 border border-transparent"
                                            />

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="relative">
                                                    <LinkIcon size={10} className="absolute left-2 top-2 text-white/20" />
                                                    <input
                                                        placeholder="Link URL"
                                                        value={step.link_url || ''}
                                                        onChange={e => {
                                                            if (stepLanguage === 'pt') {
                                                                const newSteps = [...ptSteps];
                                                                newSteps[idx].link_url = e.target.value;
                                                                setPtSteps(newSteps);
                                                            } else {
                                                                const newSteps = [...enSteps];
                                                                newSteps[idx].link_url = e.target.value;
                                                                setEnSteps(newSteps);
                                                            }
                                                        }}
                                                        className="w-full bg-black/30 border border-white/5 rounded-lg p-1.5 pl-6 text-[9px] outline-none focus:border-yellow-400 transition-all"
                                                    />
                                                </div>
                                                <input
                                                    placeholder={stepLanguage === 'pt' ? "Texto do Link" : "Link Text"}
                                                    value={step.link_text || ''}
                                                    onChange={e => {
                                                        if (stepLanguage === 'pt') {
                                                            const newSteps = [...ptSteps];
                                                            newSteps[idx].link_text = e.target.value;
                                                            setPtSteps(newSteps);
                                                        } else {
                                                            const newSteps = [...enSteps];
                                                            newSteps[idx].link_text = e.target.value;
                                                            setEnSteps(newSteps);
                                                        }
                                                    }}
                                                    className="w-full bg-black/30 border border-white/5 rounded-lg p-1.5 text-[9px] outline-none focus:border-yellow-400 transition-all"
                                                />
                                            </div>

                                            <div className="relative">
                                                <input
                                                    placeholder={stepLanguage === 'pt' ? "URL da Imagem deste Passo" : "Image URL for this Step"}
                                                    value={step.image_url || ''}
                                                    onChange={e => {
                                                        if (stepLanguage === 'pt') {
                                                            const newSteps = [...ptSteps];
                                                            newSteps[idx].image_url = e.target.value;
                                                            setPtSteps(newSteps);
                                                        } else {
                                                            const newSteps = [...enSteps];
                                                            newSteps[idx].image_url = e.target.value;
                                                            setEnSteps(newSteps);
                                                        }
                                                    }}
                                                    className="w-full bg-black/30 border border-white/5 rounded-lg p-1.5 text-[9px] outline-none focus:border-yellow-400 transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {(stepLanguage === 'pt' ? ptSteps : enSteps).length === 0 && (
                                        <div className="text-center py-6 text-white/10 text-[10px] uppercase font-black border-2 border-dashed border-white/5 rounded-2xl">
                                            Nenhum passo adicionado em {stepLanguage === 'pt' ? 'PT' : 'EN'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-400 active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {editingAirdrop ? 'Salvar Alterações' : 'Criar Airdrop'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Ticker Modal */}
            {isTickerModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsTickerModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
                            <h2 className="text-xl font-black uppercase tracking-tighter text-yellow-400">
                                {editingAnnouncement ? 'Editar Anúncio' : 'Novo Anúncio Ticker'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsTickerModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleTickerSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="bg-yellow-400/10 p-4 rounded-2xl border border-yellow-400/20">
                                    <label className="text-[9px] font-black uppercase text-yellow-400 mb-2 block tracking-widest">Conteúdo do Anúncio (PT)</label>
                                    <textarea
                                        placeholder="Ex: NOVO AIRDROP CONFIRMADO! VEJA OS PASSOS AGORA."
                                        value={tickerFormData.content_pt}
                                        onChange={e => setTickerFormData({ ...tickerFormData, content_pt: e.target.value })}
                                        className="w-full bg-transparent border-b border-yellow-400/20 p-2 text-xs outline-none focus:border-yellow-400 h-20 resize-none font-bold placeholder:text-yellow-400/20"
                                        required
                                    />
                                </div>

                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <label className="text-[9px] font-black uppercase text-white/40 mb-2 block tracking-widest">Content (EN)</label>
                                    <textarea
                                        placeholder="Ex: NEW AIRDROP CONFIRMED! CHECK THE STEPS NOW."
                                        value={tickerFormData.content_en}
                                        onChange={e => setTickerFormData({ ...tickerFormData, content_en: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 p-2 text-xs outline-none focus:border-white/40 h-20 resize-none font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-white/40 block tracking-widest">Selecione o Ícone</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {[
                                        { id: 'fire', icon: Flame },
                                        { id: 'rocket', icon: Rocket },
                                        { id: 'bell', icon: Bell },
                                        { id: 'check', icon: CheckCircle },
                                        { id: 'zap', icon: Zap },
                                        { id: 'alert', icon: AlertTriangle },
                                        { id: 'info', icon: Info },
                                        { id: 'shield', icon: ShieldCheck },
                                        { id: 'heart', icon: Heart },
                                        { id: 'star', icon: Star }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setTickerFormData({ ...tickerFormData, icon: item.id })}
                                            className={`p-4 rounded-2xl border transition-all flex items-center justify-center ${tickerFormData.icon === item.id ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                                        >
                                            <item.icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-white/40 block">Prioridade</label>
                                <input
                                    type="number"
                                    value={tickerFormData.priority}
                                    onChange={e => setTickerFormData({ ...tickerFormData, priority: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-yellow-400 transition-all font-bold"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setTickerFormData({ ...tickerFormData, active: !tickerFormData.active })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${tickerFormData.active ? 'bg-green-500' : 'bg-red-500'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tickerFormData.active ? 'left-7' : 'left-1'}`} />
                                </button>
                                <span className="text-[10px] font-black uppercase tracking-widest">{tickerFormData.active ? 'Ativo no Ticker' : 'Inativo (Oculto)'}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-300 active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-yellow-400/10"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                {editingAnnouncement ? 'Salvar Alterações' : 'Publicar no Ticker'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setReplyingTo(null)}></div>
                    <div className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
                            <div>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-black uppercase tracking-tighter text-yellow-400">
                                        {replyLanguage === 'pt' ? 'Responder Usuário' : 'Reply to User'}
                                    </h2>
                                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                                        <button
                                            onClick={() => setReplyLanguage('pt')}
                                            className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${replyLanguage === 'pt' ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white'}`}
                                        >
                                            PT
                                        </button>
                                        <button
                                            onClick={() => setReplyLanguage('en')}
                                            className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${replyLanguage === 'en' ? 'bg-blue-400 text-black' : 'text-white/40 hover:text-white'}`}
                                        >
                                            EN
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/40 font-bold uppercase mt-1">Para: {replyingTo.name} ({replyingTo.email})</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 max-h-32 overflow-y-auto">
                                <label className="text-[9px] font-black uppercase text-white/40 mb-2 block tracking-widest">Mensagem Original</label>
                                <p className="text-[11px] text-white/60 italic">"{replyingTo.message}"</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-yellow-400 mb-2 block tracking-widest">Sua Resposta</label>
                                <textarea
                                    placeholder={language === 'pt' ? "Digite sua resposta aqui..." : "Type your response here..."}
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-yellow-400 h-40 resize-none font-medium placeholder:text-white/10"
                                    required
                                />
                            </div>

                            <button
                                onClick={async () => {
                                    if (!replyText.trim()) return;
                                    setLoading(true);
                                    try {
                                        const success = await sendSupportReply(
                                            replyingTo.id,
                                            replyText,
                                            replyingTo.email,
                                            replyingTo.name,
                                            replyingTo.user_id || '',
                                            replyLanguage
                                        );
                                        if (success) {
                                            alert(language === 'pt' ? 'Resposta enviada com sucesso!' : 'Response sent successfully!');
                                            setReplyingTo(null);
                                            setReplyText('');
                                        } else {
                                            alert(language === 'pt' ? 'Erro ao enviar resposta. Verifique o console.' : 'Error sending response. Check console.');
                                        }
                                    } catch (err) {
                                        console.error('Reply error:', err);
                                        alert('Erro fatal ao responder.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading || !replyText.trim()}
                                className="w-full py-5 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-300 active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-yellow-400/10"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                {language === 'pt' ? 'ENVIAR RESPOSTA' : 'SEND RESPONSE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
