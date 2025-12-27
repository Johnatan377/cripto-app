import React, { useState, useEffect } from 'react';
import { Gamepad2, Zap, Trophy, Ghost, Skull, Play, Loader2, Bitcoin, Eye, EyeOff, Lock, LayoutDashboard, Search, ShieldCheck, Globe } from 'lucide-react';
import { signInWithPassword, signUpWithEmail, signInWithGoogle, resetPasswordForEmail } from '../services/authService';
import { TRANSLATIONS } from '../constants';

interface LoginPageProps {
    onLoginSuccess: () => void;
    initialLanguage?: 'pt' | 'en';
    onLanguageChange?: (lang: 'pt' | 'en') => void;
}

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, initialLanguage = 'pt', onLanguageChange }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [lang, setLang] = useState<'pt' | 'en'>(initialLanguage || 'en');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetMode, setResetMode] = useState(false);
    const [showMobileMarketing, setShowMobileMarketing] = useState(true);
    const [referralCode, setReferralCode] = useState(() => {
        // Try to get from URL first
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const ref = params.get('ref');
        if (ref) return ref.toUpperCase();

        // Then try session storage
        return typeof window !== 'undefined' ? sessionStorage.getItem('referral_code') || '' : '';
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setReferralCode(ref.toUpperCase());
            sessionStorage.setItem('referral_code', ref.toUpperCase());
        }
    }, []);

    const t = TRANSLATIONS[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (resetMode) {
                if (!isValidEmail(email)) {
                    throw new Error(lang === 'pt' ? "Por favor, insira um email válido." : "Please enter a valid email address.");
                }
                await resetPasswordForEmail(email);
                alert(lang === 'pt' ? "Email de redefinição enviado! Verifique sua caixa de entrada." : "Reset email sent! Check your inbox.");
                setResetMode(false);
                setIsLoading(false);
                return;
            }

            if (isLogin) {
                await signInWithPassword(email, password);
            } else {
                if (!isValidEmail(email)) {
                    throw new Error(lang === 'pt' ? "Por favor, insira um email válido." : "Please enter a valid email address.");
                }
                if (password !== confirmPassword) {
                    throw new Error(lang === 'pt' ? "As senhas não coincidem!" : "Passwords do not match!");
                }
                const response = await signUpWithEmail(email, password, referralCode.trim());

                // Enforce email verification step essentially by NOT logging them in immediately
                // Even if Supabase returns a session (if confirmation is off), we pretend they need to check email
                // to discourage bots/impulsive fake accounts.
                alert(lang === 'pt' ? "Cadastro realizado! Verifique seu email para confirmar antes de entrar." : "Registration successful! Please verify your email before logging in.");
                setIsLogin(true);
                setIsLoading(false);
                return;
            }
            onLoginSuccess(); // This only runs for explicit login now
        } catch (err: any) {
            setError(err.message || (lang === 'pt' ? "Erro de autenticação. Tente novamente." : "Authentication error. Try again."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-full bg-[#050505] text-white font-sans relative overflow-hidden selection:bg-yellow-500/30 p-6 md:p-12 gap-12">

            {/* Mobile Marketing Banner */}
            {showMobileMarketing && (
                <div className="fixed inset-0 z-[100] bg-black md:hidden flex flex-col p-8 overflow-y-auto">
                    <div className="flex-1 flex flex-col justify-center gap-10 py-12">
                        <div className="space-y-6">
                            <img
                                src="/logo_cryptofolio_defi.png"
                                alt="Cryptfolio DeFi"
                                className="w-80 h-auto object-contain drop-shadow-3xl"
                            />
                            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-white">
                                {t.landing.hero_title}<span className="text-yellow-500">{t.landing.hero_highlight}</span>
                            </h1>
                            <p className="text-base text-zinc-400 font-medium leading-relaxed">
                                {t.landing.hero_desc}
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-yellow-500 shrink-0">
                                    <Search size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-white">{t.landing.feature_1_title}</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{t.landing.feature_1_desc}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 shrink-0">
                                    <LayoutDashboard size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-white">{t.landing.feature_2_title}</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{t.landing.feature_2_desc}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowMobileMarketing(false)}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-auto"
                    >
                        {lang === 'pt' ? 'CONTINUAR PARA LOGIN' : 'CONTINUE TO LOGIN'}
                        <Zap size={18} className="fill-black" />
                    </button>
                </div>
            )}
            {/* Language Selector (Floating) */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 p-1 rounded-full">
                <button
                    onClick={() => { setLang('pt'); onLanguageChange?.('pt'); }}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-full transition-all flex items-center gap-2 ${lang === 'pt' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                >
                    <span className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center text-[8px] text-white">BR</span>
                    PT
                </button>
                <button
                    onClick={() => { setLang('en'); onLanguageChange?.('en'); }}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-full transition-all flex items-center gap-2 ${lang === 'en' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                >
                    <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white">EN</span>
                    EN
                </button>
            </div>

            {/* Professional Background with subtle gradients */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            {/* Left Column: Marketing Narrative (Desktop Only) */}
            <div className="hidden md:flex relative z-10 flex-1 max-w-xl flex-col gap-8 animate-in slide-in-from-left-8 duration-700">
                <div className="space-y-4">
                    <img
                        src="/logo_cryptofolio_defi.png"
                        alt="Cryptfolio DeFi"
                        className="w-72 h-auto object-contain drop-shadow-2xl mb-8"
                    />
                    <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                        {t.landing.hero_title}<span className="text-yellow-500">{t.landing.hero_highlight}</span>
                    </h1>
                    <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-lg">
                        {t.landing.hero_desc}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-yellow-500">
                            <Search size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white">{t.landing.feature_1_title}</h3>
                            <p className="text-xs text-zinc-500 mt-1">{t.landing.feature_1_desc}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white">{t.landing.feature_2_title}</h3>
                            <p className="text-xs text-zinc-500 mt-1">{t.landing.feature_2_desc}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-700">
                <div className="mb-2 text-center flex flex-col items-center md:hidden">
                    <img
                        src="/logo_cryptofolio_defi.png"
                        alt="Cryptfolio DeFi"
                        className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                    <div className="p-8 space-y-6">
                        {!resetMode && (
                            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-lg mb-6">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all duration-300 ${isLogin ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {t.auth.login}
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all duration-300 ${!isLogin ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {t.auth.register}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2">
                                <Skull size={14} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">{t.auth.email}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 focus:border-yellow-500/50 text-white p-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-700 focus:bg-black/60 focus:ring-1 focus:ring-yellow-500/20"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            {!resetMode && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">{t.auth.password}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 focus:border-yellow-500/50 text-white p-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-700 pr-10 focus:bg-black/60 focus:ring-1 focus:ring-yellow-500/20"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!isLogin && !resetMode && (
                                <div className="space-y-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">{t.auth.confirm_password}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 focus:border-yellow-500/50 text-white p-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-700 pr-10 focus:bg-black/60 focus:ring-1 focus:ring-yellow-500/20"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1">{t.auth.referral_code}</label>
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                            className="w-full bg-black/40 border border-white/10 focus:border-yellow-500/50 text-white p-3.5 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-700 focus:bg-black/60 focus:ring-1 focus:ring-yellow-500/20"
                                            placeholder="EX: CAROL123"
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && !resetMode && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setResetMode(true)}
                                        className="text-[10px] text-zinc-500 hover:text-yellow-500 transition-colors font-medium tracking-wide"
                                    >
                                        {t.auth.forgot_password}
                                    </button>
                                </div>
                            )}

                            {resetMode && (
                                <div className="flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={() => setResetMode(false)}
                                        className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {t.auth.back_to_login}
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-yellow-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        {resetMode ? t.auth.reset_password : (isLogin ? t.auth.login : t.auth.register)}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[9px] uppercase tracking-widest"><span className="bg-[#0e0e11] px-2 text-zinc-600">{t.auth.or_continue_with}</span></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium py-3 rounded-xl text-xs flex items-center justify-center gap-3 transition-all"
                        >
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.04-1.133 7.973-3.267 1.947-2.133 2.507-5.32 2.507-7.427 0-.587-.067-1.173-.187-1.68H12.48z" /></svg>
                            Google
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-white/20 font-medium tracking-wider">
                        {t.auth.secure_connection}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
