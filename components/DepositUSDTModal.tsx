import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';

interface DepositUSDTModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    data?: any;
    onNavigate: (page: string, data?: any) => void;
}

const DepositUSDTModal: React.FC<DepositUSDTModalProps> = ({ isOpen, onClose, showToast, data, onNavigate }) => {
    const { withLoading } = useLoading();
    const [walletData, setWalletData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const amountUsdt = data?.amountUsdt || 0;
    const amountKz = data?.amountKz || 0;
    const passedRate = data?.exchangeRate || 0;

    const walletAddress = walletData?.endereco_carteira || "Endereço de pagamento USDT indisponível";
    const recipientName = walletData?.nome_destinatario || "Carregando...";

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            fetchWallet();
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchWallet = async () => {
        try {
            const { data, error } = await supabase
                .from('usdt_empresarial')
                .select('*')
                .eq('ativo', true)
                .single();

            if (!error && data) {
                setWalletData(data);
            }
        } catch (err) {
            console.error("Wallet fetch error", err);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        showToast?.('Endereço copiado!', 'success');
    };

    const handleConfirm = async () => {
        if (!amountUsdt || amountUsdt < 4) {
            showToast?.("Valor inválido.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await withLoading(async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Sessão expirada.");

                const { data: rpcData, error } = await supabase.rpc('create_usdt_deposit', {
                    p_amount_usdt: amountUsdt,
                    p_exchange_rate: passedRate
                });

                if (error) throw new Error("Erro de conexão.");
                if (rpcData && !rpcData.success) throw new Error(rpcData.message);

                const depositData = rpcData.data || {
                    amount: amountKz,
                    status: 'pending',
                    payment_method: 'USDT',
                    created_at: new Date().toISOString(),
                    bank_name: 'USDT (TRC20)',
                    nome_banco: 'USDT (TRC20)',
                    iban: walletAddress,
                    nome_destinatario: recipientName
                };

                onClose();

                onNavigate('detalhes-pay', {
                    deposit: {
                        ...depositData,
                        nome_destinatario: recipientName,
                        nome_banco: 'USDT (TRC20)',
                        iban: walletAddress
                    }
                });

                return rpcData.message || 'Solicitação enviada!';
            }, 'Solicitação enviada! Aguarde a confirmação.');

        } catch (error: any) {
            console.error(error);
            showToast?.(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[110] bg-white transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col min-h-screen font-sans antialiased text-black">
                <header className="bg-[#FF6B1A] pb-16 pt-4 px-4">
                    <div className="relative z-10 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-white text-[28px]">chevron_left</span>
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Recarregar USDT</h1>
                        <div className="w-11"></div>
                    </div>
                </header>

                <main className="flex-1 px-5 pt-6 pb-32 max-w-md mx-auto w-full transition-all duration-300">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="size-16 bg-[#26a17b]/10 rounded-xl flex items-center justify-center mb-4 ring-4 ring-[#26a17b]/5">
                            <span className="material-symbols-outlined text-[#26a17b]" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>currency_bitcoin</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mb-2 text-black">Depósito cripto</h1>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] font-medium">
                            Recarregue sua conta usando USDT na rede <span className="text-black font-semibold">TRON (TRC20)</span>.
                        </p>
                    </div>

                    <div className="bg-[#FFF5F0] rounded-xl p-6 mb-6 border-none text-center shadow-sm">
                        <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest mb-1">valor a enviar</p>
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-3xl font-bold text-[#00C853]">{amountUsdt.toFixed(2)}</span>
                            <span className="text-sm font-bold text-[#00C853] mt-2">USDT</span>
                        </div>
                        <div className="mt-2 text-[12px] text-gray-400 font-semibold bg-white/50 rounded-full py-1 px-4 inline-block shadow-sm">
                            equivalente a <span className="text-[#2C3E50]">{amountKz.toLocaleString('pt-AO')} Kz</span>
                        </div>
                    </div>

                    <div className="bg-[#FFF5F0] rounded-xl p-6 border-none shadow-sm">
                        <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest mb-6 text-center">dados para transferência</h3>

                        <div className="flex flex-col gap-1 mb-4 text-center">
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">destinatário</label>
                            <p className="text-[#2C3E50] font-bold text-sm tracking-wide">{recipientName}</p>
                        </div>

                        <div className="flex justify-center mb-8">
                            <div className="p-3 bg-white rounded-xl relative group shadow-md border border-orange-50">
                                <div className="size-48 bg-gray-50 flex items-center justify-center overflow-hidden rounded-xl">
                                    <img loading="lazy" decoding="async"
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`}
                                        alt="USDT TRC20 QR Code"
                                        className="size-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center">endereço da carteira (trc20)</label>
                            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-orange-100/50 shadow-sm">
                                <p className="flex-1 text-[11px] font-mono font-bold text-[#2C3E50] truncate text-center select-all">{walletAddress}</p>
                                <button
                                    onClick={handleCopy}
                                    className="size-10 bg-[#FF6B1A] rounded-xl flex items-center justify-center text-white active:scale-95 transition-all shadow-md shadow-orange-500/20 hover:brightness-105"
                                >
                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100 shadow-sm">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                            <div className="flex flex-col">
                                <p className="text-black text-xs font-bold uppercase tracking-tight">aviso importante</p>
                                <p className="text-gray-600 text-[11px] leading-relaxed mt-1 font-medium italic">
                                    Envie apenas <span className="font-semibold text-black underline">USDT via rede TRC20</span>. O envio para outras redes resultará na perda dos fundos.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="fixed bottom-0 max-w-md w-full p-4 bg-white/95 border-t border-gray-100 z-50">
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting || !walletData}
                        className={`w-full h-12 bg-[#00C853] text-white font-bold rounded-xl text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSubmitting || !walletData ? 'opacity-50 grayscale shadow-none' : 'shadow-lg shadow-green-100'}`}
                    >
                        <span>Confirmar depósito</span>
                        <span className="material-symbols-outlined font-medium text-[20px]">send_money</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DepositUSDTModal;
