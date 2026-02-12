import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface ProfileProps {
  onNavigate: (page: any) => void;
  onLogout?: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  profile: any;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onLogout, profile }) => {
  const [currentProfile, setCurrentProfile] = useState<any>(profile);
  const [stats, setStats] = useState<any>({
    balance: profile?.balance || 0,
    balance_usdt: profile?.balance_usdt || 0,
    totalIncome: 0,
    teamIncome: 0,
  });
  const [exchangeRate, setExchangeRate] = useState<number>(950); // Default fallback rate
  const [loading, setLoading] = useState(true);

  // Fetch rate for visual conversion
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data?.rates?.AOA) setExchangeRate(data.rates.AOA);
      })
      .catch(() => { });
  }, []);

  const fetchStats = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [tasksRes, bonusRes, teamRes] = await Promise.all([
        supabase.from('tarefas_diarias').select('renda_coletada').eq('user_id', user.id),
        supabase.from('bonus_transacoes').select('valor_recebido').eq('user_id', user.id),
        supabase.from('bonus_transacoes').select('valor_recebido').eq('user_id', user.id).neq('origem_bonus', 'Resgate de código')
      ]);

      const totalIncome = (tasksRes.data?.reduce((acc, curr) => acc + Number(curr.renda_coletada || 0), 0) || 0) +
        (bonusRes.data?.reduce((acc, curr) => acc + Number(curr.valor_recebido || 0), 0) || 0);

      const teamIncome = teamRes.data?.reduce((acc, curr) => acc + Number(curr.valor_recebido || 0), 0) || 0;

      setStats({
        balance: profile.balance || 0,
        balance_usdt: profile.balance_usdt || 0,
        totalIncome,
        teamIncome,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile);
      fetchStats();
    }
  }, [profile, fetchStats]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#f27f0d]">
      <SpokeSpinner size="w-10 h-10" color="text-white" />
    </div>
  );

  return (
    <div className="bg-slate-50 font-sans text-slate-800 antialiased min-h-screen flex flex-col pb-32">
      {/* Top Banner with Pattern */}
      <div className="bg-white px-6 pt-14 pb-8 relative overflow-hidden">
        {/* Simple Map Pattern Background Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h100v100H0z" fill="none" />
            <path d="M10 10h80v80H10z" fill="currentColor" />
          </svg>
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div className="flex gap-4">
            {/* Logo/Avatar Square */}
            <div className="w-20 h-20 bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden flex items-center justify-center p-1">
              <img
                src={currentProfile?.avatar_url || "https://lh3.googleusercontent.com/a/default-user=s120-c"}
                alt="Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {currentProfile?.phone || 'Tesla power bank'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                ID: {currentProfile?.id?.substring(0, 11).replace(/-/g, '') || '244927104392'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-10 h-10 flex items-center justify-center text-[#f27f0d] active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-3xl">logout</span>
          </button>
        </div>
      </div>

      {/* Middle Stats Section - Row Based */}
      <div className="px-4 -mt-2 space-y-2">
        <div className="bg-[#fff9f3] border-b border-orange-100/50 p-4 flex justify-between items-center rounded-t-xl group active:bg-orange-50 transition-colors"
          onClick={() => onNavigate('records-financeiro')}>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700">Saldo Ativo</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">Ganhos e Depósitos</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg">
                {stats.balance_usdt.toLocaleString('pt-AO')} Kz
              </span>
              <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
            </div>
            <span className="text-[10px] text-[#f27f0d] font-bold uppercase tracking-wider">
              ≈ {(stats.balance_usdt / exchangeRate).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Usdt
            </span>
          </div>
        </div>
        <div className="bg-[#fff9f3] border-b border-orange-100/50 p-4 flex justify-between items-center group active:bg-orange-50 transition-colors"
          onClick={() => onNavigate('transfer')}>
          <span className="text-sm font-semibold text-slate-700">Saldo de Retirada (Aoa)</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{stats.balance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          </div>
        </div>
        <div className="bg-[#fff9f3] border-b border-orange-100/50 p-4 flex justify-between items-center group active:bg-orange-50 transition-colors"
          onClick={() => onNavigate('records-financeiro')}>
          <span className="text-sm font-semibold text-slate-700">Receita de equipamento</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{stats.totalIncome.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          </div>
        </div>
        <div className="bg-[#fff9f3] p-4 flex justify-between items-center rounded-b-xl group active:bg-orange-50 transition-colors"
          onClick={() => onNavigate('subordinate-list')}>
          <span className="text-sm font-semibold text-slate-700">renda da equipe</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{stats.teamIncome.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
          </div>
        </div>
      </div>

      {/* Unified Menu List */}
      <main className="px-4 mt-6">
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          {[
            { label: 'recarrega', icon: 'account_balance_wallet', page: 'deposit' },
            { label: 'Converter cupons em dinheiro', icon: 'redeem', page: 'gift-chest' },
            { label: 'Informações de retirada', icon: 'account_balance', page: 'add-bank' },
            { label: 'Retirar dinheiro', icon: 'payments', page: 'retirada' },
            { label: 'Conversão', icon: 'swap_horiz', page: 'transfer' },
            { label: 'Convide amigos', icon: 'person_add', page: 'invite-page' },
            { label: 'Segurança da conta', icon: 'lock', page: 'change-password' },
            { label: 'Sobre nós', icon: 'info', page: 'about-bp' },
          ].map((item, index) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 group`}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#f27f0d] text-[24px]">
                  {item.icon}
                </span>
                <span className="text-[14px] font-semibold text-slate-700 group-active:text-[#f27f0d]">{item.label}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300 text-xl">chevron_right</span>
            </button>
          ))}
        </div>
      </main>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default Profile;
