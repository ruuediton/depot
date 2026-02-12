
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNetwork } from '../contexts/NetworkContext';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
  onNavigate: (page: any) => void;
  onOpenSupport?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

interface BonusTransaction {
  id: string;
  user_id: string;
  codigo_presente: string;
  valor_recebido: number;
  data_recebimento: string;
  status: 'success' | 'failed';
}

const GiftChest: React.FC<Props> = ({ onNavigate, onOpenSupport, showToast }) => {
  const { runWithTimeout } = useNetwork();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [isOpening, setIsOpening] = useState(false);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [history, setHistory] = useState<BonusTransaction[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await runWithTimeout(() => supabase
        .from('bonus_transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_recebimento', { ascending: false })
        .limit(10));

      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      // Falha silenciosa
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleRedeem = async () => {
    if (!promoCode.trim()) {
      showToast?.("Por favor, digite código.", "warning");
      return;
    }

    setLoading(true);
    try {
      // Validação de sessão no client first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      // Chamada RPC
      const { data, error } = await supabase.rpc('redeem_gift_code', {
        p_code: promoCode.trim()
      });

      if (error) {
        throw new Error("Não foi possível processar o pedido. Tente novamente");
      }

      if (!data.success) {
        throw new Error(data.message || "Código inválido ou expirado.");
      }

      // SUCCESS FLOW
      setIsOpening(true); // Trigger shake animation

      // Delay to simulate "opening"
      setTimeout(() => {
        setLastReward(data.amount || 0);
        setIsOpen(true);
        setIsOpening(false);
        setPromoCode('');
        showToast?.(data.message || "Resgate sucedido!", "success");
        fetchHistory();
      }, 1500);

    } catch (error: any) {
      showToast?.(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col font-sans antialiased">
      <header className="header-gradient-mixture pb-16 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <div className="px-6 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-white font-black tracking-widest text-sm">HOME DEPOT</span>
          </div>
          <button
            onClick={() => onOpenSupport?.()}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[24px]">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 max-w-lg mx-auto w-full pb-20 pt-6">
        {/* Header / Label */}
        <div className="mb-4">
          <span className="bg-[#00C853]/10 text-[#00C853] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00C853]/20">
            {isOpen ? 'PARABÉNS!' : 'RESGATE SEU CÓDIGO'}
          </span>
        </div>

        {/* HeadlineText */}
        <h1 className="text-[#111] tracking-tight text-[26px] font-bold leading-tight px-4 text-center pb-2">
          {isOpen ? 'Presente Resgatado!' : 'Tens um presente para abrir!'}
        </h1>

        {/* BodyText */}
        <p className="text-gray-500 text-[14px] font-medium leading-relaxed pb-6 px-10 text-center">
          {isOpen
            ? `O valor foi adicionado ao seu saldo principal.`
            : 'Introduz o teu código abaixo para resgatar agora.'
          }
        </p>

        {/* Redemption Input Area - Only show if not open */}
        {!isOpen && (
          <div className="w-full px-6 mb-10">
            <div className="bg-gray-50 rounded-2xl h-16 flex items-center px-5 gap-3 relative border border-gray-100 focus-within:border-[#00C853] focus-within:ring-4 focus-within:ring-[#00C853]/10 transition-all">
              <span className="material-symbols-outlined text-[#00C853] text-[28px]">redeem</span>
              <input
                type="text"
                placeholder="Insira o seu código aqui"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={loading || isOpening}
                className="bg-transparent flex-1 h-full outline-none text-[#111] font-semibold placeholder:text-gray-400 text-[15px]"
              />
            </div>
          </div>
        )}

        {/* Treasure Chest Visual */}
        <div className="relative w-full flex items-center justify-center mb-10 h-64">

          {/* Enhanced Glow background */}
          <div className={`absolute size-64 bg-[#00C853]/10 rounded-full blur-[60px] transition-all duration-1000 ${isOpen ? 'scale-150 opacity-100' : 'scale-75 opacity-20'}`}></div>
          <div className={`absolute size-40 bg-yellow-400/10 rounded-full blur-[40px] transition-all duration-1000 ${isOpen ? 'scale-150 opacity-100 animate-pulse' : 'scale-0 opacity-0'}`}></div>

          {/* Chest Container */}
          <div className={`relative z-10 transition-all duration-500 transform 
            ${isOpening ? 'animate-shake scale-105' : ''} 
            ${isOpen ? 'scale-125' : ''}`}>

            {/* The Box */}
            <div className="relative w-44 h-44 bg-[#1e1c14] rounded-[32px] border-4 border-[#2d2b22] shadow-2xl overflow-hidden flex flex-col">

              {/* Lid */}
              <div className={`absolute top-0 inset-x-0 h-1/2 bg-[#2d2b22] border-b-4 border-[#1e1c14] z-20 transition-all duration-700 origin-top
                ${isOpen ? '-rotate-x-110 -translate-y-8 opacity-0' : 'rotate-x-0 translate-y-0 opacity-100'}`}>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/20 rounded-full"></div>
              </div>

              {/* Box Front Panel with Lock */}
              <div className="flex-1 flex items-center justify-center relative bg-gradient-to-br from-[#1e1c14] to-black">
                {/* Lock Circle */}
                <div className={`size-16 rounded-full flex items-center justify-center transition-all duration-700 z-30
                  ${isOpen ? 'bg-[#00C853] scale-0 opacity-0 rotate-180' : 'bg-[#2d2b22] border-4 border-[#3a3830] shadow-inner'}`}>
                  <span className="material-symbols-outlined text-[#00C853] text-[32px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lock
                  </span>
                </div>

                {/* Reward Inside Reveal */}
                {isOpen && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center animate-reveal-reward overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00C853]/20 via-transparent to-transparent"></div>
                    <span className="material-symbols-outlined text-yellow-400 text-5xl mb-1 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">payments</span>
                    <p className="text-white text-xl font-bold tracking-tight">+Kz {lastReward?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Currency Badge Kz - Floating */}
            <div className={`absolute -bottom-2 -right-4 bg-[#00C853] text-black font-black px-5 py-2.5 rounded-2xl shadow-xl transition-all duration-700
              ${isOpen ? 'scale-110 -translate-y-4 -translate-x-4 rotate-0' : 'rotate-12 hover:rotate-0'}`}>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span className="text-xl font-bold">Kz</span>
              </div>
            </div>

            {/* Floating Particles if open */}
            {isOpen && (
              <div className="absolute inset-x-[-40px] inset-y-[-40px] pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 size-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute top-3/4 right-1/4 size-3 bg-[#00C853] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="absolute top-1/2 left-0 size-2 bg-white rounded-full animate-ping [animation-delay:0.4s]"></div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full space-y-4 px-6 relative z-20">
          {isOpen ? (
            <div className="space-y-3 animate-fade-in-up">
              <div className="bg-[#00C853]/5 border border-[#00C853]/10 p-4 rounded-2xl text-center mb-2">
                <p className="text-[#00C853] text-sm font-bold">Resgate Realizado: <span className="text-black font-black">Kz {lastReward?.toLocaleString()}</span></p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setLastReward(null);
                }}
                className="flex w-full items-center justify-center rounded-2xl h-[45px] bg-white border-2 border-[#00C853] text-[#00C853] text-base font-black active:scale-95 transition-all shadow-sm"
              >
                <span>Resgatar Outro Código</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleRedeem}
              disabled={loading || isOpening}
              className={`flex w-full items-center justify-center rounded-2xl h-[45px] bg-[#00C853] text-white text-[16px] font-black active:scale-95 transition-all shadow-lg shadow-[#00C853]/20
                ${(loading || isOpening) ? 'opacity-50 grayscale' : 'hover:brightness-110'}`}
            >
              <span>{loading || isOpening ? 'Validando Código...' : 'Abrir Presente Agora'}</span>
            </button>
          )}

          {!isOpen && (
            <button
              onClick={() => onNavigate('home')}
              className="w-full text-center text-gray-400 text-[12px] font-black py-2 tracking-widest uppercase hover:text-[#111] transition-colors"
            >
              Guardar para mais tarde
            </button>
          )}
        </div>

        {/* Redeemed Gifts History */}
        <div className="w-full mt-14 px-2">
          <div className="flex items-center justify-between mb-6 px-3">
            <h3 className="text-[#111] text-lg font-bold tracking-tight">Presentes Resgatados</h3>
            <button onClick={() => onNavigate('reward-claim')} className="text-[#00C853] text-[13px] font-bold hover:underline">Ver todos</button>
          </div>

          <div className="flex flex-col gap-3">
            {fetchingHistory ? (
              <div className="flex justify-center p-8">
                <SpokeSpinner size="w-8 h-8" />
              </div>
            ) : history.length > 0 ? (
              history.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 bg-white/50 border rounded-2xl transition-all ${index === 0 && isOpen ? 'border-primary ring-2 ring-primary/20 bg-primary/5 scale-[1.02]' : 'border-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full flex items-center justify-center ${item.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <span className="material-symbols-outlined icon-filled">
                        {item.status === 'success' ? 'check_circle' : 'error'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-black font-bold text-sm">
                          {item.status === 'success' ? 'Resgate Concluído' : 'Falha no Resgate'}
                        </p>
                        {index === 0 && isOpen && (
                          <span className="bg-primary text-[#181711] text-[10px] font-black px-1.5 py-0.5 rounded uppercase">Recente</span>
                        )}
                      </div>
                      <p className="text-black/50 text-xs text-left">
                        {new Date(item.data_recebimento).toLocaleTimeString()} • {(() => {
                          const code = item.codigo_presente || '';
                          if (code.length <= 4) return code;
                          return code.slice(0, 2) + "**" + code.slice(-2);
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold block ${item.status === 'success' ? 'text-green-600' : 'text-red-400'}`}>
                      {item.status === 'success' ? `+ Kz ${item.valor_recebido || 0}` : 'Inválido'}
                    </span>
                    <span className="text-[10px] text-black/40 font-bold uppercase">{new Date(item.data_recebimento).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-sm font-medium">Nenhum presente resgatado ainda.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer decoration */}
      <div className="h-2 bg-primary/5 w-full mt-auto"></div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-2deg); }
          50% { transform: translateX(8px) rotate(2deg); }
          75% { transform: translateX(-4px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }
        
        @keyframes reveal-reward {
          0% { transform: scale(0) translateY(20px); opacity: 0; }
          60% { transform: scale(1.1) translateY(-10px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-reveal-reward {
          animation: reveal-reward 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .rotate-x-110 { transform: rotateX(-110deg); }
      `}</style>
    </div>
  );
};

export default GiftChest;

