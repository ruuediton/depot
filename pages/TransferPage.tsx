import React, { useState } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface TransferPageProps {
    onNavigate: (page: any) => void;
    profile: any;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const TransferPage: React.FC<TransferPageProps> = ({ onNavigate, profile, showToast }) => {
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Source of truth will be balance_usdt and balance (KZ/AOA)
    const balanceUSDT = profile?.balance_usdt || 0;
    const balanceKZ = profile?.balance || 0;

    const handleConfirm = async () => {
        if (!amount || Number(amount) <= 0) {
            showToast?.("Insira um valor válido para conversão.", "warning");
            return;
        }
        if (!password) {
            showToast?.("Insira sua senha de login.", "warning");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('convert_usdt_to_kz', {
                p_amount: Number(amount),
                p_password: password
            });

            if (error) throw error;

            if (data?.success) {
                showToast?.(data.message, "success");
                setAmount('');
                setPassword('');
                // Request profile refresh if possible, or wait for automatic state update
                setTimeout(() => onNavigate('profile'), 1500);
            } else {
                showToast?.(data?.message || "Erro na conversão.", "error");
            }
        } catch (err: any) {
            console.error(err);
            showToast?.(err.message || "Erro ao processar conversão.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f27f0d] min-h-screen flex flex-col font-sans antialiased text-slate-800">
            {/* Header */}
            <header className="px-4 py-6 flex items-center justify-between text-white relative z-10">
                <button
                    onClick={() => onNavigate(-1)}
                    className="w-10 h-10 flex items-center justify-center active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-2xl font-bold">chevron_left</span>
                </button>
                <h1 className="text-xl font-bold tracking-tight">Conversão</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="flex-1 px-6 pt-2 space-y-4">
                {/* Balance Cards Container - Flat Design */}
                <div className="bg-[#fdebd3] rounded-[24px] p-6 border border-white/20 flex items-center justify-between relative overflow-hidden">
                    {/* Left Balance (AOA) */}
                    <div className="flex flex-col items-center text-center gap-1">
                        <span className="text-[10px] font-bold text-orange-900/40 tracking-widest">Aoa</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{balanceKZ.toLocaleString('pt-AO')}</span>
                    </div>

                    {/* Transfer Icon Circle - Flat */}
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center transform active:rotate-180 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-[24px] font-bold">swap_horiz</span>
                    </div>

                    {/* Right Balance (USDT) */}
                    <div className="flex flex-col items-center text-center gap-1">
                        <span className="text-[10px] font-bold text-orange-900/40 tracking-widest">Usdt</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{balanceUSDT.toLocaleString('pt-AO')}</span>
                    </div>
                </div>

                {/* Form Container - Flat */}
                <div className="bg-white rounded-[32px] p-8 mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="space-y-4">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Quantidade de conversão"
                                    autoComplete="off"
                                    name="conversion_amount_unique"
                                    className="w-full bg-[#f0f4f9] border-none rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 font-bold focus:bg-orange-50 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Senha de login"
                                    autoComplete="new-password"
                                    name="login_password_conversion"
                                    className="w-full bg-[#f0f4f9] border-none rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 font-bold focus:bg-orange-50 transition-all outline-none pr-14"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 active:text-[#f27f0d] transition-colors"
                                >
                                    <span className="material-symbols-outlined font-bold text-xl">
                                        {showPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Button - Flat */}
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full h-16 bg-[#f27f0d] text-white rounded-[20px] font-black text-lg tracking-[0.1em] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <SpokeSpinner size="w-6 h-6" className="text-white" /> : "Converter"}
                    </button>
                </div>
            </main>

            {/* Styles for symbols */}
            <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
        </div>
    );
};

export default TransferPage;
