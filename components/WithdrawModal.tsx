import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from './SpokeSpinner';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, showToast }) => {
    const { withLoading } = useLoading();
    const [balance, setBalance] = useState(0);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [securityPassword, setSecurityPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [method, setMethod] = useState<'IBAN' | 'Multicaixa'>('IBAN');
    const [loading, setLoading] = useState(true);

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
        setSelectedBankId('');
    }, [method]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', user.id)
                .single();

            if (profile) setBalance(profile.balance || 0);

            const { data: banks } = await supabase.rpc('get_my_bank_accounts');
            if (banks && banks.length > 0) {
                setBankAccounts(banks);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTaxRate = () => method === 'IBAN' ? 0.14 : 0.20;

    const calculateTax = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return 0;
        return val * getTaxRate();
    };

    const calculateReceived = () => {
        const val = parseFloat(amount);
        if (isNaN(val)) return 0;
        return val - calculateTax();
    };

    const isWithinAllowedTime = () => {
        const now = new Date();
        const hours = now.getHours();
        return hours >= 10 && hours < 16;
    };

    const handleWithdraw = async () => {
        const val = parseFloat(amount);

        if (!isWithinAllowedTime()) {
            showToast?.("Retiradas permitidas apenas entre 10:00 e 16:00", "warning");
            return;
        }

        if (!amount || isNaN(val) || val <= 0) {
            showToast?.("Digite um valor válido", "error");
            return;
        }

        if (val < 1000) {
            showToast?.("Valor mínimo: 1.000 Kz", "warning");
            return;
        }

        if (val > 100000) {
            showToast?.("Valor máximo: 100.000 Kz", "warning");
            return;
        }

        if (val > balance) {
            showToast?.("Saldo insuficiente", "error");
            return;
        }

        if (!selectedBankId) {
            showToast?.("Selecione seu IBAN de retirada", "error");
            return;
        }

        if (!securityPassword) {
            showToast?.("Digite a senha de segurança", "error");
            return;
        }

        if (!/^\d{4}$/.test(securityPassword)) {
            showToast?.("O PIN deve conter exatamente 4 dígitos", "error");
            return;
        }

        try {
            await withLoading(async () => {
                const { error } = await supabase.rpc('request_withdrawal', {
                    p_amount: val,
                    p_pin: securityPassword,
                    p_bank_id: selectedBankId,
                    p_method: method
                });

                if (error) throw error;

                showToast?.("Retirada solicitada com sucesso", "success");
                setAmount('');
                setSecurityPassword('');
                fetchData();
            }, "Processando saque...");
        } catch (error: any) {
            showToast?.(error.message || "Operação não sucedida", "error");
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[110] bg-[#FF6B00] dark:bg-zinc-950 transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col min-h-screen text-black font-sans antialiased">
                <header className="pt-4 px-4 pb-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-white/20 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-white text-[32px]">chevron_left</span>
                        </button>
                        <h1 className="text-[18px] font-medium text-white tracking-tight lowercase">retirar fundo</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <main className="flex-1 px-4 pb-32">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <SpokeSpinner size="w-8 h-8" color="text-white" />
                            <p className="text-white/80 font-medium tracking-wide text-[10px] lowercase">carregando dados...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Saldo Card */}
                            <div className="bg-[#FFF5EE] p-5 rounded-[8px] shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-10 rounded-[8px] bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                                    </div>
                                    <div className="px-3 py-1 bg-red-50 text-red-500 rounded-[8px] text-[10px] font-medium lowercase">
                                        retirada em 24h
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-medium lowercase tracking-wide">balanço total disponível</p>
                                    <p className="text-3xl font-medium text-[#FF6B00]">{balance.toLocaleString('pt-AO')} Kz</p>
                                </div>
                            </div>

                            {/* Main Form Card */}
                            <div className="bg-white rounded-[8px] p-5 shadow-sm space-y-6">
                                {/* Método Picker */}
                                <div>
                                    <label className="text-[10px] font-medium text-gray-400 lowercase tracking-widest block mb-2 px-1">método de retirada</label>
                                    <div className="flex gap-2">
                                        {(['IBAN', 'Multicaixa'] as const).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setMethod(m)}
                                                className={`flex-1 h-12 rounded-[8px] font-medium text-xs transition-all border flex items-center justify-center gap-2 ${method === m
                                                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-orange-100'
                                                    : 'bg-gray-50 text-gray-400 border-gray-100'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    {m === 'IBAN' ? 'account_balance' : 'credit_card'}
                                                </span>
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-[#FFF5F0] border border-transparent rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-[#FF6B1A]/10 focus:border-[#FF6B1A]/30 text-[#2C3E50] placeholder:text-[#9CA3AF] font-semibold transition-all"
                                            placeholder="valor (1.000 - 100.000 kz)"
                                            type="number"
                                        />
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowBankDropdown(!showBankDropdown)}
                                            className="w-full bg-[#FFF5F0] border border-transparent rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-[#FF6B1A]/10 focus:border-[#FF6B1A]/30 text-left flex items-center justify-between transition-all"
                                        >
                                            <span className={`font-semibold ${selectedBankId ? 'text-[#2C3E50]' : 'text-[#9CA3AF]'}`}>
                                                {selectedBankId
                                                    ? bankAccounts.find(b => b.id === selectedBankId)?.bank_name || `Selecione seu ${method}`
                                                    : `selecione seu ${method} de retirada`}
                                            </span>
                                            <span className="material-symbols-outlined text-[#9CA3AF]">
                                                {showBankDropdown ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>

                                        {showBankDropdown && (
                                            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-orange-50 overflow-hidden">
                                                {bankAccounts.length > 0 ? (
                                                    bankAccounts.map((bank) => (
                                                        <button
                                                            key={bank.id}
                                                            onClick={() => {
                                                                setSelectedBankId(bank.id);
                                                                setShowBankDropdown(false);
                                                            }}
                                                            className="w-full px-4 py-4 text-left hover:bg-[#FFF5F0] text-sm border-b border-gray-50 last:border-0 transition-colors"
                                                        >
                                                            <div className="font-semibold text-[#2C3E50] lowercase">{bank.bank_name}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{bank.iban}</div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-xs text-gray-400 font-medium font-semibold italic">Nenhuma conta vinculada</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <input
                                            value={securityPassword}
                                            onChange={(e) => setSecurityPassword(e.target.value)}
                                            className="w-full bg-[#FFF5F0] border border-transparent rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-[#FF6B1A]/10 focus:border-[#FF6B1A]/30 text-[#2C3E50] placeholder:text-[#9CA3AF] font-semibold transition-all"
                                            placeholder="senha de segurança (4 dígitos)"
                                            type={showPassword ? "text" : "password"}
                                            maxLength={4}
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#FF6B1A] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Tax Summary */}
                                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 lowercase font-medium">taxa de desconto ({method === 'IBAN' ? '14%' : '20%'})</span>
                                        <span className="font-semibold text-[#2C3E50]">{calculateTax().toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                                        <span className="text-gray-600 font-medium lowercase">receberá na conta</span>
                                        <span className="font-bold text-[#FF6B1A]">{calculateReceived().toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleWithdraw}
                                    className="w-full h-12 bg-[#FF6B1A] text-white font-bold rounded-xl text-base active:scale-[0.98] transition-all shadow-lg shadow-orange-500/10"
                                >
                                    confirmar retirada
                                </button>
                            </div>

                            {/* Rules Card */}
                            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                                <div className="space-y-4 text-xs leading-relaxed text-white/80 font-medium italic">
                                    <p>• valor mínimo: 1.000 Kz | máximo: 100.000 Kz</p>
                                    <p>• horário de processamento: 10:00 às 16:00 horas</p>
                                    <p>• o crédito será efetuado em até 24 horas úteis</p>
                                    <p>• assegure-se que o titular coincide com os dados bancários</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WithdrawModal;
