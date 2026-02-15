import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from './SpokeSpinner';

interface RechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (message: string, type: any) => void;
    onNavigate: (page: string, data?: any) => void;
}

const QUICK_AMOUNTS = [8500, 12000, 25000, 35000, 95000, 120000];

const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose, showToast, onNavigate }) => {
    const [amount, setAmount] = useState<string>('');
    const { withLoading } = useLoading();
    const [banks, setBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [usdtBank, setUsdtBank] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'USDT'>('BANK');
    const [exchangeRate, setExchangeRate] = useState<number>(0);
    const [usdtAmount, setUsdtAmount] = useState<string>('0.00');

    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            fetchData();
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (paymentMethod === 'USDT' && isOpen) {
            fetch('https://api.exchangerate-api.com/v4/latest/USD')
                .then(res => res.json())
                .then(data => {
                    if (data?.rates?.AOA) setExchangeRate(data.rates.AOA);
                })
                .catch(() => showToast?.("Erro ao obter taxa de câmbio", "error"));
        }
    }, [paymentMethod, isOpen]);

    useEffect(() => {
        if (paymentMethod === 'USDT' && amount && exchangeRate > 0) {
            const valKz = parseFloat(amount);
            if (!isNaN(valKz)) {
                const usd = valKz / exchangeRate;
                setUsdtAmount(usd.toFixed(2));
            }
        }
    }, [amount, exchangeRate, paymentMethod]);

    const fetchData = async () => {
        setLoading(true);
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
                    onClose();
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

                const { data: rpcData, error: rpcError } = await supabase.rpc('create_deposit_request', {
                    p_amount: valKz,
                    p_bank_name: selectedBank.nome_do_banco,
                    p_iban: selectedBank.iban
                });

                if (rpcError) throw rpcError;

                if (rpcData.success) {
                    onNavigate('detalhes-pay', {
                        deposit: {
                            ...rpcData.data,
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

    if (!shouldRender) return null;

    const valKz = parseFloat(amount) || 0;
    const validationError = validateAmount(valKz);
    const isValid = !validationError && (paymentMethod === 'USDT' || selectedBank);

    return (
        <div
            className={`fixed inset-0 z-[110] bg-[#FF6B00] transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col min-h-screen font-sans antialiased text-black">
                <header className="pt-4 px-4 pb-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-white/20 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-white text-[32px]">chevron_left</span>
                        </button>
                        <h1 className="text-[18px] font-medium text-white tracking-tight lowercase">recarregar saldo</h1>
                        <button
                            onClick={() => { onClose(); onNavigate('records-financeiro'); }}
                            className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-white/20 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-white text-xl">history</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 pb-32 max-w-md mx-auto w-full transition-all duration-300">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <SpokeSpinner size="w-8 h-8" color="text-white" />
                            <p className="text-white/80 font-medium tracking-wide text-[10px] lowercase">carregando formas de pagamento...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl p-5 shadow-sm space-y-6">
                                {/* Método Picker */}
                                <div>
                                    <label className="text-[10px] font-medium text-gray-400 lowercase tracking-widest block mb-3 px-1">método de pagamento</label>
                                    <div className="flex gap-6 px-1">
                                        {(['BANK', 'USDT'] as const).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => { setPaymentMethod(m); if (m === 'BANK') setSelectedBank(banks[0]); else setSelectedBank(null); }}
                                                className="flex items-center gap-3 group transition-all"
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === m ? 'border-[#FF6B1A] bg-[#FF6B1A]' : 'border-gray-200'}`}>
                                                    {paymentMethod === m && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                                </div>
                                                <span className={`text-sm font-semibold lowercase ${paymentMethod === m ? 'text-[#2C3E50]' : 'text-gray-400'}`}>{m === 'BANK' ? 'banco' : 'usdt'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Valor Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-medium text-gray-400 lowercase tracking-widest block px-1">valor do depósito</label>
                                    <div className="bg-[#FFF5F0] border border-transparent rounded-xl px-4 h-12 flex items-center focus-within:ring-4 focus-within:ring-[#FF6B1A]/10 focus-within:border-[#FF6B1A]/30 transition-all">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="bg-transparent flex-1 outline-none text-xl font-semibold text-[#2C3E50] placeholder:text-[#9CA3AF]"
                                            placeholder="0"
                                        />
                                        <span className="text-sm font-semibold text-gray-400">Kz</span>
                                    </div>
                                    {paymentMethod === 'USDT' && amount && (
                                        <p className="text-[10px] text-gray-400 font-medium px-1 italic">≈ {usdtAmount} usdt</p>
                                    )}
                                </div>

                                {/* Quick Amounts */}
                                <div className="grid grid-cols-3 gap-2">
                                    {QUICK_AMOUNTS.map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val.toString())}
                                            className={`h-10 rounded-xl text-xs font-semibold transition-all ${amount === val.toString()
                                                ? 'bg-[#FF6B1A] text-white shadow-lg shadow-orange-500/10'
                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            {val.toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                {/* Bank Selections */}
                                {paymentMethod === 'BANK' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-medium text-gray-400 lowercase tracking-widest block px-1">selecione o banco receptor</label>
                                        <div className="space-y-2">
                                            {banks.map(bank => (
                                                <button
                                                    key={bank.id}
                                                    onClick={() => setSelectedBank(bank)}
                                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedBank?.id === bank.id
                                                        ? 'bg-orange-50 border-[#FF6B1A] text-[#FF6B1A]'
                                                        : 'bg-gray-50 border-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-lg">account_balance</span>
                                                    <span className="text-sm font-semibold flex-1 text-left lowercase">{bank.nome_do_banco}</span>
                                                    {selectedBank?.id === bank.id && <span className="material-symbols-outlined text-sm">check_circle</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    disabled={!isValid}
                                    className="w-full h-12 bg-[#FF6B1A] text-white font-bold rounded-xl text-base transition-all disabled:opacity-40 shadow-lg shadow-orange-500/10 active:scale-[0.98]"
                                >
                                    confirmar recarga
                                </button>
                            </div>

                            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                                <div className="space-y-4 text-[11px] leading-relaxed text-white/80 font-medium italic">
                                    <p className="font-bold text-white lowercase">ℹ️ observações:</p>
                                    <p>• mínimo via banco: 8.500 Kz | máximo: 1.000.000 Kz</p>
                                    <p>• mínimo via USDT: 4 USDT (equivalente em Kz)</p>
                                    <p>• tempo de processamento: ~10 minutos</p>
                                    <p>• certifique-se de anexar o comprovativo se solicitado</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RechargeModal;
