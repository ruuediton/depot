import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface DepositProps {
    onNavigate: (page: any, data?: any) => void;
    showToast?: (message: string, type: any) => void;
}

const QUICK_AMOUNTS = [8500, 12000, 25000, 35000, 95000, 120000, 300000];

const Recharge: React.FC<DepositProps> = ({ onNavigate, showToast }) => {
    const [amount, setAmount] = useState<string>('');
    const [balance, setBalance] = useState<number>(0);
    const { withLoading } = useLoading();
    const [banks, setBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'USDT'>('BANK');
    const [exchangeRate, setExchangeRate] = useState<number>(0);
    const [usdtAmount, setUsdtAmount] = useState<string>('0.00');

    useEffect(() => {
        if (paymentMethod === 'USDT') {
            fetch('https://api.exchangerate-api.com/v4/latest/USD')
                .then(res => res.json())
                .then(data => {
                    if (data?.rates?.AOA) setExchangeRate(data.rates.AOA);
                })
                .catch(err => console.error("Rate error:", err));
        }
    }, [paymentMethod]);

    useEffect(() => {
        if (paymentMethod === 'USDT' && amount && exchangeRate > 0) {
            const valKz = parseFloat(amount);
            if (!isNaN(valKz)) {
                // Formula: Kz / Rate = USD
                const usd = valKz / exchangeRate;
                setUsdtAmount(usd.toFixed(2));
            }
        }
    }, [amount, exchangeRate, paymentMethod]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('bancos_empresa')
                .select('*')
                .eq('ativo', true);

            if (!error && data) {
                const normalBanks = data.filter(b =>
                    !b.nome_do_banco.toUpperCase().includes('USDT') &&
                    !b.nome_do_banco.toUpperCase().includes('USTD')
                );
                setBanks(normalBanks);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('balance')
                    .eq('id', user.id)
                    .single();
                if (profile) setBalance(profile.balance || 0);
            }
        } catch (err) {
            console.error('Erro ao carregar bancos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalConfirm = async () => {
        const valKz = parseFloat(amount);

        if (!amount || isNaN(valKz)) {
            showToast?.("Digite um valor válido.", "warning");
            return;
        }

        if (paymentMethod === 'BANK') {
            if (valKz < 8500) {
                showToast?.("Recarga mínima via banco: 8.500 KZs", "warning");
                return;
            }
            if (valKz > 1000000) {
                showToast?.("Recarga máxima via banco: 1.000.000 KZs", "warning");
                return;
            }
            if (!selectedBank) {
                showToast?.("Por favor, selecione um banco.", "warning");
                return;
            }
        } else {
            const valUsd = parseFloat(usdtAmount);
            if (valUsd < 4) {
                showToast?.("Valor insuficiente. Mínimo aprox. 4 USDT", "warning");
                return;
            }
            if (valUsd > 10000) {
                showToast?.("Recarga máxima via USDT: 10.000 USDT", "warning");
                return;
            }
        }

        try {
            await withLoading(async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    showToast?.("Sessão expirada. Faça login novamente.", "error");
                    onNavigate('login');
                    return;
                }

                if (paymentMethod === 'USDT') {
                    onNavigate('deposit-usdt', {
                        amountKz: valKz,
                        amountUsdt: parseFloat(usdtAmount),
                        exchangeRate: exchangeRate
                    });
                    return;
                }


                const { data, error } = await supabase.rpc('create_deposit_request', {
                    p_amount: valKz,
                    p_bank_name: selectedBank.nome_do_banco,
                    p_iban: selectedBank.iban
                });

                if (error) throw error;

                if (data.success) {
                    onNavigate('confirmar-deposito', {
                        deposit: {
                            ...data.data,
                            nome_destinatario: selectedBank.nome_destinatario,
                            nome_banco: selectedBank.nome_do_banco
                        }
                    });
                }
            }, "Gerando dados de recarga...");
        } catch (err: any) {
            showToast?.(err.message || "Opah algo deu errado", "error");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white">
            <SpokeSpinner size="w-8 h-8" color="text-[#00C853]" />
        </div>
    );

    return (
        <div className="bg-[#F4F7F6] min-h-screen font-display text-gray-900 pb-20 antialiased">
            {/* Premium Header */}
            <div className="bg-gradient-to-br from-[#0F1111] to-[#1A1C1C] pt-12 pb-24 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C853]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 overflow-hidden pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C853]/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 overflow-hidden pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10">
                    <button
                        onClick={() => onNavigate('home')}
                        className="size-11 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <h1 className="text-white text-[18px] font-black tracking-tight">Recarregar</h1>
                    <button
                        onClick={() => onNavigate('deposit-history')}
                        className="size-11 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">history</span>
                    </button>
                </div>
            </div>

            <main className="px-6 -mt-16 relative z-10 space-y-6">
                {/* Quick Amounts - Moved to top */}
                <div className="bg-white rounded-[36px] p-8 shadow-premium border border-white/50 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-[0.03] pointer-events-none">
                        <span className="material-symbols-outlined text-[120px]">payments</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Valores Sugeridos</p>
                    <div className="flex flex-wrap gap-2.5">
                        {QUICK_AMOUNTS.map(val => {
                            const isSelected = amount === val.toString();
                            return (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className={`px-5 py-3 rounded-2xl text-[14px] font-black transition-all active:scale-95 border-2 ${isSelected
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-xl'
                                        : 'bg-gray-50 text-gray-900 border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {val.toLocaleString('pt-AO')}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <section className="space-y-6">
                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => { setPaymentMethod('BANK'); setSelectedBank(null); }}
                            className={`relative overflow-hidden flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 transition-all ${paymentMethod === 'BANK' ? 'bg-white border-[#00C853] shadow-xl' : 'bg-white border-transparent shadow-sm grayscale opacity-60'}`}
                        >
                            <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'BANK' ? 'bg-[#EEFFF5] text-[#00C853]' : 'bg-gray-50 text-gray-400'}`}>
                                <span className="material-symbols-outlined text-[28px]">account_balance</span>
                            </div>
                            <span className="text-[14px] font-black tracking-tight">Banco Nacional</span>
                            {paymentMethod === 'BANK' && (
                                <div className="absolute top-3 right-3">
                                    <span className="material-symbols-outlined text-[#00C853] text-[20px]">check_circle</span>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => { setPaymentMethod('USDT'); setSelectedBank(null); }}
                            className={`relative overflow-hidden flex flex-col items-center gap-3 p-6 rounded-[32px] border-2 transition-all ${paymentMethod === 'USDT' ? 'bg-white border-[#00C853] shadow-xl' : 'bg-white border-transparent shadow-sm grayscale opacity-60'}`}
                        >
                            <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'USDT' ? 'bg-[#EEFFF5] text-[#00C853]' : 'bg-gray-50 text-gray-400'}`}>
                                <span className="material-symbols-outlined text-[28px]">currency_bitcoin</span>
                            </div>
                            <span className="text-[14px] font-black tracking-tight">USDT (Crypto)</span>
                            {paymentMethod === 'USDT' && (
                                <div className="absolute top-3 right-3">
                                    <span className="material-symbols-outlined text-[#00C853] text-[20px]">check_circle</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="bg-white rounded-[32px] p-8 shadow-premium border border-white/50">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Deposito</label>
                            {paymentMethod === 'USDT' && amount && (
                                <span className="px-3 py-1 bg-[#EEFFF5] text-[#00C853] text-[10px] font-black rounded-full border border-[#00C853]/10">≈ {usdtAmount} USDT</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 border-b-2 border-gray-50 focus-within:border-[#00C853] transition-all pb-4">
                            <span className="text-[20px] font-black text-gray-400 tracking-tight">KZs</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent flex-1 outline-none text-[32px] font-black text-gray-900 placeholder:text-gray-100 tracking-tighter"
                                placeholder="0,00"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium mt-4">Digite o valor em Kwanzas angolanos (AOA)</p>
                    </div>

                    {paymentMethod === 'BANK' && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Selecione o Banco</p>
                            <div className="bg-white rounded-[24px] overflow-hidden shadow-premium p-2 border border-white/50">
                                <div className="flex flex-col gap-1">
                                    {banks.map(bank => (
                                        <div
                                            key={bank.id}
                                            onClick={() => setSelectedBank(bank)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedBank?.id === bank.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className={`size-10 rounded-xl flex items-center justify-center ${selectedBank?.id === bank.id ? 'bg-white/10' : 'bg-gray-50 text-gray-400'}`}>
                                                <span className="material-symbols-outlined">account_balance</span>
                                            </div>
                                            <span className="text-[14px] font-black flex-1 tracking-tight">{bank.nome_do_banco}</span>
                                            {selectedBank?.id === bank.id && (
                                                <span className="material-symbols-outlined text-[#00C853] text-[20px]">check_circle</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            onClick={handleFinalConfirm}
                            disabled={
                                loading ||
                                !amount ||
                                (paymentMethod === 'BANK' && (!selectedBank || parseFloat(amount) < 3000)) ||
                                (paymentMethod === 'USDT' && parseFloat(usdtAmount) < 4)
                            }
                            className="w-full h-[64px] bg-[#00C853] text-white font-black rounded-[24px] text-[15px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center shadow-[0_16px_32px_-8px_rgba(0,200,83,0.5)] active:scale-[0.97]"
                        >
                            {loading ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'Confirmar Recarga'}
                        </button>
                        <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-[0.2em] font-black opacity-30">Transação Segura 256-bit</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Recharge;
