import React, { Suspense, useState, useEffect, useRef, useCallback, cloneElement } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// Components
import SpokeSpinner from './components/SpokeSpinner';
import FloatingSupportButton from './components/FloatingSupportButton';
import WelcomeModal from './components/WelcomeModal';

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          await fetchProfile(session.user.id);
        } else {
          const params = new URLSearchParams(window.location.search);
          if (params.get('ref')) setCurrentPage('register');
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        document.body.classList.add('app-loaded');
      }
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

    const heavyPages = ['records-financeiro', 'shop'];
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
      'profile': PAGES_CONFIG.Profile,
      'add-bank': PAGES_CONFIG.AddBank,
      'deposit': PAGES_CONFIG.Recharge,
      'purchase-history': PAGES_CONFIG.PurchaseHistory,
      'change-password': PAGES_CONFIG.ChangePassword,
      'register': PAGES_CONFIG.Register,
      'retirada': PAGES_CONFIG.Withdraw,
      'login': PAGES_CONFIG.Login,
      'gift-chest': PAGES_CONFIG.GiftChest,
      'reward-claim': PAGES_CONFIG.RewardClaim,
      'deposit-usdt': PAGES_CONFIG.DepositUSDT,
      'subordinate-list': PAGES_CONFIG.SubordinateList,
      'invite-page': PAGES_CONFIG.InvitePage,
      'tasks': PAGES_CONFIG.Tasks,
      'detalhes-pay': PAGES_CONFIG.DetalhesPay,
      'records-financeiro': PAGES_CONFIG.RecordsFinanceiro,
      'about-bp': PAGES_CONFIG.AboutBP
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



      {showWelcomeModal && session && currentPage === 'home' && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      {/* Bottom Navigation */}
      {session && ['home', 'shop', 'profile', 'tasks', 'gift-chest', 'invite-page'].includes(currentPage) && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 pb-4 pt-2 flex justify-between items-center z-50">
          {[
            { id: 'home', icon: 'home', label: 'Home' },
            { id: 'tasks', icon: 'schedule', label: 'Tarefas' },
            { id: 'shop', icon: 'add', isFab: true },
            { id: 'invite-page', icon: 'groups', label: 'Equipe' },
            { id: 'profile', icon: 'person', label: 'Meu' }
          ].map((item) => (
            item.isFab ? (
              <div key={item.id} className="relative -top-8">
                <button
                  onClick={() => handleNavigate(item.id)}
                  className="w-14 h-14 bg-[#f27f0d] text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-900/20 ring-4 ring-white active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[32px] font-bold">add</span>
                </button>
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === item.id ? 'text-[#f27f0d]' : 'text-slate-400'}`}
              >
                <div className="relative">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: currentPage === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            )
          ))}
          {/* iOS Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-100 rounded-full"></div>
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

