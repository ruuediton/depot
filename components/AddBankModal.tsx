import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from './SpokeSpinner';

interface AddBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AddBankModal: React.FC<AddBankModalProps> = ({ isOpen, onClose, showToast }) => {
    const { withLoading } = useLoading();
    const [bankName, setBankName] = useState('');
    const [holderName, setHolderName] = useState('');
    const [iban, setIban] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingBank, setExistingBank] = useState<any>(null);
    const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            checkExistingBank();
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const BANK_PREFIXES: Record<string, string> = {
        "Banco BAI": "0040",
        "Banco BFA": "0006",
        "Banco BIC": "0051",
        "Banco Atlântico": "0055",
        "Banco Sol": "0044",
        "Banco BNI": "0009"
    };

    const checkExistingBank = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.rpc('get_my_bank_accounts');
            if (data && data.length > 0) {
                setExistingBank(data[0]);
                setBankName(data[0].nome_banco || '');
                setHolderName(data[0].nome_completo || '');
                setIban((data[0].iban || '').replace('AO06', ''));
                setMode('edit');
            }
        } catch (err) {
            console.error('Erro no servidor', err);
        } finally {
            setLoading(false);
        }
    };

    const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        setIban(value);
    };

    const handleSaveBank = async () => {
        try {
            let cleanIban = iban.replace(/\D/g, '');

            if (cleanIban.length !== 21) {
                showToast?.("O IBAN deve ter exatamente 21 dígitos.", "error");
                return;
            }

            let finalIban = `AO06${cleanIban}`;

            if (bankName && BANK_PREFIXES[bankName]) {
                const expectedPrefix = BANK_PREFIXES[bankName];
                const currentPrefix = cleanIban.substring(0, 4);

                if (currentPrefix !== expectedPrefix) {
                    showToast?.(`Este IBAN não corresponde ao ${bankName}. Verifique se selecionou o banco correto.`, "error");
                    return;
                }
            }

            if (!bankName || !holderName) {
                showToast?.("Preencha todos os campos.", "error");
                return;
            }

            await withLoading(async () => {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error("Sessão expirada. Acesse novamente.");
                }

                const payload = {
                    p_bank_name: bankName,
                    p_holder_name: holderName,
                    p_iban: finalIban
                };

                const { error } = await supabase.rpc(
                    mode === 'edit' ? 'update_bank_account' : 'add_bank_account',
                    payload
                );

                if (error) throw error;

                showToast?.("Dados salvos com sucesso!", "success");
                await checkExistingBank();
            }, "Salvando dados bancários...");

        } catch (err: any) {
            showToast?.(err.message || "Erro ao salvar dados.", "error");
        }
    };

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 z-[110] bg-[#FF6B00] dark:bg-zinc-950 transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="w-full max-w-[430px] mx-auto min-h-screen relative pb-10">
                {/* Header */}
                <header className="flex items-center px-4 py-4 text-white pt-4">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-white/20"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h1 className="flex-1 text-center text-lg font-medium mr-6">
                        {mode === 'edit' ? 'Minha conta' : 'Adicionar conta bancária'}
                    </h1>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <SpokeSpinner size="w-8 h-8" color="text-white" />
                    </div>
                ) : (
                    <div className="px-4 space-y-4">
                        {mode === 'edit' ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-[8px] p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 leading-tight">Sua conta bancária</h2>
                                        <p className="text-gray-500 text-sm font-medium pt-1">Dados cadastrados no sistema</p>
                                    </div>
                                    <button
                                        onClick={() => setMode('create')}
                                        className="w-10 h-10 bg-orange-50 rounded-[8px] flex items-center justify-center text-[#FF6B00] active:scale-90 transition-all font-medium"
                                    >
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Banco</span>
                                        <span className="text-sm font-medium text-slate-800">{bankName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Titular</span>
                                        <span className="text-sm font-medium text-slate-800">{holderName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">IBAN</span>
                                        <span className="text-sm font-mono font-medium text-slate-800 tracking-wider">AO06 {iban}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-[8px] p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 leading-tight">Dados bancários</h2>
                                        <p className="text-gray-500 text-sm font-medium">Vincule sua conta para receber</p>
                                    </div>
                                    <div className="w-10 h-10 bg-[#FF6B00] rounded-[8px] flex items-center justify-center text-white text-[8px] font-medium text-center p-1 leading-none uppercase">
                                        Depot
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="relative">
                                        <select
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full bg-[#FFF5F0] dark:bg-[#2d2d2d] border border-transparent rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-[#FF6B1A]/10 focus:border-[#FF6B1A]/30 dark:text-white text-[#2C3E50] appearance-none cursor-pointer font-semibold transition-all"
                                        >
                                            <option value="">Selecione o banco</option>
                                            <option value="Banco BAI">Banco BAI</option>
                                            <option value="Banco BFA">Banco BFA</option>
                                            <option value="Banco BIC">Banco BIC</option>
                                            <option value="Banco Atlântico">Banco Atlântico</option>
                                            <option value="Banco Sol">Banco Sol</option>
                                            <option value="Banco BNI">Banco BNI</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl">
                                            expand_more
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <input
                                            value={holderName}
                                            onChange={(e) => setHolderName(e.target.value)}
                                            className="w-full bg-[#FFF5F0] dark:bg-[#2d2d2d] border border-transparent rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-[#FF6B1A]/10 focus:border-[#FF6B1A]/30 dark:text-white text-[#2C3E50] placeholder-[#9CA3AF] font-semibold transition-all"
                                            placeholder="Nome completo do titular"
                                            type="text"
                                        />
                                    </div>

                                    <div className="relative">
                                        <input
                                            value={iban}
                                            onChange={handleIbanChange}
                                            maxLength={21}
                                            className="w-full bg-[#FFF5F0] dark:bg-[#2d2d2d] border border-transparent rounded-xl px-4 h-12 text-sm focus:ring-4 focus:ring-[#FF6B1A]/10 focus:border-[#FF6B1A]/30 dark:text-white text-[#2C3E50] placeholder-[#9CA3AF] font-mono font-semibold transition-all"
                                            placeholder="IBAN (21 dígitos)"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="bg-[#FFF5F0] dark:bg-zinc-800 rounded-xl p-4 mb-6 border border-orange-100 dark:border-zinc-700">
                                    <div className="items-start gap-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-[#FF6B1A] text-xl">info</span>
                                            <p className="text-[#2C3E50] dark:text-gray-300 text-xs font-bold">Importante:</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[#2C3E50] dark:text-gray-300 text-[10px] leading-tight font-medium">
                                                • Digite apenas os 21 números do seu IBAN.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveBank}
                                    disabled={loading}
                                    className="w-full h-12 bg-[#FF6B1A] text-white font-bold rounded-xl text-base active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-orange-500/10"
                                >
                                    {loading ? 'Salvando...' : existingBank ? 'Atualizar dados' : 'Salvar dados'}
                                </button>
                            </div>
                        )}


                        {mode !== 'edit' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-50 dark:border-zinc-800">
                                <div className="space-y-2 text-xs leading-relaxed text-gray-500 font-medium italic">
                                    <p>• O IBAN deve ter exatamente 21 dígitos numéricos.</p>
                                    <p>• Todos os seus ganhos serão transferidos para esta conta.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddBankModal;
