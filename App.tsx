import React, { lazy, Suspense, useState, useEffect, useRef, useCallback, ReactElement, cloneElement } from 'react';

const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/ShopPage'));
const Wallet = lazy(() => import('../pages/Wallet'));
const Profile = lazy(() => import('../pages/Profile'));
const Report = lazy(() => import('../pages/Report'));
const AddBank = lazy(() => import('../pages/AddBank'));
const Recharge = lazy(() => import('../pages/Recharge'));
const PurchaseHistory = lazy(() => import('../pages/PurchaseHistory'));
const ChangePassword = lazy(() => import('../pages/ChangePassword'));
const AccountHistory = lazy(() => import('../pages/AccountHistory'));
const Register = lazy(() => import('../pages/Register'));
const Withdraw = lazy(() => import('../pages/Withdraw'));
const Login = lazy(() => import('../pages/Login'));
const SecurityVerify = lazy(() => import('../pages/SecurityVerify'));
const Rewards = lazy(() => import('../pages/Rewards'));
const GiftChest = lazy(() => import('../pages/GiftChest'));
const RewardClaim = lazy(() => import('../pages/RewardClaim'));
const Info = lazy(() => import('../pages/Info'));
const AboutBP = lazy(() => import('../pages/AboutBP'));
const DepositUSDT = lazy(() => import('../pages/DepositUSDT'));
const DepositUSDTHistory = lazy(() => import('../pages/DepositUSDTHistory'));
const WalletHistory = lazy(() => import('../pages/WalletHistory'));
const WithdrawalHistory = lazy(() => import('../pages/WithdrawalHistory'));
const SubordinateList = lazy(() => import('../pages/SubordinateList'));
const InvitePage = lazy(() => import('../pages/InvitePage'));
const GuiaIndicacao = lazy(() => import('../components/GuiaIndicacao'));

const PAGE_TITLES: Record<string, string> = {
  'home': 'Início',
  'shop': 'Loja BP',
  'register': 'Criar Conta',
  'login': 'Acessar Conta',
  'profile': 'Meu Perfil',
  'about-bp': 'Quem Somos',
  'wallet': 'Carteira',
  'deposit': 'Recarga',
  'retirada': 'Retirada',
  'investimentos-fundo': 'Marketplace',
  'historico-fundos': 'Meus Pedidos',
  'ganhos-tarefas': 'Recompensas',
  'invite-page': 'Convidar Amigos',
  'security-verify': 'Segurança',
  'deposit-usdt-history': 'Histórico USDT',
  'subordinate-list': 'Equipe',
};

import LoadingOverlay from '../components/LoadingOverlay';
import SpokeSpinner from '../components/SpokeSpinner';
import FloatingSupportButton from '../components/FloatingSupportButton';
import WelcomeModal from '../components/WelcomeModal';
import TaskPopup from '../components/TaskPopup';



import { supabase } from './supabase';
import { ToastType } from '../components/Toast';
import { Session } from '@supabase/supabase-js';

import { useLoading } from '../contexts/LoadingContext';

