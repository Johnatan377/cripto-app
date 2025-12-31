import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const translations = {
    en: {
        title: "📱 Install CryptoFolio App",
        scan: "Scan QR Code with your phone",
        access: "Or access directly:",
        android_title: "📲 Android",
        install_btn: "Install App Now",
        ios_title: "🍎 iPhone/iPad",
        ios_steps: [
            "1️⃣ Open link in <strong>Safari</strong>",
            "2️⃣ Tap <strong>Share</strong> button (square with arrow)",
            "3️⃣ Scroll and tap <strong>\"Add to Home Screen\"</strong>",
            "4️⃣ Tap <strong>\"Add\"</strong>"
        ],
        how_to_title: "ℹ️ How to use",
        checklist: [
            "✅ Use <strong>installed app</strong> on mobile",
            "✅ Use <strong>desktop browser</strong> on computer",
            "⚠️ <strong>Avoid</strong> mobile browser (use app instead!)",
            "🔄 Your data syncs automatically"
        ]
    },
    pt: {
        title: "📱 Instalar App CryptoFolio",
        scan: "Escaneie o QR Code com seu celular",
        access: "Ou acesse diretamente:",
        android_title: "📲 Android",
        install_btn: "Instalar App Agora",
        ios_title: "🍎 iPhone/iPad",
        ios_steps: [
            "1️⃣ Abra o link no <strong>Safari</strong>",
            "2️⃣ Toque no botão <strong>Compartilhar</strong> (quadrado com seta)",
            "3️⃣ Role e toque em <strong>\"Adicionar à Tela de Início\"</strong>",
            "4️⃣ Toque em <strong>\"Adicionar\"</strong>"
        ],
        how_to_title: "ℹ️ Como usar",
        checklist: [
            "✅ Use o <strong>app instalado</strong> no celular",
            "✅ Use o <strong>navegador desktop</strong> no computador",
            "⚠️ <strong>Evite</strong> navegador móvel (use o app!)",
            "🔄 Seus dados sincronizam automaticamente"
        ]
    }
};

const InstallApp = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [language, setLanguage] = useState<'en' | 'pt'>('pt');
    const appUrl = 'https://cryptofoliodefi.xyz';

    useEffect(() => {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Detect language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.includes('pt')) {
            setLanguage('pt');
        } else {
            setLanguage('en');
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed!');
        }

        setDeferredPrompt(null);
    };

    const t = translations[language];

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center relative">
            {/* Language Toggle */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={() => setLanguage('pt')}
                    className={`px-3 py-1 rounded-full text-sm font-bold border transition-all ${language === 'pt' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                    🇧🇷 PT
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full text-sm font-bold border transition-all ${language === 'en' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                    🇺🇸 EN
                </button>
            </div>

            <div className="max-w-2xl w-full">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    {t.title}
                </h1>

                <div className="bg-white p-8 rounded-2xl mb-8 flex justify-center">
                    <QRCodeSVG
                        value={appUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div className="text-center mb-8">
                    <p className="text-xl mb-4">
                        {t.scan}
                    </p>
                    <p className="text-gray-400">
                        {t.access} <br />
                        <a href={appUrl} className="text-cyan-400 font-mono">
                            {appUrl}
                        </a>
                    </p>
                </div>

                {!isIOS && deferredPrompt && (
                    <div className="bg-gray-900 p-6 rounded-xl mb-6">
                        <h3 className="text-2xl font-bold mb-4">{t.android_title}</h3>
                        <button
                            onClick={handleInstall}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-6 rounded-xl transition-all"
                        >
                            {t.install_btn}
                        </button>
                    </div>
                )}

                {isIOS && (
                    <div className="bg-gray-900 p-6 rounded-xl mb-6">
                        <h3 className="text-2xl font-bold mb-4">{t.ios_title}</h3>
                        <ol className="space-y-3 text-left">
                            {t.ios_steps.map((step, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: step }}></li>
                            ))}
                        </ol>
                    </div>
                )}

                <div className="bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">{t.how_to_title}</h3>
                    <ul className="space-y-2 text-gray-300">
                        {t.checklist.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: item }}></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InstallApp;
