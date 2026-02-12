import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface ProfileProps {
  onNavigate: (page: any) => void;
  onLogout?: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  profile: any;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onLogout, profile, showToast }) => {
  const [currentProfile, setCurrentProfile] = useState<any>(profile);
  const [exchangeRate, setExchangeRate] = useState<number>(1000); // Default or fetch
  const [stats, setStats] = useState<any>({
    balance: profile?.balance || 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
    todayEarnings: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile);
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!currentProfile?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Exchange Rate (Parallel or fallback)
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => res.json())
        .then(data => { if (data?.rates?.AOA) setExchangeRate(data.rates.AOA); })
        .catch(() => console.log("Using default rate"));

      // 2. Fetch Aggregated Data
      const [
        depositsRes,
        depositsUsdtRes,
        withdrawalsRes,
        tasksRes,
        bonusRes
      ] = await Promise.all([
        supabase.from('depositos_clientes').select('valor_deposito, estado_de_pagamento').eq('user_id', user.id),
        supabase.from('depositos_usdt').select('amount_kz, status').eq('user_id', user.id),
        supabase.from('retirada_clientes').select('valor_solicitado, estado_da_retirada').eq('user_id', user.id),
        supabase.from('tarefas_diarias').select('renda_coletada, data_atribuicao').eq('user_id', user.id),
        supabase.from('bonus_transacoes').select('valor_recebido, data_recebimento').eq('user_id', user.id)
      ]);

      // Calculations
      const totalDeposit = (depositsRes.data?.filter(d => ['sucedido', 'completo', 'sucesso', 'concluido'].includes(d.estado_de_pagamento.toLowerCase())).reduce((acc, curr) => acc + Number(curr.valor_deposito || 0), 0) || 0) +
        (depositsUsdtRes.data?.filter(d => ['sucedido', 'completo', 'sucesso', 'concluido'].includes(d.status.toLowerCase())).reduce((acc, curr) => acc + Number(curr.amount_kz || 0), 0) || 0);

      const totalWithdrawal = withdrawalsRes.data?.filter(w => ['sucedido', 'completo', 'sucesso', 'concluido'].includes(w.estado_da_retirada.toLowerCase())).reduce((acc, curr) => acc + Number(curr.valor_solicitado || 0), 0) || 0;

      const pending = (depositsRes.data?.filter(d => d.estado_de_pagamento === 'pendente').reduce((acc, curr) => acc + Number(curr.valor_deposito || 0), 0) || 0) +
        (withdrawalsRes.data?.filter(w => w.estado_da_retirada === 'pendente').reduce((acc, curr) => acc + Number(curr.valor_solicitado || 0), 0) || 0);

      // Today's Earnings (Simplified: sum of tasks and bonuses today)
      const today = new Date().toISOString().split('T')[0];
      const taskEarnings = tasksRes.data?.filter(t => t.data_atribuicao.startsWith(today)).reduce((acc, curr) => acc + Number(curr.renda_coletada || 0), 0) || 0;
      const bonusEarnings = bonusRes.data?.filter(b => b.data_recebimento.startsWith(today)).reduce((acc, curr) => acc + Number(curr.valor_recebido || 0), 0) || 0;

      setStats({
        balance: currentProfile.balance || 0,
        totalDeposit,
        totalWithdrawal,
        todayEarnings: taskEarnings + bonusEarnings,
        pending,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setLoading(false);
    }
  };

  const balanceAOA = stats.balance * exchangeRate;

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#f27f0d]">
      <SpokeSpinner size="w-10 h-10" color="text-white" />
    </div>
  );

  return (
    <div className="bg-[#f27f0d] font-display text-slate-800 antialiased min-h-screen flex justify-center pb-32">
      <div className="w-full max-w-[430px] bg-[#f27f0d] min-h-screen relative flex flex-col">
        {/* Header */}
        <header className="pt-12 px-6 pb-4 flex justify-between items-center bg-[#f27f0d]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-white/20">
              <img
                alt="User"
                className="w-full h-full object-cover"
                src={currentProfile?.avatar_url || "https://lh3.googleusercontent.com/a/default-user=s120-c"}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {currentProfile?.phone || 'Usuário'}
              </h2>
              <p className="text-[10px] text-orange-100/70 uppercase font-bold tracking-widest">
                ID: {currentProfile?.id?.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative backdrop-blur-md active:scale-90 transition-all border border-white/10">
            <span className="material-symbols-outlined text-white text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f27f0d]"></span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow px-6 pt-2 space-y-4">
          {/* Balance Card - Premium Glassmorphic feel */}
          <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-black/10 text-[#f27f0d] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[#f27f0d]/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">Balanço Total</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                    {stats.balance.toLocaleString('pt-AO')}
                  </h3>
                  <span className="text-sm font-bold text-slate-400">USDT</span>
                </div>
              </div>
              <div className="bg-[#f27f0d]/10 w-11 h-11 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#f27f0d] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Equivalente em Kwanzas</p>
              <p className="text-xl font-black text-slate-800 tracking-tight">
                {balanceAOA.toLocaleString('pt-AO')} <span className="text-xs font-bold text-slate-500">AOA</span>
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.1em] mb-1">Total Depósito</p>
              <p className="font-black text-green-600 text-sm tracking-tight">{stats.totalDeposit.toLocaleString()} Kz</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.1em] mb-1">Total Saques</p>
              <p className="font-black text-red-500 text-sm tracking-tight">{stats.totalWithdrawal.toLocaleString()} Kz</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.1em] mb-1">Ganhos Hoje</p>
              <p className="font-black text-[#f27f0d] text-sm tracking-tight">+{stats.todayEarnings.toLocaleString()} Kz</p>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.1em] mb-1">Pendente</p>
              <p className="font-black text-orange-500 text-sm tracking-tight">{stats.pending.toLocaleString()} Kz</p>
            </div>
          </div>

          {/* Settings Section */}
          <div className="mt-8 space-y-2">
            <h3 className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] mb-3 px-1 drop-shadow-sm">Configurações da Conta</h3>

            <button
              onClick={() => onNavigate('add-bank')}
              className="w-full flex items-center justify-between h-14 px-5 bg-white hover:bg-white/95 rounded-2xl transition-all group shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#f27f0d]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#f27f0d] text-[20px]">account_balance</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">Adicionar Conta</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#f27f0d] transition-colors text-xl">chevron_right</span>
            </button>

            <button
              onClick={() => onNavigate('security-verify')}
              className="w-full flex items-center justify-between h-14 px-5 bg-white hover:bg-white/95 rounded-2xl transition-all group shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#f27f0d]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#f27f0d] text-[20px]">lock_person</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">Segurança & Senha</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#f27f0d] transition-colors text-xl">chevron_right</span>
            </button>

            <button
              onClick={() => onNavigate('gift-chest')}
              className="w-full flex items-center justify-between h-14 px-5 bg-white hover:bg-white/95 rounded-2xl transition-all group shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#f27f0d]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#f27f0d] text-[20px]">redeem</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">Recompensas Diárias</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Novo</span>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-[#f27f0d] transition-colors text-xl">chevron_right</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('records-financeiro')}
              className="w-full flex items-center justify-between h-14 px-5 bg-white hover:bg-white/95 rounded-2xl transition-all group shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#f27f0d]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#f27f0d] text-[20px]">history_edu</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">Registros Financeiros</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#f27f0d] transition-colors text-xl">chevron_right</span>
            </button>

            <button
              onClick={() => onNavigate('about-bp')}
              className="w-full flex items-center justify-between h-14 px-5 bg-white hover:bg-white/95 rounded-2xl transition-all group shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#f27f0d]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#f27f0d] text-[20px]">info</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">Sobre Nós</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-[#f27f0d] transition-colors text-xl">chevron_right</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between h-16 px-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group mt-6 border border-white/20 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <span className="material-symbols-outlined text-white text-[20px] font-bold">logout</span>
                </div>
                <span className="font-black text-white text-sm uppercase tracking-widest">Sair da Conta</span>
              </div>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
