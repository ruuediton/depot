import React, { Suspense, useState, useEffect, useRef, useCallback, cloneElement } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// Components
import SpokeSpinner from './components/SpokeSpinner';
import FloatingSupportButton from './components/FloatingSupportButton';
import WelcomeModal from './components/WelcomeModal';

import SplashScreen from './components/SplashScreen';
// Lazy Components
const GiftRedeemModal = React.lazy(() => import('./components/GiftRedeemModal'));
const AboutBPModal = React.lazy(() => import('./components/AboutBPModal'));
const AddBankModal = React.lazy(() => import('./components/AddBankModal'));
const RewardClaimModal = React.lazy(() => import('./components/RewardClaimModal'));
const SubordinateListModal = React.lazy(() => import('./components/SubordinateListModal'));
const RecordsFinanceiroModal = React.lazy(() => import('./components/RecordsFinanceiroModal'));
const DepositUSDTModal = React.lazy(() => import('./components/DepositUSDTModal'));
const ChangePasswordModal = React.lazy(() => import('./components/ChangePasswordModal'));
const DetalhesPayModal = React.lazy(() => import('./components/DetalhesPayModal'));
const RechargeModal = React.lazy(() => import('./components/RechargeModal'));
const WithdrawModal = React.lazy(() => import('./components/WithdrawModal'));

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
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showSubordinateModal, setShowSubordinateModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showDepositUSDTModal, setShowDepositUSDTModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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
        setIsAppLoading(false);
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



  useEffect(() => {
    document.title = `${PAGE_TITLES[currentPage] || 'The Home Depot'} | The Home Depot`;
  }, [currentPage, session]);

  const handleNavigate = useCallback((page: string, data: any = null) => {
    if (page === currentPage && !data) return;

    // Set page for state persistence (useful for reloads)
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    if (data) setNavigationData(data);

    // Some basic triggers
    if (page === 'home') {
      setShowWelcomeModal(true);
    }

    window.scrollTo(0, 0);
  }, [currentPage]);

  // Sync modal states with currentPage (for reloads and browser history)
  useEffect(() => {
    // Hide all first (effectively) - simplified by checking specifically
    setShowGiftModal(currentPage === 'gift-chest');
    setShowAboutModal(currentPage === 'about-bp');
    setShowBankModal(currentPage === 'add-bank');
    setShowRewardModal(currentPage === 'reward-claim');
    setShowSubordinateModal(currentPage === 'subordinate-list');
    setShowRecordsModal(currentPage === 'records-financeiro');
    setShowDepositUSDTModal(currentPage === 'deposit-usdt');
    setShowPasswordModal(currentPage === 'change-password');
    setShowDetalhesModal(currentPage === 'detalhes-pay');
    setShowRechargeModal(currentPage === 'deposit');
    setShowWithdrawModal(currentPage === 'retirada');
  }, [currentPage]);

  const handleCloseModal = useCallback((fallbackPage: string = 'home') => {
    handleNavigate(fallbackPage);
  }, [handleNavigate]);

  // --- Page Rendering ---
  const renderPage = () => {
    if (!session && !['login', 'register'].includes(currentPage)) {
      return <PAGES_CONFIG.Register onNavigate={handleNavigate} />;
    }

    const pages: Record<string, any> = {
      'shop': PAGES_CONFIG.Shop,
      'profile': PAGES_CONFIG.Profile,
      'register': PAGES_CONFIG.Register,
      'login': PAGES_CONFIG.Login,
      'invite-page': PAGES_CONFIG.InvitePage,
      'tasks': PAGES_CONFIG.Tasks,
      'change-password': PAGES_CONFIG.Profile, // Keep Profile in background for centered modal
    };

    const fullScreenModals = [
      'gift-chest', 'about-bp', 'add-bank', 'reward-claim', 'subordinate-list',
      'records-financeiro', 'deposit-usdt', 'detalhes-pay', 'deposit', 'retirada'
    ];

    if (fullScreenModals.includes(currentPage)) {
      return null;
    }

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

      <Suspense fallback={null}>
        <GiftRedeemModal
          isOpen={showGiftModal}
          onClose={() => handleCloseModal('home')}
          showToast={handleShowToast}
        />

        <AboutBPModal
          isOpen={showAboutModal}
          onClose={() => handleCloseModal('profile')}
        />

        <AddBankModal
          isOpen={showBankModal}
          onClose={() => handleCloseModal('profile')}
          showToast={handleShowToast}
        />

        <RewardClaimModal
          isOpen={showRewardModal}
          onClose={() => handleCloseModal('profile')}
        />

        <SubordinateListModal
          isOpen={showSubordinateModal}
          onClose={() => handleCloseModal('profile')}
        />

        <RecordsFinanceiroModal
          isOpen={showRecordsModal}
          onClose={() => handleCloseModal('profile')}
          showToast={handleShowToast}
        />

        <DepositUSDTModal
          isOpen={showDepositUSDTModal}
          onClose={() => handleCloseModal('deposit')}
          showToast={handleShowToast}
          data={navigationData}
          onNavigate={handleNavigate}
        />

        <DetalhesPayModal
          isOpen={showDetalhesModal}
          onClose={() => handleCloseModal('home')}
          showToast={handleShowToast}
          data={navigationData}
          onNavigate={handleNavigate}
        />

        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => handleCloseModal('profile')}
          showToast={handleShowToast}
        />

        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => handleCloseModal('home')}
          showToast={handleShowToast}
          onNavigate={handleNavigate}
        />

        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => handleCloseModal('home')}
          showToast={handleShowToast}
        />
      </Suspense>

      {/* Bottom Navigation */}
      {session && ['home', 'shop', 'profile', 'tasks', 'gift-chest', 'invite-page'].includes(currentPage) && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 pb-2 pt-1.5 flex justify-between items-center z-50 h-[56px]">
          {[
            { id: 'home', icon: 'home', label: 'Home' },
            { id: 'tasks', icon: 'schedule', label: 'Tarefas' },
            { id: 'shop', icon: 'add', isFab: true },
            { id: 'invite-page', icon: 'groups', label: 'Equipe' },
            { id: 'profile', icon: 'person', label: 'Meu' }
          ].map((item) => (
            item.isFab ? (
              <div key={item.id} className="relative -top-5">
                <button
                  onClick={() => handleNavigate(item.id)}
                  className="w-12 h-12 bg-[#f27f0d] text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-900/20 ring-4 ring-white active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[28px] font-bold">add</span>
                </button>
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${currentPage === item.id ? 'text-[#f27f0d]' : 'text-slate-400'}`}
              >
                <div className="relative">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: currentPage === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                </div>
                <span className="text-[9px] font-semibold tracking-tight uppercase leading-none">{item.label}</span>
              </button>
            )
          ))}
          {/* iOS Home Indicator - Smaller */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-100/50 rounded-full"></div>
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

