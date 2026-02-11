import React, { Suspense, useState, useEffect, useRef, useCallback, cloneElement } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// Components
import SpokeSpinner from './components/SpokeSpinner';
import FloatingSupportButton from './components/FloatingSupportButton';
import WelcomeModal from './components/WelcomeModal';
import TaskPopup from './components/TaskPopup';
import SplashScreen from './components/SplashScreen';

// Config & Hooks
import { PAGE_TITLES, PAGES_CONFIG } from './navigation';
import { useAuthActions } from './hooks/useAuthActions';
import { useLoading } from './contexts/LoadingContext';

const App: React.FC = () => {
  const { withLoading, showWarning, showError, showSuccess } = useLoading();
  const { performFullLogout } = useAuthActions();

  const [currentPage, setCurrentPage] = useState<string>(() => localStorage.getItem('currentPage') || 'register');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const handleShowToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success': showSuccess(message); break;
      case 'error': showError(message); break;
      case 'warning': showWarning(message); break;
      case 'info': showSuccess(message); break;
      default: showSuccess(message);
    }
  }, [showSuccess, showError, showWarning]);



  // --- Initialization & Auth ---
  useEffect(() => {
    const initializeApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await fetchProfile(session.user.id);
      } else {
        const params = new URLSearchParams(window.location.search);
        if (params.get('ref')) setCurrentPage('register');
      }

      document.body.classList.add('app-loaded');
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setCurrentPage('register');
        localStorage.setItem('currentPage', 'register');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Profile Management ---
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`profile-${session.user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => setProfile(payload.new))
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [session]);



  // --- Navigation ---
  useEffect(() => {
    document.title = `${PAGE_TITLES[currentPage] || 'The Home Depot'} | The Home Depot`;
    // if (currentPage === 'home' && session) setShowTaskPopup(true); // Removido
  }, [currentPage, session]);

  const handleNavigate = useCallback((page: string, data: any = null) => {
    if (page === currentPage) return;
    setNavigationData(data);

    if (page === 'home' && !sessionStorage.getItem('welcome_shown')) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('welcome_shown', 'true');
    }

    localStorage.setItem('currentPage', page);

    const heavyPages = ['historico-conta', 'withdrawal-history', 'purchase-history', 'shop'];
    if (heavyPages.includes(page)) {
      withLoading(async () => {
        await new Promise(r => setTimeout(r, 100)); // Perceived performance delay for heavy load
        setCurrentPage(page);
      });
    } else {
      setCurrentPage(page);
    }
  }, [currentPage, withLoading]);

  // --- Page Rendering ---
  const renderPage = () => {
    if (!session && !['login', 'register'].includes(currentPage)) {
      return <PAGES_CONFIG.Register onNavigate={handleNavigate} />;
    }

    const pages: Record<string, any> = {
      'home': PAGES_CONFIG.Home,
      'shop': PAGES_CONFIG.Shop,
      'wallet': PAGES_CONFIG.Wallet,
      'profile': PAGES_CONFIG.Profile,
      'add-bank': PAGES_CONFIG.AddBank,
      'deposit': PAGES_CONFIG.Recharge,
      'purchase-history': PAGES_CONFIG.PurchaseHistory,
      'change-password': PAGES_CONFIG.ChangePassword,
      'historico-conta': PAGES_CONFIG.AccountHistory,
      'register': PAGES_CONFIG.Register,
      'retirada': PAGES_CONFIG.Withdraw,
      'login': PAGES_CONFIG.Login,
      'security-verify': PAGES_CONFIG.SecurityVerify,
      'ganhos-tarefas': PAGES_CONFIG.Rewards,
      'gift-chest': PAGES_CONFIG.GiftChest,
      'reward-claim': PAGES_CONFIG.RewardClaim,
      'deposit-usdt': PAGES_CONFIG.DepositUSDT,
      'deposit-usdt-history': PAGES_CONFIG.DepositUSDTHistory,
      'info': PAGES_CONFIG.Info,
      'about-bp': PAGES_CONFIG.AboutBP,
      'subordinate-list': PAGES_CONFIG.SubordinateList,
      'deposit-history': PAGES_CONFIG.WalletHistory,
      'withdrawal-history': PAGES_CONFIG.WithdrawalHistory,
      'invite-page': PAGES_CONFIG.InvitePage,
      'guia-indicacao': PAGES_CONFIG.GuiaIndicacao,
      'tasks': PAGES_CONFIG.Tasks
    };

    const Component = pages[currentPage] || PAGES_CONFIG.Home;
    return <Component
      onNavigate={handleNavigate}
      profile={profile}
      onLogout={() => setShowLogoutModal(true)}
      balance={profile?.balance || 0}
      data={navigationData}
      showToast={handleShowToast}
    />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F6] max-w-md mx-auto shadow-premium overflow-x-hidden relative">
      {isAppLoading && <SplashScreen onFinish={() => setIsAppLoading(false)} />}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-[#F4F7F6]">
            <SpokeSpinner size="w-10 h-10" color="text-[#FA6400]" />
          </div>
        }>
          {renderPage()}
        </Suspense>
        {session && <FloatingSupportButton />}
      </main>

      {showTaskPopup && session && (
        <TaskPopup onClose={() => setShowTaskPopup(false)} onNavigate={handleNavigate} />
      )}

      {showWelcomeModal && session && currentPage === 'home' && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      {/* Bottom Navigation */}
      {session && ['home', 'shop', 'profile', 'tasks', 'gift-chest'].includes(currentPage) && (
        <nav className="fixed bottom-4 left-4 right-4 max-w-[calc(448px-2rem)] mx-auto glass-panel rounded-[28px] py-3 px-6 z-40 shadow-glass">
          <div className="flex justify-between items-center bg-transparent">
            {[
              { id: 'home', icon: 'home', label: 'Lar' },
              { id: 'tasks', icon: 'receipt_long', label: 'Tarefa' },
              { id: 'invite-page', icon: 'groups', label: 'Equipe' },
              { id: 'shop', icon: 'workspace_premium', label: 'VIP' },
              { id: 'profile', icon: 'account_circle', label: 'Meu' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === item.id ? 'text-[#FA6400] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className={`relative ${currentPage === item.id ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#FA6400] after:rounded-full' : ''}`}>
                  <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentPage === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                </div>
                <span className={`text-[10px] font-bold ${currentPage === item.id ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-[320px] rounded-[40px] p-8 relative z-10 shadow-premium border border-white/50">
            <div className="flex flex-col items-center text-center">
              <div className="size-20 rounded-[32px] bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-4xl font-light">logout</span>
              </div>
              <h3 className="text-[22px] font-black text-[#0F1111] mb-2 tracking-tight">Sair Agora?</h3>
              <p className="text-gray-500 text-[14px] font-medium mb-8 leading-relaxed">Sua sessão será encerrada com segurança.</p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={performFullLogout} className="w-full h-[54px] bg-primary text-white rounded-[20px] font-black text-[15px] uppercase tracking-wider shadow-premium">Confirmar Saída</button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full h-[50px] text-gray-400 font-bold text-[12px] uppercase">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

