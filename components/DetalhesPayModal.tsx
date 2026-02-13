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
                <header className="pt-6 px-6 flex justify-between items-center bg-[#FF6B00] sticky top-0 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 hover:bg-white/10 rounded-[8px] transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">chevron_left</span>
                    </button>
                    <h1 className="text-lg font-medium text-white lowercase">detalhes da transferência</h1>
                    <button
                        onClick={handleShare}
                        className="p-2 -mr-2 hover:bg-white/10 rounded-[8px] transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">share</span>
                    </button>
                </header>

                <main className="flex-grow px-6 pt-10 pb-32">
                    {/* Status Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-white/20 rounded-[8px] flex items-center justify-center mb-4 backdrop-blur-sm">
                            <div className="w-14 h-14 bg-white rounded-[8px] flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-[#FF6B00] text-3xl font-bold">check</span>
                            </div>
                        </div>
                        <p className="text-white/90 font-medium mb-1 lowercase tracking-wider text-[10px]">depósito solicitado</p>
                        <h2 className="text-4xl font-medium text-white tracking-tight">
                            {amount.toLocaleString('pt-AO')} Kz
                        </h2>
                        <p className="text-white/80 text-xs font-medium mt-2">{formatDate(deposit?.created_at)}</p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white rounded-[8px] p-6 shadow-xl text-gray-900">
                        <div className="space-y-6">
                            {/* Recipient Information */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-2">
                                    <h3 className="text-[10px] font-medium text-[#FF6B00] lowercase tracking-widest">informações do destinatário</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium lowercase">Beneficiário</span>
                                        <span className="font-medium text-gray-900 text-sm text-right">The Home Depot (SU), LDA</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium lowercase">Banco</span>
                                        <span className="font-medium text-gray-900 text-sm">{deposit?.nome_banco || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium lowercase">IBAN</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium text-gray-900 text-[10px] break-all text-right">{deposit?.iban || '...'}</span>
                                            <button
                                                onClick={() => deposit?.iban && handleCopy(deposit.iban)}
                                                className="bg-[#FF6B00]/10 p-1.5 rounded-[4px] text-[#FF6B00] active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Metadata */}
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-2 pt-4">
                                    <h3 className="text-[10px] font-medium text-[#FF6B00] lowercase tracking-widest">dados da transação</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium lowercase">ID</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 text-sm">{deposit?.id?.substring(0, 12)}...</span>
                                            <button
                                                onClick={() => deposit?.id && handleCopy(deposit.id)}
                                                className="bg-[#FF6B00]/10 p-1.5 rounded-[4px] text-[#FF6B00] active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium lowercase">método</span>
                                        <span className="font-medium text-gray-900 text-sm lowercase">{deposit?.payment_method === 'USDT' ? 'usdt (trc20)' : 'transferência bancária'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium lowercase">valor pago</span>
                                        <span className="font-medium text-[#FF6B00] text-lg">{amount.toLocaleString('pt-AO')} Kz</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-orange-50 rounded-[8px] border border-orange-100">
                                <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic lowercase">
                                    por favor, anexe o comprovativo na seção de histórico caso o valor não seja creditado em até 30 minutos.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="fixed bottom-0 left-0 right-0 p-6 bg-[#FF6B00] z-10 flex flex-col items-center">
                    <button
                        onClick={() => { onClose(); onNavigate('home'); }}
                        className="w-full bg-white text-[#FF6B00] font-medium py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined font-medium">check_circle</span>
                        <span>Terminar</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default DetalhesPayModal;
