
import React, { useState, useEffect, useRef } from 'react';
import { fetchAirdrops, getCachedAirdrops } from '../services/airdropService';
import { AirdropProject } from '../types';
import AirdropCard from './AirdropCard';
import AirdropDetails from './AirdropDetails';
import { Filter, Search, Loader2 } from 'lucide-react';

interface AirdropScreenProps {
    language: 'pt' | 'en';
    theme: string;
    isPremium: boolean;
    onTriggerPremium: () => void;
}

const CATEGORIES = ['Todos', 'DeFi', 'Testnet', 'GameFi', 'L2', 'Stable Coin', 'PerpDex'];

const AirdropScreen: React.FC<AirdropScreenProps> = ({ language, theme, isPremium, onTriggerPremium }) => {
    const [projects, setProjects] = useState<AirdropProject[]>(() => getCachedAirdrops());
    const [loading, setLoading] = useState(projects.length === 0);
    const [selectedProject, setSelectedProject] = useState<AirdropProject | null>(null);
    const [filter, setFilter] = useState('Todos');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const isFetching = useRef(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        if (isFetching.current) return;

        if (projects.length === 0) setLoading(true);
        setErrorMsg(null);
        isFetching.current = true;

        console.log("AirdropScreen: Iniciando busca de airdrops...");

        try {
            // Timeout promise de 15 segundos
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout ao carregar airdrops')), 15000)
            );

            // Race entre o fetch e o timeout
            const data = await Promise.race([
                fetchAirdrops(),
                timeoutPromise
            ]) as AirdropProject[];

            if (!data || data.length === 0) {
                console.warn("AirdropScreen: Nenhum dado retornado ou array vazio do Supabase.");
            } else {
                console.log("AirdropScreen: Projetos carregados com sucesso:", data.length);
            }

            setProjects(data || []);
        } catch (e: any) {
            console.error("AirdropScreen: Falha ao carregar projetos:", e);
            setErrorMsg(language === 'pt'
                ? `Erro: ${e.message || 'Tempo limite excedido'}. Verifique se o banco de dados está online e tente recarregar.`
                : `Error: ${e.message || 'Timeout'}. Verify if the database is online and try refreshing.`);
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    };

    const handleProjectClick = (project: AirdropProject) => {
        if (!isPremium) {
            onTriggerPremium();
        } else {
            setSelectedProject(project);
        }
    };

    const filteredProjects = projects.filter(p => {
        if (filter === 'Todos') return true;
        return p.category?.toLowerCase() === filter.toLowerCase();
    });

    if (selectedProject) {
        return (
            <AirdropDetails
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                language={language}
            />
        );
    }

    return (
        <div className={`w-full pb-20 animate-in fade-in duration-500 ${theme === 'yellow' ? 'bg-[#ca8a04]' : 'bg-[#000]'} min-h-full -mt-2`}>

            {/* Header Title */}
            <div className="mb-6 px-2 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                        <span className="text-yellow-400 text-3xl">🪂</span> Airdrop
                    </h1>
                    <p className="text-xs text-white/50">
                        {language === 'pt' ? 'Curadoria de oportunidades de alto valor.' : 'Curated high-value opportunities.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadProjects} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                        <Loader2 size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 px-1 custom-scrollbar mb-4">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`
              whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all
              ${filter === cat
                                ? 'bg-white text-black scale-105 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                : theme === 'yellow'
                                    ? 'bg-black/10 text-black/80 hover:bg-black/20 hover:text-black font-extrabold'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
            `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin text-yellow-400 h-8 w-8" />
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4 px-1">
                    {filteredProjects.map(project => (
                        <AirdropCard
                            key={project.id}
                            project={project}
                            onClick={handleProjectClick}
                            language={language}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-white/30 flex flex-col items-center">
                    <Search size={40} className="mb-4 opacity-50" />
                    <p className="text-sm">
                        {language === 'pt' ? 'Nenhum airdrop encontrado nesta categoria.' : 'No airdrops found in this category.'}
                    </p>
                </div>
            )}

        </div>
    );
};

export default AirdropScreen;
