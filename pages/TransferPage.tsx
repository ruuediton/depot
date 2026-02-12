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

    // For now, we use the balance from profile. 
    // In the future, this will come from balance_usdt
    const balanceUSDT = profile?.balance_usdt || 0;
    const balanceKZ = profile?.balance || 0;

    const handleConfirm = () => {
        if (!amount || Number(amount) <= 0) {
            showToast?.("Insira um valor válido para conversão.", "warning");
            return;
        }
        if (!password) {
            showToast?.("Insira sua senha de segurança.", "warning");
            return;
        }

        // Logic implementation will be done later as requested
        showToast?.("Funcionalidade em desenvolvimento. Aguarde as próximas atualizações.", "info");
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
                <h1 className="text-xl font-bold tracking-tight">Transferir</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="flex-1 px-6 pt-2 space-y-6">
                {/* Balance Cards Container */}
                <div className="bg-gradient-to-r from-[#ffe4d1] to-[#fdebd3] rounded-[24px] p-6 shadow-xl shadow-orange-950/20 border border-white/30 flex items-center justify-between relative overflow-hidden">
                    {/* Left Balance */}
                    <div className="flex flex-col items-center text-center gap-1">
                        <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-widest">Conta de retirada</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{balanceUSDT.toLocaleString('pt-AO')}</span>
                    </div>

                    {/* Transfer Icon Circle */}
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg transform active:rotate-180 transition-transform duration-500">
                        <span className="material-symbols-outlined text-white text-[24px] font-bold">swap_horiz</span>
                    </div>

                    {/* Right Balance */}
                    <div className="flex flex-col items-center text-center gap-1">
                        <span className="text-[10px] font-bold text-orange-900/60 uppercase tracking-widest">Conta básica</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">{balanceKZ.toLocaleString('pt-AO')}</span>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-orange-950/10 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="space-y-4">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Quantidade de conversão"
                                    className="w-full bg-[#fff9f4] border-none rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-300 font-bold focus:ring-4 focus:ring-orange-100 transition-all outline-none"
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
                                    placeholder="Senha"
                                    className="w-full bg-[#fff9f4] border-none rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-300 font-bold focus:ring-4 focus:ring-orange-100 transition-all outline-none pr-14"
                                />
                                <button
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

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full h-16 bg-[#f27f0d] text-white rounded-[20px] font-black text-lg uppercase tracking-[0.1em] shadow-xl shadow-orange-900/30 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <SpokeSpinner size="w-6 h-6" className="text-white" /> : "Confirme"}
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
