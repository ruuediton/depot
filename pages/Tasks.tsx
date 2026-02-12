import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface TasksProps {
    onNavigate: (page: any) => void;
    showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const Tasks: React.FC<TasksProps> = ({ onNavigate, showToast }) => {
    const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        today_tasks: 0,
        remaining_tasks: 0
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Buscar tarefas do usuário
            const { data: purchaseData } = await supabase
                .from('compras_clientes')
                .select('*')
                .eq('user_id', user.id)
                .order('data_compra', { ascending: false });

            if (purchaseData) {
                setTasks(purchaseData);

                // Calcular estatísticas
                const today = new Date().toISOString().split('T')[0];
                const todayTasks = purchaseData.filter((task: any) =>
                    task.data_compra?.startsWith(today)
                ).length;

                const remainingTasks = purchaseData.filter((task: any) =>
                    task.estado_compra === 'pendente' || task.estado_compra === 'em_andamento'
                ).length;

                setStats({
                    today_tasks: todayTasks,
                    remaining_tasks: remainingTasks
                });
            }
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'ongoing') {
            return task.estado_compra === 'pendente' || task.estado_compra === 'em_andamento';
        } else {
            return task.estado_compra === 'concluido' || task.estado_compra === 'completo';
        }
    });

    return (
        <div className="bg-[#FF6B00] min-h-screen pb-20 font-sans antialiased">
            {/* Header */}
            <div className="bg-[#FF6B00] px-4 pt-3 pb-4">
                <div className="flex items-center justify-between">
                    {/* Logo THE HOME-VIP */}
                    <div className="flex items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" fill="white" rx="4" />
                            <path d="M8 10L14 6L20 10V20H8V10Z" fill="#FF6B00" />
                        </svg>
                        <span className="text-white font-black text-[16px] tracking-wide">The Home Depot</span>
                    </div>

                    {/* Ícones do topo */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate('records-financeiro')}
                            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-white text-[20px]">history</span>
                        </button>
                        <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
                            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </button>
                        <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[20px]">headset_mic</span>
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/20">
                            <span className="material-symbols-outlined text-white text-[16px]">language</span>
                            <span className="text-white text-[11px] font-semibold">Português</span>
                            <span className="material-symbols-outlined text-white text-[14px]">expand_more</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="px-4 mt-4">
                <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-4 shadow-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-gray-700 text-sm font-medium mb-1">Todas as tarefas de hoje</p>
                            <p className="text-gray-900 text-3xl font-black">{stats.today_tasks}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-700 text-sm font-medium mb-1">As tarefas restantes de hoje</p>
                            <p className="text-gray-900 text-3xl font-black">{stats.remaining_tasks}</p>
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
                        ) : filteredTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
                                <p className="text-sm">Sem dados</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all cursor-pointer"
                                        onClick={() => onNavigate('purchase-history')}
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#FF6B00] text-3xl">task_alt</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-bold text-sm">
                                                Tarefa #{task.id?.toString().slice(-6)}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {new Date(task.data_compra).toLocaleDateString('pt-BR')}
                                            </p>
                                            <p className="text-[#FF6B00] font-bold text-sm mt-1">
                                                {task.preco_produto?.toLocaleString('pt-AO')} Kz
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${task.estado_compra === 'concluido' || task.estado_compra === 'completo'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {task.estado_compra === 'concluido' || task.estado_compra === 'completo'
                                                ? 'Concluído'
                                                : 'Pendente'}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
