import React from 'react';
import { X, Gift, Users, CreditCard, Sparkles } from 'lucide-react';
import { THEME_STYLES } from '../constants';
import { UserSettings } from '../types';

interface ReferralInfoBannerProps {
    onClose: () => void;
    settings: UserSettings;
}

const ReferralInfoBanner: React.FC<ReferralInfoBannerProps> = ({ onClose, settings }) => {
    const styles = THEME_STYLES[settings.theme] || THEME_STYLES.black;
    const isPt = settings.language === 'pt';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-300 font-sans">
            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="p-6 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Gift size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                                {isPt ? 'Indique e Ganhe' : 'Refer & Earn'}
                            </h2>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                                {isPt ? 'Programa de Recompensas' : 'Rewards Program'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-8 space-y-6 relative z-10">

                    {/* Main Hero Text */}
                    <div className="text-center space-y-2 py-2">
                        <h3 className="text-2xl font-black text-white leading-tight">
                            {isPt
                                ? <>Ganhe <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">30 Dias Premium</span> Grátis!</>
                                : <>Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">30 Days Premium</span> Free!</>}
                        </h3>
                        <p className="text-sm text-white/60 font-medium max-w-[80%] mx-auto">
                            {isPt
                                ? 'Para cada amigo que se cadastrar com seu link e virar Premium, você é recompensado.'
                                : 'For every friend who signs up with your link and goes Premium, you get rewarded.'}
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Step 1 */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                            <div className="mb-3 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Users size={16} />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">
                                {isPt ? '1. Indique Amigos' : '1. Refer Friends'}
                            </h4>
                            <p className="text-xs text-white/40 leading-relaxed">
                                {isPt ? 'Compartilhe seu link exclusivo com seus amigos traders.' : 'Share your unique link with your trader friends.'}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                            <div className="mb-3 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                <Sparkles size={16} />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">
                                {isPt ? '2. Eles Viram Premium' : '2. They Go Premium'}
                            </h4>
                            <p className="text-xs text-white/40 leading-relaxed">
                                {isPt ? 'Quando eles ativarem o plano Premium para desbloquear recursos.' : 'When they activate the Premium plan to unlock features.'}
                            </p>
                        </div>
                    </div>

                    {/* Premium Benefit Alert */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-yellow-500/30 rounded-xl p-4 flex gap-4 shadow-xl">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                            <CreditCard size={20} className="text-yellow-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-yellow-500 uppercase mb-1 flex items-center gap-2">
                                {isPt ? 'Você já é Premium?' : 'Already Premium?'}
                                <span className="bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                                    {isPt ? 'Sem Problemas' : 'No Problem'}
                                </span>
                            </h4>
                            <p className="text-xs text-white/70 leading-relaxed">
                                {isPt
                                    ? 'Não se preocupe! Se você já é assinante, nós creditaremos o valor na sua conta e '
                                    : 'Don\'t worry! If you are already a subscriber, we will credit your account and '}
                                <strong className="text-white">
                                    {isPt ? 'sua próxima fatura não será cobrada.' : 'your next invoice will be skipped.'}
                                </strong>
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        {isPt ? 'Entendi, fechar' : 'Got it, close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReferralInfoBanner;
