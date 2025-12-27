import React, { useState } from 'react';
import { Asset, PortfolioData, Alert, AlertType } from '../types';
import { X, Bell, TrendingUp, TrendingDown, Trash2, Plus, DollarSign, Coins } from 'lucide-react';
import Modal from './Modal';
import { canAddAlert } from '../services/alertService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asset: PortfolioData | null;
    alerts: Alert[];
    onAddAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
    onRemoveAlert: (alertId: string) => void;
    userTier: 'free' | 'premium';
    language: 'pt' | 'en';
    theme: any;
    parseNumber: (val: string) => number;
    onLimitReached: () => void;
}

const AlertManagerModal: React.FC<Props> = ({
    isOpen, onClose, asset, alerts, onAddAlert, onRemoveAlert, userTier, language, theme, parseNumber, onLimitReached
}) => {
    const [targetPrice, setTargetPrice] = useState('');
    const [alertType, setAlertType] = useState<AlertType>('above');
    const [currency, setCurrency] = useState<'usd' | 'brl' | 'eur'>('usd');

    if (!asset) return null;

    const assetAlerts = alerts.filter(a => a.assetId === asset.id);
    const validation = canAddAlert(userTier, alerts, asset.id, 0); // assetCount not strictly used for simple limit

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseNumber(targetPrice);
        if (isNaN(price) || price <= 0) return;

        if (!validation.can) {
            onLimitReached();
            onClose(); // Optional: Close modal to focus on conversion
            return;
        }

        onAddAlert({
            assetId: asset.id,
            symbol: asset.symbol,
            type: alertType,
            targetValue: price,
            currency: currency,
            isActive: true
        });
        setTargetPrice('');
    };

    const t = {
        pt: {
            title: `Alarmes Inteligentes: ${asset.symbol}`,
            subtitle: 'Defina avisos de preço personalizados.',
            current_price: 'Preço Atual',
            add_title: 'Novo Alerta',
            price_label: 'Valor Alvo',
            type_label: 'Condição',
            currency_label: 'Moeda do Alerta',
            above: 'Acima de',
            below: 'Abaixo de',
            add_button: 'Criar Alarme',
            list_title: 'Seus Alarmes',
            no_alerts: 'Nenhum alarme para este ativo.',
            limit_reached: 'Limite atingido para o plano grátis.'
        },
        en: {
            title: `Smart Alarms: ${asset.symbol}`,
            subtitle: 'Set custom price alerts.',
            current_price: 'Current Price',
            add_title: 'New Alert',
            price_label: 'Target Value',
            type_label: 'Condition',
            currency_label: 'Alert Currency',
            above: 'Above',
            below: 'Below',
            add_button: 'Create Alarm',
            list_title: 'Your Alarms',
            no_alerts: 'No alarms for this asset.',
            limit_reached: 'Limit reached for free tier.'
        }
    }[language];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.title} theme={theme}>
            <div className="flex flex-col gap-6 h-full max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                {/* Info Header */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={asset.image} alt="" className="w-10 h-10 rounded-full" />
                        <div className="flex flex-col">
                            <span className="text-white font-black uppercase text-sm leading-none">{asset.name}</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{asset.symbol}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-white/40 text-[9px] font-bold uppercase block">{t.current_price}</span>
                        <span className="text-white font-black text-sm">${asset.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Add Form */}
                <form onSubmit={handleAdd} className="space-y-4 bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Plus size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{t.add_title}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-tighter">{t.price_label}</label>
                                <button
                                    type="button"
                                    onClick={() => setTargetPrice(asset.current_price.toString())}
                                    className="text-[9px] font-black uppercase text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20"
                                >
                                    {language === 'pt' ? 'USAR ATUAL' : 'USE CURRENT'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-black/60 border-2 border-white/10 rounded-xl p-3 pl-8 text-xs font-bold text-white outline-none focus:border-cyan-500 transition-all"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                    <DollarSign size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-tighter ml-1">{t.type_label}</label>
                            <div className="flex bg-black/60 border-2 border-white/10 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => setAlertType('above')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${alertType === 'above' ? 'bg-green-500 text-black' : 'text-white/40 hover:text-white'}`}
                                >
                                    <TrendingUp size={12} /> {t.above}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAlertType('below')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${alertType === 'below' ? 'bg-red-500 text-black' : 'text-white/40 hover:text-white'}`}
                                >
                                    <TrendingDown size={12} /> {t.below}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-tighter ml-1">{t.currency_label}</label>
                        <div className="flex gap-2">
                            {(['usd', 'brl', 'eur'] as const).map(curr => (
                                <button
                                    key={curr}
                                    type="button"
                                    onClick={() => setCurrency(curr)}
                                    className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${currency === curr ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-black/40 border-white/10 text-white/40 hover:border-white/20'}`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!targetPrice}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all mt-2"
                    >
                        {t.add_button}
                    </button>
                </form>

                {/* List Alerts */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Bell size={14} className="text-white/40" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{t.list_title}</span>
                        </div>
                        <span className="text-[9px] font-bold text-white/20">{assetAlerts.length} ALARME(S)</span>
                    </div>

                    <div className="space-y-2">
                        {assetAlerts.length > 0 ? (
                            assetAlerts.map(alert => {
                                const isAbove = alert.type === 'above';
                                const curSym = alert.currency === 'brl' ? 'R$' : alert.currency === 'eur' ? '€' : '$';
                                return (
                                    <div key={alert.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isAbove ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {isAbove ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold text-xs">
                                                    {isAbove ? t.above : t.below} {curSym}{alert.targetValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[8px] text-white/30 uppercase font-black">{new Date(alert.createdAt).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveAlert(alert.id)}
                                            className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t.no_alerts}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AlertManagerModal;
