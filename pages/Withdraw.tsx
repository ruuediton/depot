import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const Withdraw: React.FC<Props> = ({ onNavigate, showToast }) => {
  const { withLoading } = useLoading();
  const [balance, setBalance] = useState(0);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const FEE_PERCENT = 0.12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return onNavigate('login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profile) setBalance(profile.balance || 0);

      const { data: banks } = await supabase.rpc('get_my_bank_accounts');
      if (banks && banks.length > 0) {
        setBankAccount(banks[0]);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val * FEE_PERCENT;
  };

  const calculateLiquid = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val - calculateFee();
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleInitiateWithdraw = () => {
    if (!bankAccount) {
      showToast?.("Você precisa vincular uma conta bancária.", "warning");
      onNavigate('add-bank');
      return;
    }

    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      showToast?.("Digite um valor válido.", "error");
      return;
    }

    if (val < 300) {
      showToast?.("Valor mínimo de saque é 300 Kz.", "warning");
      return;
    }

    if (val > 200000) {
      showToast?.("Valor máximo de saque é 200.000 Kz.", "warning");
      return;
    }

    if (val > balance) {
      showToast?.("Saldo insuficiente.", "error");
      return;
    }

    const now = new Date();
    const angolaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Luanda' }));
    const currentHour = angolaTime.getHours();

    if (currentHour < 10 || currentHour >= 16) {
      showToast?.("O horário de retirada é das 10:00 às 16:00 (Fuso Angola).", "warning");
      return;
    }

    setShowPinModal(true);
  };

  const confirmWithdraw = async () => {
    try {
      await withLoading(async () => {
        const val = parseFloat(amount);

        const { error } = await supabase.rpc('request_withdrawal', {
          p_amount: val,
          p_pin: pin
        });

        if (error) throw error;

        showToast?.("Retirada solicitada com sucesso!", "success");
        setShowPinModal(false);
        setPin('');
        setAmount('');
        fetchData();
      }, "Processando saque...");
    } catch (error: any) {
      showToast?.(error.message || "Operação não sucedida.", "error");
    }
  };

  const maskIban = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/\s/g, '');
    if (clean.length < 13) return val;
    return `${clean.substring(0, 8)}*****${clean.substring(clean.length - 9)}`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <SpokeSpinner size="w-8 h-8" color="text-[#00C853]" />
    </div>
  );

  return (
    <div className="bg-[#F4F7F6] min-h-screen font-display text-gray-900 pb-20 antialiased">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-[#0F1111] to-[#1A1C1C] pt-12 pb-24 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C853]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 overflow-hidden pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C853]/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 overflow-hidden pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => onNavigate('home')}
            className="size-11 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-white text-[18px] font-black tracking-tight">Retirada</h1>
          <button
            onClick={() => onNavigate('withdrawal-history')}
            className="size-11 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
        </div>
      </div>

      <main className="px-6 -mt-16 relative z-10 space-y-6">
        {/* Floating Balance Card */}
        <div className="bg-white rounded-[36px] p-8 shadow-premium border border-white/50 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Saldo Disponível</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-black text-[#00C853] mb-2 uppercase tracking-tight">KZs</span>
            <span className="text-[36px] font-black text-gray-900 tracking-tighter leading-none">
              {balance.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-white rounded-[32px] p-8 shadow-premium border border-white/50">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Quantia do Saque</label>
            <div className="px-3 py-1 bg-gray-50 text-gray-400 text-[9px] font-black rounded-full border border-gray-100">TX 12%</div>
          </div>
          <div className="flex items-center gap-4 border-b-2 border-gray-50 focus-within:border-[#00C853] transition-all pb-4">
            <span className="text-[20px] font-black text-gray-400 tracking-tight">KZs</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent flex-1 outline-none text-[32px] font-black text-gray-900 placeholder:text-gray-100 tracking-tighter"
              placeholder="0,00"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-6">
            {[2000, 5000, 10000, 20000].map(val => (
              <button
                key={val}
                onClick={() => handleQuickAmount(val)}
                className="py-3 bg-gray-50 rounded-xl text-[12px] font-black text-gray-900 hover:bg-gray-100 transition-all border border-transparent active:scale-95"
              >
                {val.toLocaleString('pt-AO')}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Account */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Conta de Destino</p>
          {bankAccount ? (
            <div
              onClick={() => onNavigate('add-bank')}
              className="bg-white rounded-[32px] p-6 shadow-premium border border-white/50 flex items-center gap-5 cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              <div className="size-14 rounded-[20px] bg-[#EEFFF5] flex items-center justify-center text-[#00C853] shadow-inner">
                <span className="material-symbols-outlined text-[28px]">account_balance</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-black text-gray-900 truncate tracking-tight">{bankAccount.nome_banco}</p>
                <p className="text-[13px] text-gray-400 font-mono tracking-tighter mt-0.5">{maskIban(bankAccount.iban)}</p>
              </div>
              <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('add-bank')}
              className="w-full h-24 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-white hover:border-[#00C853] hover:text-[#00C853] transition-all bg-gray-50/50"
            >
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
              <span className="text-[12px] font-black uppercase tracking-widest">Vincular Conta</span>
            </button>
          )}
        </div>

      </main>

      <div className="fixed bottom-0 inset-x-0 p-8 z-[100]">
        <button
          onClick={handleInitiateWithdraw}
          className="w-full h-[64px] bg-[#00C853] text-white font-black text-[15px] rounded-[24px] uppercase tracking-widest shadow-[0_16px_32px_-8px_rgba(0,200,83,0.5)] active:scale-[0.97] transition-all flex items-center justify-center gap-3 group"
        >
          Confirmar Saque
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">bolt</span>
        </button>
      </div>

      {/* Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => !loading && setShowPinModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-t-[48px] sm:rounded-[40px] p-8 pb-12 sm:pb-8 border border-white/50 shadow-2xl scale-100 animate-in slide-in-from-bottom-20 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden"></div>

            <div className="text-center mb-8">
              <div className="size-16 rounded-[24px] bg-[#EEFFF5] flex items-center justify-center mx-auto mb-5 shadow-inner">
                <span className="material-symbols-outlined text-[32px] text-[#00C853]">verified_user</span>
              </div>
              <h3 className="text-[22px] font-black text-gray-900 tracking-tight">Segurança BP</h3>
              <p className="text-gray-400 text-[14px] font-medium mt-1">Digite sua senha de retirada de 4 dígitos.</p>
            </div>

            <div className="bg-gray-50 rounded-[32px] p-6 mb-8 border border-gray-100/50">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transferência</span>
                <span className="text-[15px] font-black text-gray-900">Kz {parseFloat(amount).toLocaleString('pt-AO')}</span>
              </div>
              <div className="flex justify-between items-center text-[#00C853]">
                <span className="text-[10px] font-black uppercase tracking-widest">Valor Líquido</span>
                <span className="text-[22px] font-black tracking-tighter">Kz {calculateLiquid().toLocaleString('pt-AO')}</span>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-[24px] h-[72px] w-full flex items-center px-1 border-2 border-gray-100 focus-within:border-[#00C853] transition-all shadow-sm">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-transparent text-center text-[36px] tracking-[24px] pl-[12px] font-black outline-none text-gray-900 placeholder:text-gray-100"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmWithdraw}
                disabled={pin.length < 4 || loading}
                className={`w-full h-[60px] rounded-[24px] font-black text-[15px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${pin.length === 4
                  ? 'bg-gray-900 text-white shadow-2xl active:scale-[0.96]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                  }`}
              >
                {loading ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'Confirmar Saque'}
              </button>
              <button
                disabled={loading}
                onClick={() => setShowPinModal(false)}
                className="w-full h-[54px] bg-transparent text-gray-400 font-bold text-[13px] uppercase tracking-widest hover:text-gray-600 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;

