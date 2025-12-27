import React, { useState } from 'react';
import { Lock, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError('As senhas não coincidem');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setPassword('');
                setConfirm('');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-neutral-900 border-2 border-yellow-400 rounded-2xl p-6 shadow-[0_0_40px_rgba(250,204,21,0.3)] space-y-6">

                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-400">
                        <Lock className="text-yellow-400" size={24} />
                    </div>
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">
                        NOVA SENHA
                    </h2>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">
                        Defina sua nova senha de acesso
                    </p>
                </div>

                {success ? (
                    <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl text-center space-y-2 animate-in zoom-in-95">
                        <p className="text-green-400 text-[10px] font-black uppercase">Senha Atualizada!</p>
                        <p className="text-green-400/70 text-[8px]">Redirecionando...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="NOVA SENHA"
                                className="w-full bg-black border-2 border-zinc-800 focus:border-yellow-400 rounded-xl p-4 text-xs text-white font-bold outline-none transition-colors"
                                autoFocus
                            />
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="CONFIRMAR NOVA SENHA"
                                className="w-full bg-black border-2 border-zinc-800 focus:border-yellow-400 rounded-xl p-4 text-xs text-white font-bold outline-none transition-colors"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                <AlertTriangle size={12} />
                                <span className="text-[9px] font-black uppercase">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SALVAR SENHA'}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default ChangePasswordModal;
