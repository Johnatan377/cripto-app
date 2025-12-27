import React from 'react';
import { AirdropProject, AirdropStep } from '../types';
import { ArrowLeft, ExternalLink, Play, DollarSign, Clock, CheckCircle, Calendar, Link as LinkIcon } from 'lucide-react';

interface AirdropDetailsProps {
    project: AirdropProject;
    onBack: () => void;
    language: 'pt' | 'en';
}

const AirdropDetails: React.FC<AirdropDetailsProps> = ({ project, onBack, language }) => {
    const isPt = language === 'pt';
    const rawContent = isPt ? project.content_pt : project.content_en;
    const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);

    const renderContent = (input: string) => {
        // Try parsing JSON for Rich Steps
        try {
            if (input.trim().startsWith('[')) {
                const steps: AirdropStep[] = JSON.parse(input);
                return (
                    <div className="flex flex-col gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative pl-6 sm:pl-8 border-l-2 border-white/10 last:border-0 pb-8 last:pb-0">
                                {/* Timeline Dot */}
                                <div className="absolute top-0 left-[-9px] w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>

                                <div className="flex flex-col gap-3">
                                    {/* Date Header */}
                                    {step.date && (
                                        <div className="flex items-center gap-2 text-xs font-mono text-yellow-400/80 mb-1">
                                            <Calendar size={12} />
                                            <span>{new Date(step.date).toLocaleDateString(isPt ? 'pt-BR' : 'en-US')}</span>
                                        </div>
                                    )}

                                    {/* Link Title or Regular Title */}
                                    {step.title && (
                                        <h3 className="text-lg font-bold text-white">{step.title}</h3>
                                    )}

                                    {/* Image */}
                                    {step.image_url && (
                                        <div className="relative group cursor-zoom-in" onClick={() => setZoomedImage(step.image_url!)}>
                                            <img
                                                src={step.image_url}
                                                alt={step.title || 'Step Image'}
                                                className="w-full rounded-xl border border-white/10 mb-2 mt-1 transition-transform group-hover:scale-[1.01]"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl pointer-events-none">
                                                <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">Zoom</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Text */}
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {step.content}
                                    </p>

                                    {/* Action Link */}
                                    {step.link_url && (
                                        <a
                                            href={step.link_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="self-start mt-2 bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 transition-colors uppercase font-bold tracking-wider"
                                        >
                                            <LinkIcon size={12} />
                                            {step.link_text || (isPt ? 'Acessar Link' : 'Open Link')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // Fallback for plain text
        }

        return input.split('\n').map((line, idx) => (
            <p key={idx} className="mb-4 text-gray-300 text-sm leading-relaxed">
                {line}
            </p>
        ));
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] overflow-y-auto animate-in slide-in-from-right duration-300 font-sans">
            {/* Zoom Modal */}
            {zoomedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white p-4 z-50">
                        <span className="text-4xl">&times;</span>
                    </button>
                    <img
                        src={zoomedImage}
                        alt="Zoomed"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            )}

            {/* Header Image */}
            <div className="relative w-full h-64 sm:h-80">
                <img
                    src={project.banner_url || project.image_url}
                    alt="Banner"
                    className="w-full h-full object-cover mask-image-b"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBack();
                    }}
                    className="absolute top-6 left-6 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/20 transition-all z-20"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="px-6 relative -mt-20 z-10 pb-12 w-full max-w-4xl mx-auto">

                {/* Header Info */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${project.reward_potential === 'Muito Alto' ? 'bg-purple-600 text-white' :
                            project.reward_potential === 'Alto' ? 'bg-green-500 text-black' :
                                'bg-blue-500 text-white'
                            }`}>
                            {isPt ? 'Potencial: ' : 'Potential: '} {project.reward_potential}
                        </span>
                        <span className="bg-white/10 text-gray-300 border border-white/10 px-3 py-1 rounded text-xs uppercase font-bold">
                            {project.cost}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-white leading-none">
                        {isPt ? project.title_pt : project.title_en}
                    </h1>

                    <p className="text-lg text-gray-400 font-medium">
                        {isPt ? project.description_pt : project.description_en}
                    </p>

                    <div className="flex gap-4 mt-2">
                        {project.video_url && (
                            <a
                                href={project.video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all text-sm uppercase shadow-lg shadow-red-900/20"
                            >
                                <Play size={18} fill="currentColor" /> {isPt ? 'Tutorial' : 'Tutorial'}
                            </a>
                        )}

                        <div className="flex gap-2">
                            {project.twitter_url && (
                                <a href={project.twitter_url} target="_blank" rel="noreferrer" className="bg-black/40 hover:bg-black/60 border border-white/10 text-white p-3 rounded-xl hover:scale-110 transition-all backdrop-blur-md">
                                    {/* X Logo (using text for accuracy or specific icon if available, Lucide Twitter is bird) */}
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                            )}
                            {project.discord_url && (
                                <a href={project.discord_url} target="_blank" rel="noreferrer" className="bg-[#5865F2]/80 hover:bg-[#5865F2] text-white p-3 rounded-xl hover:scale-110 transition-all backdrop-blur-md">
                                    <svg viewBox="0 0 127.14 96.36" fill="currentColor" className="w-5 h-5"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c1.24-18.87-2.6-38-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                                </a>
                            )}
                            {project.telegram_url && (
                                <a href={project.telegram_url} target="_blank" rel="noreferrer" className="bg-[#24A1DE]/80 hover:bg-[#24A1DE] text-white p-3 rounded-xl hover:scale-110 transition-all backdrop-blur-md">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                </a>
                            )}
                        </div>

                        {/* Future: Add 'Go to Project' link if available in DB */}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-white/10 my-8"></div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CheckCircle size={20} className="text-yellow-400" />
                            {isPt ? 'Passo a Passo' : 'Step by Step'}
                        </h2>

                        <div className="prose prose-invert prose-sm max-w-none">
                            {renderContent(rawContent)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AirdropDetails;
