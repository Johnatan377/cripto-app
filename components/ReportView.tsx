import React, { useState, useEffect } from 'react';
import { FileText, Download, Share2, Mail, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { PortfolioItem, MissionLog } from '../types';
// import emailjs from '@emailjs/browser'; // Removed
import { generatePDF } from '../services/pdfService';
import { supabase } from '../services/supabaseClient';

// Initialize EmailJS Globally (Best Practice for v3/v4)
// EmailJS Removed - Using Supabase Edge Function 'send-email'

interface ReportViewProps {
    language: 'pt' | 'en';
    theme: string;
    portfolioItems: PortfolioItem[];
    marketData: Record<string, any>;
    allocationLogs: MissionLog[];
    currency: 'usd' | 'brl' | 'eur';
}

const ReportView: React.FC<ReportViewProps> = ({ language, theme, portfolioItems, marketData, allocationLogs, currency }) => {
    const t = TRANSLATIONS[language];
    // FORCE STANDARD THEME: User requested professional black look always
    const isGame = false;

    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [logoBase64, setLogoBase64] = useState('');

    // Load Logo for PDF Report
    useEffect(() => {
        const loadLogo = async () => {
            try {
                // Fetch the new report logo (v2)
                const response = await fetch('/logo_report_v2.png');
                if (!response.ok) throw new Error('Logo not found');
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setLogoBase64(base64);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.warn("Logo loading failed:", error);
            }
        };
        loadLogo();
    }, []);


    // CURRENCY FORMATTER
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(value);
    };

    // MODULE 1: PORTFOLIO (AGGREGATED VALUE) - STRICT RULE: NO PNL, NO YIELD
    const portfolioModuleData = portfolioItems.map(item => {
        const currentPrice = marketData[item.assetId]?.current_price || 0;
        const totalValue = currentPrice * item.quantity;

        // Strict adherence: Only Asset, Quantity, Total Value per asset
        return {
            asset: item.name || item.assetId, // Asset
            quantity: item.quantity,          // Quantity
            totalValue: totalValue            // Total Value per Asset
        };
    }).sort((a, b) => b.totalValue - a.totalValue);

    // Total Portfolio Value
    const totalPortfolioValue = portfolioModuleData.reduce((acc, item) => acc + item.totalValue, 0);

    // MODULE 2: ASSET TRACEABILITY - STRICT RULE: DECLARATIVE ONLY, NO VALUES
    const traceabilityModuleData = allocationLogs.map(log => ({
        asset: log.moeda,
        quantity: log.quantidade,
        protocol: log.nomeProtocolo,
        category: log.categoria,
        wallet: log.wallet
    }));


    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSending(true);

        try {
            // 1. Generate PDF (Bilingual + Logo)
            const pdfBlob = generatePDF(
                portfolioItems,
                marketData,
                allocationLogs,
                logoBase64,
                language
            );

            // 2. Upload to Supabase Storage (Free Alternative to Paid Attachments)
            const fileName = `report_portfolio_${new Date().getTime()}.pdf`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('report')
                .upload(fileName, pdfBlob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Supabase Upload Error:", uploadError);
                throw new Error("Falha ao salvar o PDF na nuvem. Verifique o console.");
            }

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('report')
                .getPublicUrl(fileName);

            console.log(`[DEBUG] PDF Link generated: ${publicUrl}`);

            // 4. (Reverted) Simple Text Body
            // const htmlContent = ... (removed)

            // 4. Prepare Template Parameters (Bilingual)
            const templateParams = {
                to_email: email,
                title_text: language === 'pt' ? 'Seu Relatório Chegou! 🚀' : 'Your Report Has Arrived! 🚀',
                message_body: language === 'pt'
                    ? 'Aqui está o relatório do seu portfólio solicitado no Cryptofolio DEFI. Clique no link abaixo para baixar o PDF.'
                    : 'Here is your requested portfolio report from Cryptofolio DEFI. Click the link below to download the PDF.',
                footer_quote: language === 'pt'
                    ? 'Gerencie seu portfólio cripto com facilidade e estilo.'
                    : 'Manage your crypto portfolio with ease and style.',
                button_text: language === 'pt' ? 'BAIXAR PDF COMPLETO' : 'DOWNLOAD FULL PDF',
                pdf_link: publicUrl
            };

            // 6. Send Email via Supabase Edge Function (Gmail SMTP)
            console.log(`[DEBUG] Invoking send-email function...`);

            const { error: fnError } = await supabase.functions.invoke('send-email', {
                body: {
                    to: email,
                    subject: templateParams.title_text,
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2>${templateParams.title_text}</h2>
                            <p>${templateParams.message_body}</p>
                            <br/>
                            <a href="${publicUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                ${templateParams.button_text}
                            </a>
                            <br/><br/>
                            <p style="font-size: 12px; color: #666;">${templateParams.footer_quote}</p>
                        </div>
                    `,
                    text: `${templateParams.title_text}\n\n${templateParams.message_body}\n\nDownload Link: ${publicUrl}`
                }
            });

            if (fnError) throw new Error(`Edge Function Error: ${fnError.message}`);

            console.log(`[REPORT SYSTEM] Email dispatched to ${email} via Gmail SMTP`);
            setSending(false);
            setSent(true);
            setTimeout(() => setSent(false), 5000);
            setEmail('');

        } catch (error: any) {
            console.error("FAILED to send email:", error);
            const msg = error?.text || error?.message || "Erro desconhecido";
            alert(`Falha no envio: ${msg}`);
            setSending(false);
        }
    };

    const getThemeClasses = () => {
        if (isGame) {
            return {
                container: 'bg-blue-900/10 border-blue-500/30 text-blue-400',
                card: 'bg-black/60 border-blue-500/50',
                header: 'text-yellow-400 font-arcade',
                tableHeader: 'text-blue-500',
                text: 'text-blue-300',
                highlight: 'text-yellow-400',
                button: 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 active:shadow-none'
            };
        }
        return {
            container: 'bg-zinc-900/30 border-zinc-800 text-zinc-300',
            card: 'bg-zinc-900 border-zinc-700',
            header: 'text-white font-sans',
            tableHeader: 'text-zinc-500',
            text: 'text-zinc-300',
            highlight: 'text-white',
            button: 'bg-white text-black hover:bg-zinc-200'
        };
    };

    const styles = getThemeClasses();

    return (
        <div className={`relative min-h-screen w-full pb-32`}>
            {/* FORCE BLACK BACKGROUND OVERLAY - HIGH Z-INDEX TO COVER APP THEME */}
            <div className="absolute inset-0 bg-black z-40"></div>

            {/* CONTENT CONTAINER - HIGHER Z-INDEX TO SIT ON TOP OF BLACK OVERLAY */}
            <div className="relative z-50 flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full pt-6 px-4">

                {/* Header Section */}
                <div className={`p-6 rounded-3xl border opacity-80 border-zinc-800 bg-zinc-900 flex items-center justify-between`}>
                    <div className="relative z-10">
                        <h2 className={`text-2xl font-black uppercase mb-1 text-white`}>
                            {language === 'pt' ? 'RELATÓRIO PDF' : 'PDF REPORT'}
                        </h2>
                        <p className={`text-xs font-bold uppercase tracking-wider opacity-60 text-zinc-400`}>
                            {language === 'pt' ? 'GERAÇÃO E ENVIO' : 'GENERATION AND SENDING'}
                        </p>
                    </div>
                    <div className={`p-3 rounded-xl border opacity-80 border-white/10 bg-white/5`}>
                        <FileText size={32} className={'text-white'} />
                    </div>
                </div>

                {/* EMAIL DELIVERY FUNCTION - PRIMARY FOCUS */}
                <div className={`p-8 rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/50`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Mail size={24} className={'text-white'} />
                        <h3 className={`text-sm font-black uppercase tracking-widest text-white`}>
                            {language === 'pt' ? 'ENVIAR RELATÓRIO COMPLETO' : 'SEND FULL REPORT'}
                        </h3>
                    </div>

                    <div className="mb-6 p-4 rounded-xl bg-black border border-zinc-800">
                        <p className="text-[10px] text-zinc-400 uppercase leading-relaxed">
                            {language === 'pt'
                                ? 'O RELATÓRIO PDF CONTERÁ TODOS OS DADOS DO SEU PORTFÓLIO E RASTREABILIDADE (POOLS, STAKING, LENDING) DE FORMA ORGANIZADA E PROFISSIONAL.'
                                : 'THE PDF REPORT WILL CONTAIN ALL YOUR PORTFOLIO AND TRACEABILITY DATA (POOLS, STAKING, LENDING) ORGANIZED PROFESSIONALLY.'}
                        </p>
                    </div>

                    {sent ? (
                        <div className="flex items-center gap-2 text-white bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                            <CheckCircle size={18} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-green-500">
                                {language === 'pt' ? 'SOLICITAÇÃO DE ENVIO REGISTRADA.' : 'SENDING REQUEST REGISTERED.'}
                            </span>
                        </div>
                    ) : (
                        <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">E-mail</label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder={language === 'pt' ? 'seu@email.com' : 'you@email.com'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={sending}
                                        className={`flex-1 bg-black border rounded-xl p-4 text-xs outline-none focus:border-white transition-all border-zinc-800 text-white placeholder-zinc-700`}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className={`px-8 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 bg-white text-black hover:bg-zinc-200 ${sending ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        {sending ? (language === 'pt' ? 'ENVIANDO...' : 'SENDING...') : (language === 'pt' ? 'ENVIAR AGORA' : 'SEND NOW')}
                                        {!sending && <Share2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* WARNING BANNER */}
                <div className="flex items-center justify-center gap-2 opacity-30 mt-4">
                    <Lock size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">SECURE PDF GENERATION SYSTEM</span>
                </div>

                {/* System Footer */}
                <div className="text-center opacity-30">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">
                        SYSTEM ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ReportView;
