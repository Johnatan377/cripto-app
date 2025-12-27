import React, { useState, useEffect } from 'react';
import { Trophy, X, Crown, Check, Infinity, Zap } from 'lucide-react';
import { STRIPE_PROMO_MONTHLY_LINK, STRIPE_FULL_PRICE_LINK, STRIPE_USD_PROMO_LINK, STRIPE_USD_FULL_LINK } from '../constants';

interface PremiumArcadeBannerProps {
    onUpgrade: () => void;
    onClose: () => void;
    onRedeem: (code: string) => Promise<void> | void;
    language: 'pt' | 'en';
}

const TEXTS = {
    pt: {
        levelCap: "LIMITE DE NÍVEL ATINGIDO",
        offerExpires: "OFERTA EXPIRA EM:",
        offerExpired: "OFERTA EXPIRADA",
        unlockTitle: "DESBLOQUEIE TUDO",
        unlockDesc: <>Você atingiu o limite no modo free.<br />Migre para o premium</>,
        limitWallet: "3/3 Ativos adicionados na carteira",
        limitTracking: "3/3 Rastreio de ativos em protocolos",
        limitAirdrop: "Sem acesso à aba de Airdrop",
        unlimitedTracking: "Rastreio de protocolos",
        unlimitedWallet: "Ativos na carteira",
        unlimitedAirdrop: "Aba de Airdrop",
        unlimitedSuffix: "ilimitado",
        brazil: "Brasil (BRL)",
        global: "Global (USD)",
        from: "DE",
        forOnly: "POR APENAS",
        month: "MÊS",
        goPremium: "SEJA PREMIUM",
        enterCode: "DIGITE SEU CÓDIGO",
        activateCode: "ATIVAR CÓDIGO",
        checking: "VERIFICANDO...",
        cancel: "Cancelar",
        haveCode: "Tenho um código promocional",
        only: "APENAS"
    },
    en: {
        levelCap: "LEVEL CAP REACHED",
        offerExpires: "OFFER EXPIRES IN:",
        offerExpired: "OFFER EXPIRED",
        unlockTitle: "UNLOCK EVERYTHING",
        unlockDesc: <>You reached the limit on free mode.<br />Upgrade to premium</>,
        limitWallet: "3/3 Assets added to wallet",
        limitTracking: "3/3 Asset tracking in protocols",
        limitAirdrop: "No access to Airdrop tab",
        unlimitedTracking: "Unlimited protocol tracking",
        unlimitedWallet: "Unlimited wallet assets",
        unlimitedAirdrop: "Unlimited Airdrop tab",
        unlimitedSuffix: "", // Included in phrasing above for better English flow
        brazil: "Brazil (BRL)",
        global: "Global (USD)",
        from: "FROM",
        forOnly: "FOR ONLY",
        month: "MONTH",
        goPremium: "GO PREMIUM",
        enterCode: "ENTER YOUR CODE",
        activateCode: "ACTIVATE CODE",
        checking: "CHECKING...",
        cancel: "Cancel",
        haveCode: "I have a promo code",
        only: "ONLY"
    }
};

