import React from 'react';

interface Props {
    onNavigate: (page: string) => void;
    data?: {
        deposit?: {
            amount: number;
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
        <div className="bg-white font-sans text-slate-800 antialiased min-h-screen flex flex-col relative max-w-[430px] mx-auto shadow-2xl">
            {/* Header */}
            <header className="pt-6 px-6 flex justify-between items-center bg-white sticky top-0 z-10">
                <button
                    onClick={() => onNavigate('deposit')}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-600">chevron_left</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900">Detalhes da Transferência</h1>
                <button
                    onClick={() => showToast?.('Funcionalidade de partilha em breve!', 'info')}
                    className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-600">share</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-grow px-6 pt-10 pb-32 overflow-y-auto no-scrollbar">
                {/* Success Status Header */}
                <div className="flex flex-col items-center mb-10 translate-y-0 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-20 h-20 bg-[#f27f0d]/10 rounded-full flex items-center justify-center mb-4">
                        <div className="w-14 h-14 bg-[#f27f0d] rounded-full flex items-center justify-center shadow-lg shadow-[#f27f0d]/30">
                            <span className="material-symbols-outlined text-white text-3xl font-bold">check</span>
                        </div>
                    </div>
                    <p className="text-[#f27f0d] font-bold mb-1 uppercase tracking-wider text-[10px]">Depósito Solicitado</p>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        {deposit?.amount?.toLocaleString('pt-AO')} Kz
                    </h2>
                    <p className="text-slate-500 text-xs font-semibold mt-2">{formatDate(deposit?.created_at)}</p>
                </div>

                {/* Info Blocks */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
                    {/* Recipient Information */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informações do Destinatário</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Nome do Beneficiário</span>
                                <span className="font-bold text-slate-900 text-sm">{deposit?.nome_destinatario || 'Carregando...'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Banco</span>
                                <span className="font-bold text-slate-900 text-sm">{deposit?.nome_banco || 'Carregando...'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">IBAN</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">{deposit?.iban || '...'}</span>
                                    <button
                                        onClick={() => deposit?.iban && handleCopy(deposit.iban)}
                                        className="bg-[#f27f0d]/10 hover:bg-[#f27f0d]/20 p-1.5 rounded text-[#f27f0d] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">content_copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Metadata */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-2 pt-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadados da Transação</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">ID da Transação</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">{deposit?.id?.substring(0, 12)}...</span>
                                    <button
                                        onClick={() => deposit?.id && handleCopy(deposit.id)}
                                        className="bg-[#f27f0d]/10 hover:bg-[#f27f0d]/20 p-1.5 rounded text-[#f27f0d] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Método de Pagamento</span>
                                <span className="font-bold text-slate-900 text-sm">{deposit?.payment_method === 'USDT' ? 'USDT (TRC20)' : 'Transferência Bancária'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm font-medium">Valor Pago</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-[#f27f0d] text-base">{deposit?.amount?.toLocaleString('pt-AO')} Kz</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note Section */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nota Importante</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            Por favor, anexe o comprovativo de transferência na seção de histórico de depósitos caso o valor não seja creditado em até 30 minutos.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer Action */}
            <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-10 flex flex-col items-center">
                <button
                    onClick={() => showToast?.('Recibo gerado com sucesso!', 'success')}
                    className="w-full bg-[#f27f0d] hover:bg-[#f27f0d]/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#f27f0d]/20 transition-all active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined font-bold">file_download</span>
                    Baixar Recibo
                </button>
                {/* iOS Home Indicator Space */}
                <div className="w-32 h-1 bg-slate-200 rounded-full mt-6"></div>
            </footer>
        </div>
    );
};

export default DetalhesPay;
