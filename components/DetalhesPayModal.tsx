import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface DetalhesPayModalProps {
    isOpen: boolean;
    onClose: () => void;
    data?: {
        deposit?: {
            amount?: number;
            valor_deposito?: number;
            nome_destinatario: string;
            nome_banco: string;
            iban: string;
            id: string;
            created_at: string;
            payment_method?: string;
        }
    };
    showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onNavigate: (page: string) => void;
}

const DetalhesPayModal: React.FC<DetalhesPayModalProps> = ({ isOpen, onClose, data, showToast, onNavigate }) => {
    const deposit = data?.deposit;
    const amount = deposit?.amount || deposit?.valor_deposito || 0;
    const [managerLink, setManagerLink] = useState<string>('');
    const [userPhone, setUserPhone] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            fetchInfo();
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchInfo = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('phone')
                    .eq('id', user.id)
                    .single();
                if (profile) setUserPhone(profile.phone || '');
            }

            const { data: linkData } = await supabase
                .from('atendimento_links')
                .select('whatsapp_gerente_url')
                .limit(1)
                .single();
            if (linkData?.whatsapp_gerente_url) setManagerLink(linkData.whatsapp_gerente_url);
        } catch (err) {
            console.error('Erro ao buscar informações para partilha:', err);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return new Date().toLocaleString('pt-AO');
        return new Date(dateString).toLocaleString('pt-AO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast?.('Copiado para a área de transferência!', 'success');
    };

    const handleShare = () => {
        if (!managerLink) {
            showToast?.('Link do gerente não disponível', 'error');
            return;
        }

        const message = `Olá! Realizei um depósito de ${amount.toLocaleString('pt-AO')} Kz através do banco ${deposit?.nome_banco || 'N/A'}. \n\nDetalhes:\nTelefone: ${userPhone}\nID Transação: ${deposit?.id?.substring(0, 12)}`;
        const encodedMessage = encodeURIComponent(message);

        let targetUrl = managerLink;
        if (targetUrl.includes('?')) {
            targetUrl += `&text=${encodedMessage}`;
        } else {
            targetUrl += `?text=${encodedMessage}`;
        }

        window.open(targetUrl, '_blank');
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[160] bg-[#FF6B00] transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col min-h-screen text-white font-sans antialiased">
                {/* Header */}
                <header className="py-4 px-6 flex justify-between items-center bg-[#FF6B00] sticky top-0 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">chevron_left</span>
                    </button>
                    <h1 className="text-md font-medium text-white lowercase tracking-tight">detalhes da transferência</h1>
                    <button
                        onClick={handleShare}
                        className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">share</span>
                    </button>
                </header>

                <main className="flex-grow px-4 pt-4 pb-28">
                    {/* Info Card - Improved Positioning */}
                    <div className="bg-white rounded-[20px] p-5 shadow-2xl text-gray-900 mx-auto max-w-md">
                        <div className="space-y-5">
                            {/* Recipient Information */}
                            <div className="space-y-3">
                                <div className="border-b border-gray-100 pb-2">
                                    <h3 className="text-[10px] font-bold text-[#FF6B00] lowercase tracking-widest opacity-80">informações do destinatário</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-gray-400 text-xs font-medium lowercase shrink-0 mt-0.5">Beneficiário</span>
                                        <span className="font-semibold text-gray-900 text-sm text-right leading-tight">The Home Depot (SU), LDA</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-gray-400 text-xs font-medium lowercase shrink-0">Banco</span>
                                        <span className="font-semibold text-gray-900 text-sm text-right">{deposit?.nome_banco || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-gray-400 text-xs font-medium lowercase shrink-0">IBAN</span>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="font-mono font-bold text-gray-800 text-[11px] truncate">{deposit?.iban || '...'}</span>
                                            <button
                                                onClick={() => deposit?.iban && handleCopy(deposit.iban)}
                                                className="bg-[#FF6B00]/10 p-1.5 rounded-lg text-[#FF6B00] active:scale-90 shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Metadata */}
                            <div className="space-y-3">
                                <div className="border-b border-gray-100 pb-2 pt-2">
                                    <h3 className="text-[10px] font-bold text-[#FF6B00] lowercase tracking-widest opacity-80">dados da transação</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-gray-400 text-xs font-medium lowercase shrink-0">ID Transação</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-900 text-xs">#{deposit?.id?.substring(0, 8)}</span>
                                            <button
                                                onClick={() => deposit?.id && handleCopy(deposit.id)}
                                                className="bg-[#FF6B00]/5 p-1 rounded-md text-[#FF6B00]/70 active:scale-90"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span className="text-gray-400 text-xs font-medium lowercase shrink-0">método</span>
                                        <span className="font-semibold text-gray-900 text-xs lowercase bg-gray-50 px-2 py-0.5 rounded text-right">{deposit?.payment_method === 'USDT' ? 'usdt (trc20)' : 'transferência'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100 mt-2">
                                        <span className="text-gray-500 text-sm font-bold lowercase">valor pago</span>
                                        <span className="font-bold text-[#FF6B00] text-xl tracking-tight">{amount.toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic text-center lowercase">
                                    por favor, anexe o comprovativo na seção de histórico caso o valor não seja creditado em até 30 minutos.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[#FF6B00] z-20">
                    <button
                        onClick={() => { onClose(); onNavigate('home'); }}
                        className="w-full bg-white text-[#FF6B00] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all text-lg"
                    >
                        <span className="material-symbols-outlined font-bold">check_circle</span>
                        <span>Terminar</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DetalhesPayModal;
