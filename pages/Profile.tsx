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
  const [stats, setStats] = useState<any>({
    balance: profile?.balance || 0,
    total_recharge: 0,
  });

  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile);
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!currentProfile?.id) return;

    try {
      const { data: userResponse } = await supabase.auth.getUser();
      const userId = userResponse.user?.id;

      if (!userId) return;

      const [
        profileStatsRes,
        depositsRes,
        depositsUsdtRes,
      ] = await Promise.all([
        supabase.rpc('get_profile_stats'),
        supabase
          .from('depositos_clientes')
          .select('valor_deposito')
          .eq('user_id', userId)
          .in('estado_de_pagamento', ['sucedido', 'completo', 'sucesso', 'concluido']),
        supabase
          .from('depositos_usdt')
          .select('amount_kz')
          .eq('user_id', userId)
          .in('status', ['sucedido', 'completo', 'sucesso', 'concluido']),
      ]);

      const totalDeposits = (depositsRes.data?.reduce((acc: number, curr: any) => acc + Number(curr.valor_deposito || 0), 0) || 0) +
        (depositsUsdtRes.data?.reduce((acc: number, curr: any) => acc + Number(curr.amount_kz || 0), 0) || 0);

      setStats({
        balance: profileStatsRes.data?.balance || 0,
        total_recharge: totalDeposits,
      });

    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  if (!currentProfile) return (
    <div className="flex justify-center items-center h-screen bg-[#F5F5F5]">
      <SpokeSpinner size="w-10 h-10" color="text-primary" />
    </div>
  );

  return (
    <div className="bg-[#F5F5F5] dark:bg-[#0A0A0A] font-display text-gray-900 dark:text-gray-100 antialiased overflow-x-hidden">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-20">
        {/* Header laranja */}
        <header className="bg-primary pt-10 pb-16 px-4 relative overflow-hidden">
          {/* Ícone decorativo de dinheiro */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[180px] text-white">attach_money</span>
          </div>

          {/* Navegação superior */}
          <nav className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-white leading-tight text-center uppercase">
                  The<br />Home
                </span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">THE HOME-VIP</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-white opacity-90">
                <span className="material-symbols-outlined">mail</span>
              </button>
              <button className="text-white opacity-90">
                <span className="material-symbols-outlined">headset_mic</span>
              </button>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-white text-xs border border-white/20">
                <span className="material-symbols-outlined text-sm">language</span>
                <span>Português</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>
          </nav>

          {/* Balanço */}
          <div className="text-center relative z-10">
            <p className="text-white/80 text-sm mb-1">Balanço total (USDT)</p>
            <h1 className="text-white text-5xl font-bold mb-6">{stats.balance.toFixed(2)}</h1>
            <p className="text-white/80 text-sm mb-1">Valor de recarga (USDT)</p>
            <h2 className="text-white text-3xl font-bold">{stats.total_recharge.toFixed(2)}</h2>
          </div>
        </header>

        {/* Barra de email com badge VIP */}
        <div className="px-0 -mt-8 relative z-20">
          <div className="bg-[#DAFE73] flex items-center justify-between px-4 py-3 rounded-t-3xl">
            <span className="text-gray-800 font-medium text-sm">{currentProfile?.email || 'openialucros@gmail.com'}</span>
            <span className="bg-white/50 px-3 py-0.5 rounded-full text-xs font-bold text-gray-700">VIP</span>
          </div>
        </div>

        {/* Grid de ícones */}
        <div className="bg-[#2D2D3A] grid grid-cols-4 pt-4 pb-6 px-2 relative z-10">
          <button
            onClick={() => onNavigate('historico-conta')}
            className="flex flex-col items-center gap-1 text-center border-r border-white/10"
          >
            <span className="material-symbols-outlined text-white text-3xl mb-1">account_balance</span>
            <span className="text-white/70 text-[10px] leading-tight">Conta</span>
          </button>
          <button
            onClick={() => onNavigate('deposit')}
            className="flex flex-col items-center gap-1 text-center border-r border-white/10"
          >
            <span className="material-symbols-outlined text-white text-3xl mb-1">monetization_on</span>
            <span className="text-white/70 text-[10px] leading-tight">Recarrega</span>
          </button>
          <button
            onClick={() => onNavigate('retirada')}
            className="flex flex-col items-center gap-1 text-center border-r border-white/10"
          >
            <span className="material-symbols-outlined text-white text-3xl mb-1">wallet</span>
            <span className="text-white/70 text-[10px] leading-tight">Retirar</span>
          </button>
          <div className="flex flex-col items-center gap-1 text-center relative">
            <span className="material-symbols-outlined text-white text-3xl mb-1">trending_up</span>
            <span className="text-white/70 text-[10px] leading-tight">Recordes<br />financeiros</span>
            <img
              alt="Profile thumbnail"
              className="absolute -top-6 -right-1 w-10 h-10 rounded-full border-2 border-[#2D2D3A] object-cover shadow-lg"
              src={currentProfile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCjLecNBWsXyRmYIbMkRmB9bA9UAVZzkAtYMgdn0dPJ3Jmo0xOzF6xTu323lQAkvVZbl4Zf3NKui5VGrsVaF-U5-LzApdQjtmfvDjaC3SSlRCOd3PxId-vNg3iIxnXrAM5k45qxh9AAtEaGL7mk_zVTKW_xdjswa-OwszimAyxO-JmFInPMCwyUAThO6O3pxX_fuBxoOEUg4GteNvzL3dNgVsAQ4gU7vFKsPoeQW5ln0a7cJWmE2Nd2Idi3KjKeN7tcvtiy5Ck4wF-b"}
              onError={(e) => {
                e.currentTarget.src = '/default_avatar.png';
              }}
            />
          </div>
        </div>

        {/* Menu principal */}
        <main className="flex-1 bg-white dark:bg-zinc-900 -mt-4 rounded-t-[40px] px-6 pt-10 shadow-inner">
          <ul className="space-y-2">
            <li
              onClick={() => onNavigate('p2p-transfer')}
              className="flex items-center justify-between py-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">move_up</span>
                </div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">Transferir</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </li>
            <li
              onClick={() => onNavigate('change-password')}
              className="flex items-center justify-between py-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">password</span>
                </div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">Alterar a senha</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </li>
            <li
              onClick={onLogout}
              className="flex items-center justify-between py-4 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-teal-600">logout</span>
                </div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">sair</span>
              </div>
              <span className="material-symbols-outlined text-gray-400">chevron_right</span>
            </li>
          </ul>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-primary flex items-center justify-around py-3 rounded-t-xl z-50">
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-[10px]">Lar</span>
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
            <span className="text-[10px]">Tarefa</span>
          </button>
          <button
            onClick={() => onNavigate('invite-page')}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <span className="material-symbols-outlined text-2xl">groups</span>
            <span className="text-[10px]">Equipe</span>
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            <span className="text-[10px]">VIP</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white font-bold">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
            <span className="text-[10px]">Meu</span>
          </button>
        </nav>

        {/* CSS para ícone ativo */}
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .active-nav {
            font-variation-settings: 'FILL' 1;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Profile;
