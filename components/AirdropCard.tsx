
import React from 'react';
import { AirdropProject } from '../types';
import { PlayCircle } from 'lucide-react';

interface AirdropCardProps {
    project: AirdropProject;
    onClick: (project: AirdropProject) => void;
    language: 'pt' | 'en';
}

const AirdropCard: React.FC<AirdropCardProps> = ({ project, onClick, language }) => {
    const isPt = language === 'pt';

    return (
        <div
            onClick={() => onClick(project)}
            className="group relative w-full aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 shadow-lg hover:shadow-2xl border border-white/5 hover:border-white/20"
        >
            {/* Background Image */}
            <img
                src={project.image_url}
                alt={isPt ? project.title_pt : project.title_en}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col gap-2">

                {/* Status Badge */}
                <div className="flex justify-between items-end">
                    <span className={`
            px-2 py-1 rounded text-[10px] uppercase font-black tracking-widest border
            {/* Logic: Normalize to ignore case for robust styling */}
            ${['ativo', 'active'].includes(project.status.toLowerCase())
                            ? 'bg-green-500/10 text-green-500 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                            : ['expirado', 'inativo', 'inactive', 'expired'].includes(project.status.toLowerCase())
                                ? 'bg-red-500/10 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                : project.status === 'Confirmado' ? 'bg-blue-500 text-white border-transparent'
                                    : project.status === 'Rumor' ? 'bg-yellow-500 text-black border-transparent'
                                        : 'bg-gray-700 text-white border-transparent'}
          `}>
                        {['ativo', 'active'].includes(project.status.toLowerCase()) ? 'ATIVO' :
                            ['inativo', 'inactive', 'expirado', 'expired'].includes(project.status.toLowerCase()) ? 'INATIVO' :
                                project.status}
                    </span>
                    {project.video_url && <PlayCircle size={16} className="text-white/80" />}
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-lg leading-tight group-hover:text-yellow-400 transition-colors">
                    {isPt ? project.title_pt : project.title_en}
                </h3>

                {/* Category & Chain */}
                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded uppercase font-bold">{project.category}</span>
                    <span className="opacity-30">•</span>
                    <span className="uppercase font-bold text-yellow-500/90 whitespace-nowrap">
                        {isPt ? 'Rede ' : 'Network '}
                        {project.chain || (isPt ? 'Não definida' : 'Not defined')}
                    </span>
                </div>

            </div>
        </div>
    );
};

export default AirdropCard;
