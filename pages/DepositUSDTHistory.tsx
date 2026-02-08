
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
    onNavigate: (page: any) => void;
}

const DepositUSDTHistory: React.FC<Props> = ({ onNavigate }) => {
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useLoading();

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("UsuÃ¡rio nÃ£o autenticado");

            const { data, error } = await supabase
                .from('depositos_usdt')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDeposits(data || []);
        } catch (err: any) {
            console.error("Error fetching USDT deposits:", err);
            showToast?.(err.message || "Erro ao carregar histÃ³rico", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'sucedido':
            case 'completo':
            case 'aprovado':
            case 'sucesso':
                return 'text-green-600 bg-green-50';
            case 'pendente':
            case 'processando':
                return 'text-blue-600 bg-blue-50';
            case 'falha':
            case 'falhou':
            case 'rejeitado':
            case 'rejeitada':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-500 bg-gray-50';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white text-black font-sans antialiased">
            {/* Header */}
            <header className="header-gradient-mixture pb-16 pt-4 px-4">

                <div className="relative z-10 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('deposit-usdt')}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black text-white tracking-tight">HistÃ³rico USDT</h1>
                    <div className="w-11"></div>
                </div>
            </header>

            <main className="flex-1 px-4 pt-6 pb-24 relative z-20 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
                    </div>
                ) : deposits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">receipt_long</span>
                        <p className="text-sm font-medium">Nenhum registro encontrado</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {deposits.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm shadow-gray-200/50">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor Depositado</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-[#111]">{Number(item.amount_usdt).toFixed(2)}</span>
                                            <span className="text-[10px] font-bold text-gray-500">USDT</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                        {item.status || 'Pendente'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Data</p>
                                        <p className="text-[12px] font-bold text-gray-700">
                                            {new Date(item.created_at).toLocaleDateString('pt-AO')} {new Date(item.created_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor em Kz</p>
                                        <p className="text-[12px] font-bold text-[#00C853]">
                                            {Number(item.amount_kz).toLocaleString('pt-AO')} Kz
                                        </p>
                                    </div>
                                </div>

                                {item.tx_hash && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID da TransaÃ§Ã£o</p>
                                        <p className="text-[11px] font-mono text-gray-500 break-all bg-gray-50 p-2 rounded-lg border border-gray-100 italic">
                                            {item.tx_hash}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DepositUSDTHistory;
