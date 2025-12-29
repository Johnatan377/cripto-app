import React, { useState } from 'react';
import { Mail, Send, User, MessageSquare, CheckCircle, Loader2, LifeBuoy } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import emailjs from '@emailjs/browser';

import { sendSupportMessage } from '../services/messageService';
import { UserAccount } from '../types';

interface SupportViewProps {
    language: 'pt' | 'en';
    userAccount?: UserAccount | null;
}

const SupportView: React.FC<SupportViewProps> = ({ language, userAccount }) => {
    const t = TRANSLATIONS[language].support;
    const g = TRANSLATIONS[language].general;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;

        setSending(true);

        try {
            // Reusing EmailJS credentials from ReportView
            // The destination email is 'nogujohnogueira@gmail.com'
            const templateParams = {
                to_email: 'nogujohnogueira@gmail.com', // Admin inbox
                title_text: language === 'pt' ? 'MENSAGEM DE SUPORTE' : 'SUPPORT MESSAGE',
                message_body: `CLIENTE: ${name}\nCONTATO: ${email}\n\nMENSAGEM:\n${message}`,
                footer_quote: 'Sistema de Atendimento CryptoFolio DeFi',
                button_text: language === 'pt' ? 'RESPONDER AO CLIENTE' : 'REPLY TO CUSTOMER',
                pdf_link: `mailto:${email}` // Clever way to reply direct from email
            };

            await emailjs.send(
                "service_5z35w6w",
                "template_w38jwun", // Reusing existing template as general purpose
                templateParams,
                "GoH69eu2ACfTaSN2_"
            );

            // Also save to Supabase for the Admin View
            console.log("SupportView: Sending message to Firebase via MessageService...", { name, email, message });
            await sendSupportMessage({
                name,
                email,
                message,
                user_id: userAccount?.id
            });
            console.log("SupportView: Message saved to Firebase successfully");

            setSent(true);
            setName('');
            setEmail('');
            setMessage('');
            setTimeout(() => setSent(false), 5000);
        } catch (error) {
            console.error("Support Email Failed:", error);
            alert(language === 'pt' ? "Erro no envio. Verifique sua conexão." : "Send error. Check your connection.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full pb-32 pt-6 px-4">
            <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                {/* Header Card */}
                <div className="p-6 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black uppercase text-white">{t.title}</h2>
                        <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Help & Support Center</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <LifeBuoy size={24} className="text-white" />
                    </div>
                </div>

                {/* Form Card */}
                <div className="p-8 rounded-[32px] border border-white/10 bg-zinc-900 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    {sent ? (
                        <div className="py-12 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <p className="text-xs font-black uppercase text-green-500 max-w-[200px]">
                                {t.sent_msg}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="space-y-5 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">{t.name}</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black border border-white/5 rounded-2xl p-4 pl-11 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
                                        placeholder={language === 'pt' ? "Seu nome" : "Your name"}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">{t.email}</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black border border-white/5 rounded-2xl p-4 pl-11 text-xs text-white outline-none focus:border-white/20 transition-all font-medium"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">{t.message}</label>
                                <div className="relative">
                                    <MessageSquare size={14} className="absolute left-4 top-5 text-zinc-600" />
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        className="w-full bg-black border border-white/5 rounded-2xl p-4 pl-11 text-xs text-white outline-none focus:border-white/20 transition-all font-medium resize-none"
                                        placeholder={t.placeholder_msg}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:opacity-50"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>{language === 'pt' ? 'ENVIANDO...' : 'SENDING...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>{t.send}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 opacity-20">
                    <div className="h-[1px] w-8 bg-white"></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Direct Encrypted Channel</span>
                    <div className="h-[1px] w-8 bg-white"></div>
                </div>
            </div>
        </div>
    );
};

export default SupportView;
