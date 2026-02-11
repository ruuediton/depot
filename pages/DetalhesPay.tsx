import React from 'react';

interface Props {
    onNavigate: (page: string) => void;
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
}

const DetalhesPay: React.FC<Props> = ({ onNavigate, data, showToast }) => {
    const deposit = data?.deposit;
    const amount = deposit?.amount || deposit?.valor_deposito || 0;

    // Formatting date
    const formatDate = (dateString?: string) => {
        if (!dateString) return new Date().toLocaleString('pt-PT');
        return new Date(dateString).toLocaleString('pt-PT', {
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

    return (
        <div className="bg-[#f27f0d] font-sans text-white antialiased min-h-screen flex flex-col relative max-w-[430px] mx-auto shadow-2xl">
            {/* Header */}
            <header className="pt-6 px-6 flex justify-between items-center bg-[#f27f0d] sticky top-0 z-10">
                <button
                    onClick={() => onNavigate('deposit')}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-white">chevron_left</span>
                </button>
                <h1 className="text-lg font-bold text-white">Detalhes da Transferência</h1>
                <button
                    onClick={() => showToast?.('Funcionalidade de partilha em breve!', 'info')}
                    className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-white">share</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-grow px-6 pt-10 pb-32 overflow-y-auto no-scrollbar">
                {/* Success Status Header */}
                <div className="flex flex-col items-center mb-10 translate-y-0 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/10">
                            <span className="material-symbols-outlined text-[#f27f0d] text-3xl font-bold">check</span>
                        </div>
                    </div>
                    <p className="text-white/90 font-bold mb-1 uppercase tracking-wider text-[10px]">Depósito Solicitado</p>
                    <h2 className="text-4xl font-black text-white tracking-tight">
                        {amount.toLocaleString('pt-AO')} Kz
                    </h2>
                    <p className="text-white/80 text-xs font-semibold mt-2">{formatDate(deposit?.created_at)}</p>
                </div>

                {/* Info Blocks */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards p-1">
                    {/* Recipient Information */}
                    <div className="space-y-4">
                        <div className="border-b border-white/20 pb-2">
                            <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Informações do Destinatário</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm font-medium">Nome do Beneficiário</span>
                                <span className="font-bold text-white text-sm text-right">The Home Depot (SU), LDA</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm font-medium">Banco</span>
                                <span className="font-bold text-white text-sm">{deposit?.nome_banco || 'Carregando...'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm font-medium">IBAN</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-white text-xs tracking-tight">{deposit?.iban || '...'}</span>
                                    <button
                                        onClick={() => deposit?.iban && handleCopy(deposit.iban)}
                                        className="bg-white/20 hover:bg-white/30 p-1.5 rounded text-white transition-colors active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Metadata */}
                    <div className="space-y-4">
                        <div className="border-b border-white/20 pb-2 pt-4">
                            <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Metadados da Transação</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm font-medium">ID da Transação</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{deposit?.id?.substring(0, 12)}...</span>
                                    <button
                                        onClick={() => deposit?.id && handleCopy(deposit.id)}
                                        className="bg-white/20 hover:bg-white/30 p-1.5 rounded text-white transition-colors active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm font-medium">Método de Pagamento</span>
                                <span className="font-bold text-white text-sm">{deposit?.payment_method === 'USDT' ? 'USDT (TRC20)' : 'Transferência Bancária'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/80 text-sm font-medium">Valor Pago</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-white text-base text-shadow-sm">{amount.toLocaleString('pt-AO')} Kz</span>
                                    <button
                                        onClick={() => handleCopy(amount.toString())}
                                        className="bg-white/20 hover:bg-white/30 p-1.5 rounded text-white transition-colors active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note Section */}
                    <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Nota Importante</span>
                        <p className="text-xs text-white/90 font-medium leading-relaxed">
                            Por favor, anexe o comprovativo de transferência na seção de histórico de depósitos caso o valor não seja creditado em até 30 minutos.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer Action */}
            <footer className="absolute bottom-0 left-0 right-0 p-6 bg-[#f27f0d]/95 backdrop-blur-sm border-t border-white/10 z-10 flex flex-col items-center">
                <button
                    onClick={() => showToast?.('Recibo gerado com sucesso!', 'success')}
                    className="w-full bg-white text-[#f27f0d] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-all active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined font-bold">file_download</span>
                    Baixar Recibo
                </button>
                {/* iOS Home Indicator Space */}
                <div className="w-32 h-1 bg-white/50 rounded-full mt-6"></div>
            </footer>
        </div>
    );
};

export default DetalhesPay;