const App: React.FC = () => {
  const { withLoading, showSuccess, showWarning, showError, showLoading, hideLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState<any>('register');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const title = PAGE_TITLES[currentPage] || 'BP Commerce';
    document.title = `${title} | BP`;

    // Always trigger task check when returning to home
    if (currentPage === 'home' && session) {
      setShowTaskPopup(true);
    }
  }, [currentPage, session]);


  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success': showSuccess(message); break;
      case 'error': showError(message); break;
      case 'warning': showWarning(message); break;
      default: showSuccess(message); break;
    }
  }, [showSuccess, showError, showWarning]);

  useEffect(() => {
    let profileSubscription: any = null;

    const initializeApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await fetchProfile(session.user.id);
        profileSubscription = setupRealtimeSubscription(session.user.id);
      } else {
        const params = new URLSearchParams(window.location.search);
        if (params.get('ref')) {
          setCurrentPage('register');
        }
      }

      // Signal that basic initialization is done
      document.body.classList.add('app-loaded');
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        if (!profileSubscription) {
          profileSubscription = setupRealtimeSubscription(session.user.id);
        }
      } else {
        setProfile(null);
        if (profileSubscription) {
          profileSubscription.unsubscribe();
          profileSubscription = null;
        }
        setCurrentPage('register');
      }

      // Initial task check on login/init
      if (session) {
        setShowTaskPopup(true);
      }
    });


    function setupRealtimeSubscription(userId: string) {
      return supabase
        .channel(`profile-changes-${userId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          (payload) => setProfile(payload.new)
        )
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const resetSessionTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!session) return;

    const sessionDuration = 30 * 60 * 1000; // 30 minutos conforme solicitado

    timerRef.current = setTimeout(async () => {
      await performFullLogout();
      showWarning('Sessão expirada. Por favor, acesse sua conta novamente.');
    }, sessionDuration);
  }, [session, showError]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart'];
    const handleActivity = () => resetSessionTimer();

    if (session) {
      events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
      resetSessionTimer();
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session, resetSessionTimer]);

  const handleNavigate = useCallback((page: any, data: any = null) => {
    if (page === currentPage) return;
    setNavigationData(data);

    if (page === 'home' && !sessionStorage.getItem('welcome_shown')) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('welcome_shown', 'true');
    }

    const heavyPages = ['historico-conta', 'historico-p2p', 'withdrawal-history', 'purchase-history', 'shop'];

    if (heavyPages.includes(page)) {
      withLoading(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        setCurrentPage(page);
      });
    } else {
      setCurrentPage(page);
    }
  }, [currentPage, withLoading]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const performFullLogout = async () => {
    try {
      showLoading(); // Sem mensagem para ser mais limpo e rápido

      // 1. Sign out from Supabase (Cessa comunicação com DB)
      await supabase.auth.signOut();

      // 2. Clear LocalStorage and SessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear all Cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      // 4. Reset UI State immediately
      setProfile(null);
      setSession(null);
      setShowLogoutModal(false);

      // 5. Hard redirect to login to clear memory heap & network history for the session
      window.location.href = window.location.origin + window.location.pathname + '#/login';
      // Fallback para navegação interna se o href não disparar imediatamente
      setCurrentPage('login');

    } catch (error) {
      console.error("Logout process error"); // Log mínimo sem detalhes sensíveis
    } finally {
      hideLoading();
    }
  };

  const renderPageComponent = () => {
    const publicPages = [
      'login',
      'register'
    ];
    if (!session && !publicPages.includes(currentPage)) {
      return <Register onNavigate={handleNavigate} showToast={showToast} />;
    }

    const pagesMap: Record<string, ReactElement> = {
      'home': <Home onNavigate={handleNavigate} profile={profile} />,
      'shop': <Shop onNavigate={handleNavigate} showToast={showToast} balance={profile?.balance || 0} />,
      'wallet': <TransferenciaP2P onNavigate={handleNavigate} showToast={showToast} />,
      'profile': <Profile onNavigate={handleNavigate} profile={profile} onLogout={handleLogout} />,
      'add-bank': <AddBank onNavigate={handleNavigate} showToast={showToast} />,
      'deposit': <Recharge onNavigate={handleNavigate} showToast={showToast} />,
      'purchase-history': <PurchaseHistory onNavigate={handleNavigate} showToast={showToast} profile={profile} />,
      'change-password': <ChangePassword onNavigate={handleNavigate} />,
      'historico-conta': <AccountHistory onNavigate={handleNavigate} />,
      'register': <Register onNavigate={handleNavigate} showToast={showToast} />,
      'retirada': <Withdraw onNavigate={handleNavigate} showToast={showToast} />,
      'login': <Login onNavigate={handleNavigate} showToast={showToast} />,
      'security-verify': <SecurityVerify onNavigate={handleNavigate} showToast={showToast} />,
      'ganhos-tarefas': <Rewards onNavigate={handleNavigate} />,
      'gift-chest': <GiftChest onNavigate={handleNavigate} showToast={showToast} />,
      'reward-claim': <RewardClaim onNavigate={handleNavigate} />,
      'deposit-usdt': <DepositUSDT onNavigate={handleNavigate} showToast={showToast} data={navigationData} />,
      'deposit-usdt-history': <DepositUSDTHistory onNavigate={handleNavigate} />,
      'info': <Info onNavigate={handleNavigate} />,
      'about-bp': <AboutBP onNavigate={handleNavigate} />,
      'subordinate-list': <SubordinateList onNavigate={handleNavigate} />,
      'deposit-history': <WalletHistory onNavigate={handleNavigate} />,
      'withdrawal-history': <WithdrawalHistory onNavigate={handleNavigate} />,
      'invite-page': <InvitePage onNavigate={handleNavigate} showToast={showToast} />,
      'guia-indicacao': <GuiaIndicacao onNavigate={handleNavigate} />
    };

    const target = pagesMap[currentPage] || <Home onNavigate={handleNavigate} profile={profile} />;
    return cloneElement(target, { onNavigate: handleNavigate, onLogout: handleLogout, showToast });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F6] max-w-md mx-auto shadow-premium overflow-x-hidden relative">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-[#F4F7F6]">
            <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
          </div>
        }>
          {renderPageComponent()}
        </Suspense>
        {session && <FloatingSupportButton />}
      </main>

      {/* Conditionally Render Task Popup */}
      {showTaskPopup && session && (
        <TaskPopup
          onClose={() => setShowTaskPopup(false)}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}

      {/* Conditionally Render Welcome Modal - Only on Home */}

      {showWelcomeModal && session && currentPage === 'home' && (
        <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
      )}

      {/* Bottom Navigation */}
      {session && ['home', 'shop', 'profile', 'invite-page'].includes(currentPage) && (

        <nav className="fixed bottom-4 left-4 right-4 max-w-[calc(448px-2rem)] mx-auto glass-panel rounded-[28px] py-3 px-6 z-40 shadow-glass">
          <div className="flex justify-between items-center bg-transparent">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'home' ? 'text-[#00C853] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`relative ${currentPage === 'home' ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#00C853] after:rounded-full' : ''}`}>
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentPage === 'home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
              </div>
              <span className={`text-[10px] font-bold ${currentPage === 'home' ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>Início</span>
            </button>

            <button
              onClick={() => setCurrentPage('shop')}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'shop' ? 'text-[#00C853] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`relative ${currentPage === 'shop' ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#00C853] after:rounded-full' : ''}`}>
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentPage === 'shop' ? "'FILL' 1" : "'FILL' 0" }}>oil_barrel</span>
              </div>
              <span className={`text-[10px] font-bold ${currentPage === 'shop' ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>Investir</span>
            </button>

            <button
              onClick={() => setCurrentPage('invite-page')}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'invite-page' ? 'text-[#00C853] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`relative ${currentPage === 'invite-page' ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#00C853] after:rounded-full' : ''}`}>
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentPage === 'invite-page' ? "'FILL' 1" : "'FILL' 0" }}>groups</span>
              </div>
              <span className={`text-[10px] font-bold ${currentPage === 'invite-page' ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>Convidar</span>
            </button>

            <button
              onClick={() => setCurrentPage('profile')}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'profile' ? 'text-[#00C853] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`relative ${currentPage === 'profile' ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#00C853] after:rounded-full' : ''}`}>
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: currentPage === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>account_circle</span>
              </div>
              <span className={`text-[10px] font-bold ${currentPage === 'profile' ? 'opacity-100' : 'opacity-0 h-0 invisible'}`}>Meu BP</span>
            </button>
          </div>
        </nav>
      )}


      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-[320px] rounded-[40px] p-8 relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] scale-100 animate-in zoom-in-95 duration-300 border border-white/50">
            <div className="flex flex-col items-center text-center">
              <div className="size-20 rounded-[32px] bg-gradient-to-br from-[#00C853]/10 to-[#00C853]/5 flex items-center justify-center mb-6 shadow-inner">
                <span className="material-symbols-outlined text-[#00C853] text-4xl font-light">logout</span>
              </div>
              <h3 className="text-[22px] font-black text-[#0F1111] mb-2 tracking-tight">Encerrar Sessão?</h3>
              <p className="text-gray-500 text-[14px] font-medium mb-8 leading-relaxed px-2">
                Sua conexão será fechada e os dados de navegação serão removidos para sua segurança.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={performFullLogout}
                  className="w-full h-[54px] bg-[#00C853] text-white rounded-[20px] font-black text-[15px] uppercase tracking-wider active:scale-[0.96] transition-all shadow-[0_12px_24px_-8px_rgba(0,200,83,0.5)] hover:brightness-110"
                >
                  Confirmar Saída
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full h-[50px] text-gray-400 font-bold text-[12px] uppercase tracking-widest hover:text-gray-600 transition-all"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default App;

