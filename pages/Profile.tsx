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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    balance: profile?.balance || 0,
    total_earnings: 0,
    today_earnings: 0,
  });

  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile);
      fetchStats();
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [profile]);

  const handleInstallApp = React.useCallback(async () => {
    try {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          showToast?.("Instalação iniciada!", "success");
        }
      } else {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
        if (isStandalone) {
          showToast?.("O aplicativo já está instalado e em execução.", "success");
          return;
        }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
          showToast?.("Para instalar no iOS: Toque em 'Compartilhar' e depois em 'Adicionar à Tela de Início'", "info");
        } else {
          showToast?.("Para instalar no Android: Use o menu do navegador e selecione 'Instalar Aplicativo'.", "info");
        }
      }
    } catch (err) {
      console.error("Install prompt error:", err);
      showToast?.("Não foi possível abrir o instalador. Tente pelo menu do navegador.", "error");
    }
  }, [deferredPrompt, showToast]);

  const SERVICES_MENU = React.useMemo(() => [
    { label: 'Meus dispositivos', icon: 'assignment', page: 'purchase-history', color: 'bg-green-50 text-[#00C853]' },
    { label: 'Extrato de conta', icon: 'account_balance', page: 'historico-conta', color: 'bg-green-50 text-[#00C853]' },
    { label: 'Equipe', icon: 'pie_chart', page: 'subordinate-list', color: 'bg-green-50 text-[#00C853]' },
    { label: 'Resgatar cupons', icon: 'auto_awesome', page: 'gift-chest', color: 'bg-green-50 text-[#00C853]' },
    { label: 'Marketplace', icon: 'storefront', page: 'investimentos-fundo', color: 'bg-green-50 text-[#00C853]' },

    { label: 'Alterar senha login', icon: 'lock_open', page: 'change-password', color: 'bg-green-50 text-[#00C853]' },
    { label: 'Dados bancários', icon: 'account_balance', page: 'add-bank', color: 'bg-green-50 text-[#00C853]' },

    { label: 'Quem Somos', icon: 'corporate_fare', page: 'about-bp', color: 'bg-green-50 text-[#00C853]' },
    { label: 'Termos e regras', icon: 'gavel', page: 'info', color: 'bg-green-50 text-[#00C853]' },
  ], [handleInstallApp]);

  const fetchStats = async () => {
    if (!currentProfile?.id) return;

    try {
      const { data: userResponse } = await supabase.auth.getUser();
      const userId = /* currentProfile.id || */ userResponse.user?.id;

      if (!userId) return;

      const [
        profileStatsRes,
        withdrawalsRes,
        depositsRes,
        depositsUsdtRes,
        bonusRes,
        teamRes
      ] = await Promise.all([
        supabase.rpc('get_profile_stats'),

        // Fetch specific withdrawals (Completed/Approved)
        supabase
          .from('retirada_clientes')
          .select('valor_solicitado')
          .eq('user_id', userId)
          .in('estado_da_retirada', ['concluido', 'aprovado', 'sucedido', 'processado', 'pagamento_enviado']),

        // Fetch specific deposits (Bank)
        supabase
          .from('depositos_clientes')
          .select('valor_deposito')
          .eq('user_id', userId)
          .in('estado_de_pagamento', ['sucedido', 'completo', 'sucesso', 'concluido']),

        // Fetch specific deposits (USDT)
        supabase
          .from('depositos_usdt')
          .select('amount_kz')
          .eq('user_id', userId)
          .in('status', ['sucedido', 'completo', 'sucesso', 'concluido']),

        // Fetch all rewards/bonuses
        supabase
          .from('bonus_transacoes')
          .select('valor_recebido')
          .eq('user_id', userId),

        // Fetch team count
        supabase.rpc('get_my_team')
      ]);

      const totalWithdrawals = withdrawalsRes.data?.reduce((acc: number, curr: any) => acc + Number(curr.valor_solicitado || 0), 0) || 0;

      const totalDeposits = (depositsRes.data?.reduce((acc: number, curr: any) => acc + Number(curr.valor_deposito || 0), 0) || 0) +
        (depositsUsdtRes.data?.reduce((acc: number, curr: any) => acc + Number(curr.amount_kz || 0), 0) || 0);

      const totalRewards = bonusRes.data?.reduce((acc: number, curr: any) => acc + Number(curr.valor_recebido || 0), 0) || 0;

      const totalSubordinates = teamRes.data?.length || 0;

      setStats({
        balance: profileStatsRes.data?.balance || 0,
        today_earnings: profileStatsRes.data?.renda_diaria || 0,
        total_withdrawals: totalWithdrawals,
        total_recharge: totalDeposits,
        total_rewards: totalRewards,
        total_subordinates: totalSubordinates
      });

    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  if (!currentProfile) return (
    <div className="flex justify-center items-center h-screen">
      <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
    </div>
  );

  return (
    <div className="bg-[#F4F7F6] min-h-screen pb-32 font-display antialiased">
      {/* Red/Green Header Gradient Area with Mixture Effect */}
      <div className="bg-gradient-to-br from-[#0F1111] to-[#1A1C1C] pt-12 pb-24 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C853]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 overflow-hidden pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C853]/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 overflow-hidden pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-[24px] p-1 bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shadow-xl">
              <img
                src={currentProfile?.avatar_url || '/default_avatar.png'}
                onError={(e) => {
                  e.currentTarget.src = '/default_avatar.png';
                  e.currentTarget.onerror = null;
                }}
                alt="Avatar"
                className="w-full h-full object-cover rounded-[20px]"
              />
            </div>
            <div>
              <p className="font-black text-[18px] text-white tracking-tight">Membro BP</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 bg-[#00C853] text-black text-[9px] font-black rounded-md uppercase tracking-widest">VIP</span>
                <p className="text-[12px] text-white/60 font-medium">ID: {currentProfile.invite_code || '---'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="size-11 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/10 active:scale-90 transition-all hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-[32px] p-8 shadow-premium border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <span className="material-symbols-outlined text-[100px] -rotate-12">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-1.5 bg-[#00C853] rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Saldo em Conta</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-black text-[#00C853] mb-2 uppercase">KZs</span>
                <span className="text-[36px] font-black text-gray-900 tracking-tighter leading-none">
                  {(stats.balance || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={() => onNavigate('p2p-transfer')}
                className="size-14 bg-gray-900 text-white rounded-[24px] flex items-center justify-center shadow-xl active:scale-90 transition-all hover:bg-[#00C853]"
              >
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('deposit')}
          className="flex flex-col items-center justify-center gap-1 bg-[#EEFFF5] text-[#00C853] p-4 rounded-[28px] font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all border border-[#00C853]/10"
        >
          <span className="material-symbols-outlined text-2xl mb-1">add_circle</span>
          Recarregar
        </button>
        <button
          onClick={() => onNavigate('retirada')}
          className="flex flex-col items-center justify-center gap-1 bg-white text-gray-900 shadow-premium p-4 rounded-[28px] font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all border border-gray-100"
        >
          <span className="material-symbols-outlined text-2xl mb-1">arrow_circle_up</span>
          Retirar
        </button>
      </div>


      {/* Stats Area - Compact & Organized */}
      <div className="px-6 mt-8">
        <div className="bg-white p-2 rounded-[36px] shadow-premium border border-white/50">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
              <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest">Lucros Hoje</span>
              <p className="text-[16px] font-black text-[#00C853] mt-1 tracking-tight">
                + {(stats.today_earnings || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
              <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest">Total Retirado</span>
              <p className="text-[16px] font-black text-[#CC0C39] mt-1 tracking-tight">
                - {(stats.total_withdrawals || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
              <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest">Investimento</span>
              <p className="text-[16px] font-black text-gray-900 mt-1 tracking-tight">
                {(stats.total_recharge || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-gray-50/50 p-5 rounded-[28px] border border-gray-100">
              <span className="text-gray-400 text-[9px] uppercase font-black tracking-widest">Recompensas</span>
              <p className="text-[16px] font-black text-[#00C853] mt-1 tracking-tight">
                {(stats.total_rewards || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-4 gap-y-8 gap-x-2">
          {SERVICES_MENU.map((item: any) => (
            <div
              key={item.label}
              onClick={() => item.action ? item.action() : onNavigate(item.page)}
              className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all text-center group"
            >
              <div className={`size-14 rounded-[20px] flex items-center justify-center bg-white shadow-premium border border-white group-hover:bg-[#00C853] group-hover:text-white transition-all`}>
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              </div>
              <span className="text-[9px] text-gray-400 leading-tight font-black uppercase tracking-widest px-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Illustrative Banner */}
      <div className="px-6 mt-10">
        <div
          onClick={() => onNavigate('invite-page')}
          className="bg-gray-900 rounded-[32px] p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 w-2/3">
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2 bg-[#00C853] rounded-full"></span>
              <span className="text-[10px] text-[#00C853] font-black uppercase tracking-widest">Programa de Afiliados</span>
            </div>
            <h4 className="font-black text-[20px] text-white leading-tight tracking-tight">Expanda sua rede e fature mais</h4>
          </div>
          <div className="relative z-10">
            <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-[32px] text-[#00C853]">groups</span>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-8 -bottom-8 size-32 bg-[#00C853]/10 rounded-full blur-[40px]"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


