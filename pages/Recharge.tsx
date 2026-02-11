import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface DepositProps {
    onNavigate: (page: any, data?: any) => void;
    showToast?: (message: string, type: any) => void;
}

const QUICK_AMOUNTS = [8500, 12000, 25000, 35000, 95000, 120000];

const Recharge: React.FC<DepositProps> = ({ onNavigate, showToast }) => {
    const [amount, setAmount] = useState<string>('');
    const { withLoading } = useLoading();
    const [banks, setBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [usdtBank, setUsdtBank] = useState<any>(null);
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
                .catch(() => showToast?.("Erro ao obter taxa de câmbio", "error"));
        }
    }, [paymentMethod]);

    useEffect(() => {
        if (paymentMethod === 'USDT' && amount && exchangeRate > 0) {
            const valKz = parseFloat(amount);
            if (!isNaN(valKz)) {
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
                const uBank = data.find(b =>
                    b.nome_do_banco.toUpperCase().includes('USDT') ||
                    b.nome_do_banco.toUpperCase().includes('USTD')
                );

                setBanks(normalBanks);
                setUsdtBank(uBank);
                if (normalBanks.length > 0) setSelectedBank(normalBanks[0]);
            }
        } catch (err) {
            showToast?.("Erro ao carregar bancos", "error");
        } finally {
            setLoading(false);
        }
    };

    const validateAmount = (val: number): string | null => {
        if (!val || isNaN(val) || val <= 0) return "Digite um valor válido";

        if (paymentMethod === 'BANK') {
            if (val < 8500) return "Mínimo: 8.500 Kz";
            if (val > 1000000) return "Máximo: 1.000.000 Kz";
        } else {
            const valUsd = parseFloat(usdtAmount);
            if (valUsd < 4) return "Mínimo: 4 USDT";
            if (valUsd > 10000) return "Máximo: 10.000 USDT";
        }
        return null;
    };

    const handleConfirm = async () => {
        const valKz = parseFloat(amount);
        const error = validateAmount(valKz);

        if (error) {
            showToast?.(error, "warning");
            return;
        }

        if (paymentMethod === 'BANK' && !selectedBank) {
            showToast?.("Selecione um banco", "warning");
            return;
        }

        try {
            await withLoading(async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    showToast?.("Sessão expirada", "error");
                    onNavigate('login');
                    return;
                }

                if (paymentMethod === 'USDT') {
                    if (!usdtBank || !usdtBank.iban) {
                        showToast?.("Endereço de pagamento USDT indisponível", "error");
                        return;
                    }
                    onNavigate('deposit-usdt', {
                        amountKz: valKz,
                        amountUsdt: parseFloat(usdtAmount),
                        exchangeRate
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
                    onNavigate('detalhes-pay', {
                        deposit: {
                            ...data.data,
                            nome_destinatario: selectedBank.nome_destinatario,
                            nome_banco: selectedBank.nome_do_banco,
                            amount: valKz
                        }
                    });
                }
            }, "Processando...");
        } catch (err: any) {
            showToast?.(err.message || "Erro ao processar", "error");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#FF6B00]">
            <SpokeSpinner size="w-8 h-8" color="text-white" />
        </div>
    );

    const valKz = parseFloat(amount) || 0;
    const validationError = validateAmount(valKz);
    const isValid = !validationError && (paymentMethod === 'USDT' || selectedBank);

    return (
        <div className="bg-[#FF6B00] min-h-screen pb-20 font-sans">
            {/* Header */}
            <div className="bg-[#FF6B00] px-4 pt-4 pb-6 sticky top-0 z-50">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-white text-xl">arrow_back</span>
                    </button>
                    <h1 className="text-white text-lg font-bold">Recarregar</h1>
                    <button
                        onClick={() => onNavigate('deposit-history')}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-white text-xl">history</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 space-y-4">
                {/* Card Principal */}
                <div className="bg-white rounded-2xl p-5 shadow-lg">
                    {/* Método de Pagamento */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 block">
                            Método de pagamento
                        </label>
                        <div className="flex gap-6">
                            <button
                                onClick={() => { setPaymentMethod('BANK'); setSelectedBank(banks[0] || null); }}
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'BANK' ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-gray-200'
                                    }`}>
                                    {paymentMethod === 'BANK' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-sm ${paymentMethod === 'BANK' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>Banco</span>
                            </button>
                            <button
                                onClick={() => { setPaymentMethod('USDT'); setSelectedBank(null); }}
                                className="flex items-center gap-2 group transition-all"
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'USDT' ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-gray-200'
                                    }`}>
                                    {paymentMethod === 'USDT' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-sm ${paymentMethod === 'USDT' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>USDT</span>
                            </button>
                        </div>
                    </div>

                    {/* Valor */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                            Valor válido
                        </label>
                        <div className="bg-[#FEF7F2] rounded-xl px-4 h-[50px] flex items-center border border-[#FDEEE3] focus-within:border-[#FF6B00]/30 transition-all">
                            <div className="flex items-baseline gap-1 w-full">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-transparent flex-1 outline-none text-xl font-semibold text-gray-900 placeholder:text-gray-300"
                                    placeholder="0"
                                />
                                <span className="text-sm font-semibold text-gray-400">Kz</span>
                            </div>
                        </div>
                        {paymentMethod === 'USDT' && amount && (
                            <p className="text-xs text-gray-400 mt-2 font-medium">≈ {usdtAmount} USDT</p>
                        )}
                    </div>

                    {/* Valores Rápidos */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                            Valores rápidos
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {QUICK_AMOUNTS.map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className={`p-2.5 rounded-lg text-xs font-semibold transition-all ${amount === val.toString()
                                        ? 'bg-[#FF6B00] text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {val.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Seleção de Banco */}
                    {paymentMethod === 'BANK' && (
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                                Selecione o banco
                            </label>
                            <div className="space-y-2">
                                {banks.map(bank => (
                                    <button
                                        key={bank.id}
                                        onClick={() => setSelectedBank(bank)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedBank?.id === bank.id
                                            ? 'bg-orange-50 border-[#FF6B00] text-[#FF6B00]'
                                            : 'bg-gray-50 border-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">account_balance</span>
                                        <span className="text-sm font-semibold flex-1 text-left">{bank.nome_do_banco}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedBank?.id === bank.id ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-gray-200'
                                            }`}>
                                            {selectedBank?.id === bank.id && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botão Confirmar */}
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid}
                        className="w-full h-12 bg-[#FF6B00] text-white font-semibold rounded-xl text-sm uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md"
                    >
                        Confirmar
                    </button>
                </div>

                {/* Info de Segurança */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-[11px] text-gray-500 leading-relaxed space-y-2 font-medium">
                    <p className="font-semibold text-gray-700">ℹ️ Informações importantes:</p>
                    <p>• Valor mínimo via banco: 8.500 Kz</p>
                    <p>• Valor máximo via banco: 1.000.000 Kz</p>
                    <p>• Valor mínimo via USDT: 4 USDT</p>
                    <p>• Confirmação em até 10 minutos</p>
                    <p>• Transação 100% segura e criptografada</p>
                </div>
            </div>
        </div>
    );
};

export default Recharge;
