import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
    onNavigate: (page: any) => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

type TabType = 'gifts' | 'tasks' | 'transfers';

interface RecordItem {
    id: string | number;
    source: string;
    title: string;
    amount: number;
    date: Date;
    status: string;
    isIncome: boolean;
    icon: string;
    colorClass: string;
    subtext?: string;
}

const RecordsFinanceiro: React.FC<Props> = ({ onNavigate, showToast }) => {
    const [activeTab, setActiveTab] = useState<TabType>('gifts');
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const formatRecord = (source: string, data: any): RecordItem => {
        switch (source) {
            case 'bonus_transacoes':
                return {
                    id: data.id,
                    source: 'gifts',
                    title: data.origem_bonus || 'Resgate de código',
                    amount: Number(data.valor_recebido),
                    date: new Date(data.data_recebimento),
                    status: data.status || 'Sucesso',
                    isIncome: true,
                    icon: 'redeem',
                    colorClass: 'text-orange-500 bg-orange-50',
                    subtext: data.codigo_presente ? `Código: ${data.codigo_presente}` : undefined
                };
            case 'tarefas_diarias':
                return {
                    id: data.id,
                    source: 'tasks',
                    title: 'Renda diária',
                    amount: Number(data.renda_coletada),
                    date: new Date(data.data_atribuicao),
                    status: data.status || 'Sucesso',
                    isIncome: true,
                    icon: 'task_alt',
                    colorClass: 'text-blue-500 bg-blue-50'
                };
            case 'historico_compras':
                return {
                    id: data.id,
                    source: 'tasks',
                    title: `Compra: ${data.nome_produto}`,
                    amount: Number(data.preco),
                    date: new Date(data.data_compra),
                    status: data.status || 'Confirmado',
                    isIncome: false,
                    icon: 'shopping_bag',
                    colorClass: 'text-indigo-500 bg-indigo-50'
                };
            case 'depositos_clientes':
                return {
                    id: data.id,
                    source: 'transfers',
                    title: `Depósito: ${data.nome_banco || 'Banco'}`,
                    amount: Number(data.valor_deposito),
                    date: new Date(data.created_at),
                    status: data.estado_de_pagamento || 'Pendente',
                    isIncome: true,
                    icon: 'account_balance',
                    colorClass: 'text-green-500 bg-green-50'
                };
            case 'depositos_usdt':
                return {
                    id: data.id,
                    source: 'transfers',
                    title: 'Depósito: USDT',
                    amount: Number(data.amount_kz || 0),
                    date: new Date(data.created_at),
                    status: data.status || 'Pendente',
                    isIncome: true,
                    icon: 'currency_exchange',
                    colorClass: 'text-emerald-500 bg-emerald-50',
                    subtext: `${data.amount_usdt} USDT`
                };
            case 'retirada_clientes':
                return {
                    id: data.id,
                    source: 'transfers',
                    title: `Retirada: ${data.nome_do_banco || 'Banco'}`,
                    amount: Number(data.valor_solicitado),
                    date: new Date(data.data_de_criacao || (data.data_da_retirada + 'T' + data.hora_da_retirada)),
                    status: data.estado_da_retirada || 'Pendente',
                    isIncome: false,
                    icon: 'payments',
                    colorClass: 'text-red-500 bg-red-50'
                };
            default:
                return {
                    id: data.id,
                    source: 'unknown',
                    title: 'Transação',
                    amount: 0,
                    date: new Date(),
                    status: 'Desconhecido',
                    isIncome: true,
                    icon: 'help',
                    colorClass: 'text-gray-500 bg-gray-50'
                };
        }
    };

    const fetchRecords = useCallback(async (tab: TabType) => {
        setLoading(true);
        setIsTransitioning(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                onNavigate('login');
                return;
            }

            let combinedRecords: RecordItem[] = [];

            if (tab === 'gifts') {
                const { data: bonusData } = await supabase
                    .from('bonus_transacoes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('data_recebimento', { ascending: false });

                if (bonusData) {
                    combinedRecords = bonusData.map(d => formatRecord('bonus_transacoes', d));
                }
            } else if (tab === 'tasks') {
                const [tasksRes, purchasesRes] = await Promise.all([
                    supabase.from('tarefas_diarias').select('*').eq('user_id', user.id).order('data_atribuicao', { ascending: false }),
                    supabase.from('historico_compras').select('*').eq('user_id', user.id).order('data_compra', { ascending: false })
                ]);

                const tasks = (tasksRes.data || []).map(d => formatRecord('tarefas_diarias', d));
                const purchases = (purchasesRes.data || []).map(d => formatRecord('historico_compras', d));

                combinedRecords = [...tasks, ...purchases].sort((a, b) => b.date.getTime() - a.date.getTime());
            } else if (tab === 'transfers') {
                const [bankDepRes, usdtDepRes, withdrawRes] = await Promise.all([
                    supabase.from('depositos_clientes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                    supabase.from('depositos_usdt').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                    supabase.from('retirada_clientes').select('*').eq('user_id', user.id).order('data_de_criacao', { ascending: false })
                ]);

                const bankDeps = (bankDepRes.data || []).map(d => formatRecord('depositos_clientes', d));
                const usdtDeps = (usdtDepRes.data || []).map(d => formatRecord('depositos_usdt', d));
                const withdraws = (withdrawRes.data || []).map(d => formatRecord('retirada_clientes', d));

                combinedRecords = [...bankDeps, ...usdtDeps, ...withdraws].sort((a, b) => b.date.getTime() - a.date.getTime());
            }

            setRecords(combinedRecords);
        } catch (err: any) {
            console.error(`Error fetching ${tab}:`, err);
            showToast?.(err.message || "Erro ao carregar dados", "error");
        } finally {
            setLoading(false);
            // Pequeno delay para suavizar a transição visual
            setTimeout(() => setIsTransitioning(false), 300);
        }
    }, [onNavigate, showToast]);

    useEffect(() => {
        fetchRecords(activeTab);
    }, [activeTab, fetchRecords]);

    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (['sucedido', 'concluido', 'concluído', 'completo', 'aprovado', 'sucesso', 'processado', 'confirmado'].includes(s)) {
            return 'bg-green-100 text-green-600';
        }
        if (['pendente', 'processando', 'em_andamento', 'revisão', 'em andamento'].includes(s)) {
            return 'bg-blue-100 text-blue-600';
        }
        if (['falha', 'falhou', 'rejeitado', 'rejeitada', 'cancelado', 'expirado'].includes(s)) {
            return 'bg-red-100 text-red-600';
        }
        return 'bg-gray-100 text-gray-500';
    };

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'gifts', label: 'Brindes', icon: 'redeem' },
        { id: 'tasks', label: 'Tarefas', icon: 'task' },
        { id: 'transfers', label: 'Transferências', icon: 'sync_alt' },
    ];

    return (
        <div className="bg-[#f27f0d] flex flex-col min-h-screen font-sans antialiased text-slate-900 overflow-hidden">
            {/* Header modern with back button */}
            <header className="px-6 pt-12 pb-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">Registros financeiros</h1>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-3 gap-2 bg-white/10 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all duration-500 ${activeTab === tab.id
                                ? 'bg-white text-[#f27f0d]'
                                : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            <span className="text-[10px] font-bold">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 bg-white rounded-t-[40px] px-6 pt-10 pb-32 overflow-y-auto no-scrollbar relative">
                <div className={`transition-all duration-500 transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Listagem recente</h2>
                        {!loading && records.length > 0 && (
                            <span className="text-[10px] font-bold text-[#f27f0d] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                {records.length} itens
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <SpokeSpinner size="w-10 h-10" color="text-[#f27f0d]" />
                            <p className="text-xs text-slate-400 font-medium animate-pulse">Consultando dados...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400">Sem registros</p>
                            <p className="text-[11px] text-slate-300 mt-1">Nada encontrado nesta categoria.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {records.map((item) => (
                                <div
                                    key={`${item.source}-${item.id}`}
                                    className="bg-slate-50 rounded-[24px] p-4 border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.colorClass}`}>
                                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{item.title}</p>
                                            {item.subtext && <p className="text-[10px] text-slate-400 mt-0.5">{item.subtext}</p>}
                                            <p className="text-[10px] text-slate-300 mt-1 font-medium">
                                                {item.date.toLocaleDateString('pt-AO')} às {item.date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black text-sm mb-1.5 ${item.isIncome ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.isIncome ? '+' : '-'} {item.amount?.toLocaleString('pt-AO')} kz
                                        </p>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${getStatusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
