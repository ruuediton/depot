import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface TasksProps {
    onNavigate: (page: any) => void;
    showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface OngoingProduct {
    id: string;
    nome_produto: string;
    preco: number;
    rendimento_diario: number;
    data_compra: string;
    data_expiracao: string;
    status: string;
}

interface CompletedTask {
    id: string;
    renda_coletada: number;
    saldo_antes: number;
    saldo_depois: number;
    data_atribuicao: string;
    status: string;
}

const Tasks: React.FC<TasksProps> = ({ onNavigate, showToast }) => {
    const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
    const [ongoingProducts, setOngoingProducts] = useState<OngoingProduct[]>([]);
    const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_ongoing: 0,
        total_completed_today: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Buscar produtos em andamento (gerando lucros)
            const { data: productsData } = await supabase
                .from('historico_compras')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'confirmado')
                .order('data_compra', { ascending: false });

            if (productsData) {
                setOngoingProducts(productsData);
            }

            // Buscar rendas coletadas (tarefas concluídas)
            const { data: tasksData } = await supabase
                .from('tarefas_diarias')
                .select('*')
                .eq('user_id', user.id)
                .order('data_atribuicao', { ascending: false });

            if (tasksData) {
                setCompletedTasks(tasksData);
            }

            // Calcular estatísticas
            const today = new Date().toISOString().split('T')[0];
            const todayCompleted = tasksData?.filter((task: any) =>
                task.data_atribuicao?.startsWith(today)
            ).length || 0;

            setStats({
                total_ongoing: productsData?.length || 0,
                total_completed_today: todayCompleted
            });

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            showToast?.('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-AO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-AO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysRemaining = (expirationDate: string) => {
        const now = new Date();
        const expiry = new Date(expirationDate);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div className="bg-[#FF6B00] min-h-screen pb-20 font-sans antialiased pt-4">

            {/* Stats Card */}
            <div className="px-4 mt-4">
                <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-4 shadow-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-gray-700 text-sm font-medium mb-1">Todas as tarefas de hoje</p>
                            <p className="text-gray-900 text-3xl font-bold">{stats.total_completed_today}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-700 text-sm font-medium mb-1">As tarefas restantes de hoje</p>
                            <p className="text-gray-900 text-3xl font-bold">{stats.total_ongoing}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mt-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Tab Headers */}
                    <div className="grid grid-cols-2 bg-gray-100">
                        <button
                            onClick={() => setActiveTab('ongoing')}
                            className={`py-3 text-sm font-bold transition-all ${activeTab === 'ongoing'
                                ? 'bg-white text-gray-900'
                                : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            Em andamento
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`py-3 text-sm font-bold transition-all ${activeTab === 'completed'
                                ? 'bg-white text-gray-900'
                                : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            Concluído
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <SpokeSpinner size="w-8 h-8" color="text-[#FF6B00]" />
                            </div>
                        ) : activeTab === 'ongoing' ? (
                            // ABA EM ANDAMENTO - Produtos gerando lucros
                            ongoingProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
                                    <p className="text-sm">Nenhum produto ativo</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ongoingProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-gray-900 font-bold text-base mb-1">
                                                        {product.nome_produto}
                                                    </h3>
                                                    <p className="text-gray-500 text-xs">
                                                        Comprado em {formatDate(product.data_compra)}
                                                    </p>
                                                </div>
                                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                    Ativo
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-1">Investimento</p>
                                                    <p className="text-gray-900 font-bold text-sm">
                                                        {product.preco?.toLocaleString('pt-AO')} Kz
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-1">Renda Diária</p>
                                                    <p className="text-[#FF6B00] font-bold text-sm">
                                                        +{product.rendimento_diario?.toLocaleString('pt-AO')} Kz
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    Expira em: {formatDate(product.data_expiracao)}
                                                </span>
                                                <span className="text-blue-600 font-semibold">
                                                    {getDaysRemaining(product.data_expiracao)} dias restantes
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            // ABA CONCLUÍDO - Rendas coletadas automaticamente
                            completedTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <span className="material-symbols-outlined text-6xl mb-4">check_circle</span>
                                    <p className="text-sm">Nenhuma renda coletada ainda</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-gray-900 font-bold text-base mb-1">
                                                        Renda Coletada Automaticamente
                                                    </h3>
                                                    <p className="text-gray-500 text-xs">
                                                        {formatDate(task.data_atribuicao)} às {formatTime(task.data_atribuicao)}
                                                    </p>
                                                </div>
                                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                    Sucesso
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-2">
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-1">Renda</p>
                                                    <p className="text-green-600 font-bold text-sm">
                                                        +{task.renda_coletada?.toLocaleString('pt-AO')} Kz
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-1">Antes</p>
                                                    <p className="text-gray-700 font-semibold text-sm">
                                                        {task.saldo_antes?.toLocaleString('pt-AO')} Kz
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-1">Depois</p>
                                                    <p className="text-blue-600 font-semibold text-sm">
                                                        {task.saldo_depois?.toLocaleString('pt-AO')} Kz
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded-lg p-2">
                                                <span className="material-symbols-outlined text-sm text-blue-500">schedule</span>
                                                <span>Coletado automaticamente às 01:00 (Angola Time)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar de suporte flutuante */}
            <div className="fixed bottom-24 right-6">
                <div className="relative group cursor-pointer" onClick={() => onNavigate('support')}>
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl transition-transform active:scale-90">
                        <img
                            alt="Customer Service Representative"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVMsuBX2ic9czUhYRcjD5re9s0_u1JVpGnN0qDdgOqZCmpgzpaGT-BU639iXHlLT0Q3JpCBo9BAidZZdIhy_CmoO2ycCztKP-JaAv5zeKC9Kcf3dlLYJXGZpGCKNLaoAkx7SRBDoDcW4Ffd_f76RfHImKFl8bY4p6coFd-3KqpOTVbjf_GhemPQQTCGKsCzZYXyb8VEOJuYuKz0dg8uN38E9jzPzSleOR4x1vY489hVSZN8G7yw8hC9ggdfynwfGaLuyC7xS-2-0Ks"
                        />
                    </div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
            </div>

        </div>
    );
};

export default Tasks;
