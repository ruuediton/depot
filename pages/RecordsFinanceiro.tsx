
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
    onNavigate: (page: any) => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

type TabType = 'bank_deposit' | 'usdt_deposit' | 'withdrawal' | 'gifts' | 'tasks';

const RecordsFinanceiro: React.FC<Props> = ({ onNavigate, showToast }) => {
    const [activeTab, setActiveTab] = useState<TabType>('bank_deposit');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const { withLoading } = useLoading();

    const fetchRecords = useCallback(async (tab: TabType) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                onNavigate('login');
                return;
            }

            let query;
            switch (tab) {
                case 'bank_deposit':
                    query = supabase
                        .from('depositos_clientes')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });
                    break;
                case 'usdt_deposit':
                    query = supabase
                        .from('depositos_usdt')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });
                    break;
                case 'withdrawal':
                    query = supabase
                        .from('retirada_clientes')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('data_de_criacao', { ascending: false });
                    break;
                case 'gifts':
                    query = supabase
                        .from('bonus_transacoes')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('status', 'success')
                        .order('data_recebimento', { ascending: false });
                    break;
                case 'tasks':
                    query = supabase
                        .from('compras_clientes')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('data_compra', { ascending: false });
                    break;
            }

            const { data: result, error } = await query;
            if (error) throw error;
            setData(result || []);
        } catch (err: any) {
            console.error(`Error fetching ${tab}:`, err);
            showToast?.(err.message || "Erro ao carregar dados", "error");
        } finally {
            setLoading(false);
        }
    }, [onNavigate, showToast]);

    useEffect(() => {
        fetchRecords(activeTab);
    }, [activeTab, fetchRecords]);

    const getStatusStyle = (status: string, tab: TabType) => {
        const s = status?.toLowerCase() || '';
        if (['sucedido', 'concluído', 'completo', 'aprovado', 'sucesso', 'processado'].includes(s)) {
            return 'bg-green-500/10 text-green-600 border-green-500/20';
        }
        if (['pendente', 'processando', 'em_andamento', 'revisão'].includes(s)) {
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        }
        if (['falha', 'falhou', 'rejeitado', 'rejeitada', 'cancelado'].includes(s)) {
            return 'bg-red-500/10 text-red-600 border-red-500/20';
        }
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    };

    const renderItem = (item: any) => {
        switch (activeTab) {
            case 'bank_deposit':
                return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex justify-between items-center group active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#f27f0d]">
                                <span className="material-symbols-outlined">account_balance</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">{item.nome_banco || 'Depósito Bancário'}</p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    {new Date(item.created_at).toLocaleDateString('pt-AO')} às {new Date(item.created_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-[#f27f0d] text-sm">+ {item.valor_deposito?.toLocaleString()} Kz</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(item.estado_de_pagamento, activeTab)}`}>
                                {item.estado_de_pagamento}
                            </span>
                        </div>
                    </div>
                );
            case 'usdt_deposit':
                return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3 active:scale-[0.98] transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined">currency_exchange</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{item.amount_usdt} USDT</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Equiv: {item.amount_kz?.toLocaleString()} Kz</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(item.status, activeTab)}`}>
                                {item.status || 'Pendente'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{new Date(item.created_at).toLocaleDateString('pt-AO')}</span>
                            <span className="font-mono truncate ml-4 opacity-50">{item.tx_hash?.slice(0, 16)}...</span>
                        </div>
                    </div>
                );
            case 'withdrawal':
                const liq = item.valor_solicitado - (item.taxa_12_porcento || 0);
                return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3 active:scale-[0.98] transition-all">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{item.nome_do_banco}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{item.iban?.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-red-500 text-sm">- {item.valor_solicitado?.toLocaleString()} Kz</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(item.estado_da_retirada, activeTab)}`}>
                                    {item.estado_da_retirada}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Líquido:</span>
                            <span className="text-xs font-black text-green-600">{liq.toLocaleString()} Kz</span>
                        </div>
                    </div>
                );
            case 'gifts':
                return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                                <span className="material-symbols-outlined">redeem</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Resgate de Código</p>
                                <p className="text-[10px] text-slate-400 font-medium">#{item.codigo_presente}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-green-600 text-sm">+ {item.valor_recebido?.toLocaleString()} Kz</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(item.data_recebimento).toLocaleDateString('pt-AO')}</p>
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <span className="material-symbols-outlined">task_alt</span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Comissão de Tarefa</p>
                                <p className="text-[10px] text-slate-400 font-medium">Pedido: #{item.id?.toString().slice(-6)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-slate-900 text-sm">{item.preco_produto?.toLocaleString()} Kz</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(item.estado_compra, activeTab)}`}>
                                {item.estado_compra || 'Concluído'}
                            </span>
                        </div>
                    </div>
                );
        }
    };

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'bank_deposit', label: 'Bancos', icon: 'account_balance' },
        { id: 'usdt_deposit', label: 'USDT', icon: 'currency_exchange' },
        { id: 'withdrawal', label: 'Retiradas', icon: 'payments' },
        { id: 'gifts', label: 'Brindes', icon: 'redeem' },
        { id: 'tasks', label: 'Tarefas', icon: 'task' },
    ];

    return (
        <div className="bg-[#f27f0d] flex flex-col min-h-screen font-sans antialiased text-slate-900 overflow-hidden">
            {/* Header modern with back button */}
            <header className="px-6 pt-12 pb-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-black text-white tracking-tight">Registros Financeiros</h1>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>

                {/* Tab Switcher - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-white text-[#f27f0d] shadow-lg shadow-orange-900/20 font-black'
                                    : 'bg-white/10 text-white/70 font-bold border border-white/5'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            <span className="text-xs">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Content Area - White background container */}
            <main className="flex-1 bg-slate-50 rounded-t-[40px] px-6 pt-10 pb-32 overflow-y-auto no-scrollbar shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <SpokeSpinner size="w-10 h-10" color="text-[#f27f0d]" />
                        <p className="text-xs text-slate-400 font-black tracking-widest uppercase animate-pulse">Consultando Dados...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 text-center px-10">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl">inventory_2</span>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Sem Movimentação</p>
                        <p className="text-[11px] font-medium text-slate-300">Não encontramos registros nesta categoria.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listagem Recente</h2>
                            <span className="text-[10px] font-black text-[#f27f0d] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                {data.length} ITENS
                            </span>
                        </div>
                        {data.map(renderItem)}
                    </div>
                )}
            </main>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .material-symbols-outlined {
           font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
        </div>
    );
};

export default RecordsFinanceiro;