const PremiumArcadeBanner: React.FC<PremiumArcadeBannerProps> = ({ onUpgrade, onClose, onRedeem, language = 'pt' }) => {
    const [timeLeft, setTimeLeft] = useState(48 * 60 * 60);
    const [promoCode, setPromoCode] = useState('');
    const [showPromoInput, setShowPromoInput] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const t = TEXTS[language];
    const isPromoActive = timeLeft > 0;

    useEffect(() => {
        const storedStart = localStorage.getItem('promo_start_timer_v2');
        let startTime = storedStart ? parseInt(storedStart) : Date.now();

        if (!storedStart) {
            localStorage.setItem('promo_start_timer_v2', startTime.toString());
        }

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = (48 * 60 * 60) - elapsed;

            if (remaining <= 0) {
                // We keep it at 0 to show the full price stage
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "00:00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Determine the active links based on promo status
    const brlLink = isPromoActive ? STRIPE_PROMO_MONTHLY_LINK : STRIPE_FULL_PRICE_LINK;
    const usdLink = isPromoActive ? STRIPE_USD_PROMO_LINK : STRIPE_USD_FULL_LINK;

    const handleRedeemClick = async () => {
        if (!promoCode.trim()) return;
        setIsRedeeming(true);
        try {
            await onRedeem(promoCode.trim());
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
            <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-[#000000] border-2 border-[#DAA520] rounded-xl shadow-[0_0_40px_rgba(218,165,32,0.3)] overflow-y-auto custom-scrollbar">

                {/* Header Dourado */}
                <div className="bg-[#DAA520] p-3 flex items-center justify-between shrink-0 rounded-t-lg">
                    <div className="flex items-center gap-2 text-black">
                        <Trophy size={20} strokeWidth={2.5} />
                    </div>
                    <button onClick={onClose} className="bg-black/10 hover:bg-black/20 p-1 rounded transition-colors">
                        <X size={18} className="text-black" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center text-center space-y-5">

                    {/* Logo (Imagem Anexa) - INCREASED SIZE */}
                    <img
                        src="/logo_cryptofolio_defi.png"
                        alt="CryptoFolio DEFI"
                        className="h-28 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />

                    {/* Timer */}
                    <div className="w-full bg-[#111] border border-[#333] rounded-lg p-3">
                        <p className={`text-[10px] ${isPromoActive ? 'text-red-500' : 'text-gray-500'} font-bold uppercase tracking-widest mb-1`}>
                            {isPromoActive ? t.offerExpires : t.offerExpired}
                        </p>
                        <p className={`text-2xl font-mono ${isPromoActive ? 'text-[#FF0000] animate-pulse' : 'text-gray-600'} font-black tracking-[0.2em]`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>

                    {/* Crown Icon */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#DAA520] to-[#B8860B] flex items-center justify-center shadow-lg border-4 border-black ring-2 ring-[#DAA520]">
                        <Crown size={40} className="text-black fill-black" strokeWidth={1.5} />
                    </div>

                    {/* Titles */}
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                            {t.unlockTitle}
                        </h2>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed px-4">
                            {t.unlockDesc}
                        </p>
                    </div>

                    {/* Comparison Lists */}
                    <div className="w-full space-y-4">
                        {/* Free Limitations */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-white/60 text-[10px] font-bold uppercase">
                                <X size={14} className="text-red-500 min-w-[14px]" strokeWidth={3} />
                                <span className="text-left">{t.limitWallet}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-[10px] font-bold uppercase">
                                <X size={14} className="text-red-500 min-w-[14px]" strokeWidth={3} />
                                <span className="text-left">{t.limitTracking}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-[10px] font-bold uppercase">
                                <X size={14} className="text-red-500 min-w-[14px]" strokeWidth={3} />
                                <span className="text-left">{t.limitAirdrop}</span>
                            </div>
                        </div>

                        <div className="h-px bg-white/10 w-full"></div>

                        {/* Premium Benefits */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-white text-[10px] font-bold uppercase">
                                <Check size={14} className="text-[#00FF00] min-w-[14px]" strokeWidth={3} />
                                <span className="text-left">
                                    {t.unlimitedTracking} {language === 'pt' && <span className="text-[#DAA520]">{t.unlimitedSuffix}</span>} <Infinity size={10} className="inline text-[#DAA520]" />
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-white text-[10px] font-bold uppercase">
                                <Check size={14} className="text-[#00FF00] min-w-[14px]" strokeWidth={3} />
                                <span className="text-left">
                                    {t.unlimitedWallet} {language === 'pt' && <span className="text-[#DAA520]">{t.unlimitedSuffix}</span>} <Infinity size={10} className="inline text-[#DAA520]" />
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-white text-[10px] font-bold uppercase">
                                <Check size={14} className="text-[#00FF00] min-w-[14px]" strokeWidth={3} />
                                <span className="text-left">
                                    {t.unlimitedAirdrop} {language === 'pt' && <span className="text-[#DAA520]">{t.unlimitedSuffix}</span>} 🎁
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        {/* BRL */}
                        <div className="bg-[#111] border border-[#DAA520]/30 rounded-lg p-3 flex flex-col items-center justify-center hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => window.open(brlLink, '_blank')}>
                            <span className="text-[8px] text-white font-bold uppercase mb-1">{t.brazil}</span>
                            {isPromoActive ? (
                                <>
                                    <span className="text-[10px] text-white/60 line-through">{t.from} R$ 19,90 / {t.month}</span>
                                    <span className="text-xs text-[#DAA520] font-black uppercase">{language === 'pt' ? 'POR' : 'FOR'} R$ 9,90 / {t.month}</span>
                                </>
                            ) : (
                                <span className="text-xs text-[#DAA520] font-black uppercase">R$ 19,90 / {t.month}</span>
                            )}
                        </div>
                        {/* USD */}
                        <div className="bg-[#111] border border-[#DAA520]/30 rounded-lg p-3 flex flex-col items-center justify-center hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => window.open(usdLink, '_blank')}>
                            <span className="text-[8px] text-white font-bold uppercase mb-1">{t.global}</span>
                            {isPromoActive ? (
                                <>
                                    <span className="text-[10px] text-white/60 line-through">$3.99 / {t.month}</span>
                                    <span className="text-xs text-[#DAA520] font-black uppercase">$1.99 / {t.month}</span>
                                </>
                            ) : (
                                <span className="text-xs text-[#DAA520] font-black uppercase">$3.99 / {t.month}</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => window.open(brlLink, '_blank')}
                        className="w-full py-4 bg-[#DAA520] hover:bg-[#B8860B] active:scale-95 transition-all rounded-xl shadow-[0_0_20px_rgba(218,165,32,0.4)] flex items-center justify-center gap-2 group"
                    >
                        <Crown size={18} className="fill-black text-black group-hover:scale-110 transition-transform" />
                        <span className="text-black font-black text-sm uppercase tracking-wider">{t.goPremium}</span>
                    </button>

                    {/* Promo Code Toggle */}
                    <div className="w-full pt-2">
                        {showPromoInput ? (
                            <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRedeemClick()}
                                    placeholder={t.enterCode}
                                    disabled={isRedeeming}
                                    className="w-full bg-black border border-[#DAA520]/50 rounded-lg p-3 text-[10px] font-black text-white text-center uppercase outline-none focus:border-[#DAA520] disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={handleRedeemClick}
                                    disabled={isRedeeming}
                                    className="w-full bg-[#DAA520]/20 hover:bg-[#DAA520]/40 text-[#DAA520] font-bold py-2 rounded-lg text-[9px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRedeeming ? t.checking : t.activateCode}
                                </button>
                                <button onClick={() => setShowPromoInput(false)} disabled={isRedeeming} className="text-[8px] text-white/30 uppercase hover:text-white disabled:opacity-50">
                                    {t.cancel}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowPromoInput(true)}
                                className="text-[10px] font-bold text-white/30 hover:text-[#DAA520] uppercase tracking-widest transition-colors"
                            >
                                {t.haveCode}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PremiumArcadeBanner;
