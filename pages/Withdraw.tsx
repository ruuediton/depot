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
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [method, setMethod] = useState<'IBAN' | 'Multicaixa'>('IBAN');
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedBankId('');
  }, [method]);

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
        setBankAccounts(banks);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTaxRate = () => {
    return method === 'IBAN' ? 0.14 : 0.20; // 14% para IBAN, 20% para Multicaixa
  };

  const calculateTax = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val * getTaxRate();
  };

  const calculateReceived = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;
    return val - calculateTax();
  };

  const isWithinAllowedTime = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 10 && hours < 16;
  };

  const handleWithdraw = async () => {
    const val = parseFloat(amount);

    if (!isWithinAllowedTime()) {
      showToast?.("Retiradas permitidas apenas entre 10:00 e 16:00", "warning");
      return;
    }

    if (!amount || isNaN(val) || val <= 0) {
      showToast?.("Digite um valor válido", "error");
      return;
    }

    if (val < 1000) {
      showToast?.("Valor mínimo: 1.000 Kz", "warning");
      return;
    }

    if (val > 100000) {
      showToast?.("Valor máximo: 100.000 Kz", "warning");
      return;
    }

    if (val > balance) {
      showToast?.("Saldo insuficiente", "error");
      return;
    }

    if (!selectedBankId) {
      showToast?.("Selecione seu IBAN de retirada", "error");
      return;
    }

    if (!securityPassword) {
      showToast?.("Digite a senha de segurança", "error");
      return;
    }

    if (!/^\d{4}$/.test(securityPassword)) {
      showToast?.("O PIN deve conter exatamente 4 dígitos", "error");
      return;
    }

    try {
      await withLoading(async () => {
        const { error } = await supabase.rpc('request_withdrawal', {
          p_amount: val,
          p_pin: securityPassword,
          p_bank_id: selectedBankId,
          p_method: method
        });

        if (error) throw error;

        showToast?.("Retirada solicitada com sucesso", "success");
        setAmount('');
        setSecurityPassword('');
        fetchData();
      }, "Processando saque...");
    } catch (error: any) {
      showToast?.(error.message || "Operação não sucedida", "error");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#FF6B00]">
      <SpokeSpinner size="w-8 h-8" color="text-white" />
    </div>
  );

  return (
    <div className="bg-[#FF6B00] dark:bg-zinc-950 min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#FF6B00] dark:bg-zinc-950 relative pb-10">
        {/* Header */}
        <header className="flex items-center px-4 py-4 text-white">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-medium mr-6">Retirar</h1>
        </header>

        {/* Main Content */}
        <div className="px-4 space-y-4">
          {/* Card Principal */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">Conta de retirada</h2>
                <p className="text-red-500 text-sm">Retirada em 24 horas</p>
              </div>
              <div className="w-10 h-10 bg-[#FF6B00] rounded-md flex items-center justify-center text-white text-[8px] font-bold text-center p-1 leading-none uppercase">
                Store Logo
              </div>
            </div>

            {/* Balanço Total */}
            <div className="bg-[#F2F2F2] dark:bg-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Balanço total</p>
              <p className="text-[#FF6B00] text-xl font-semibold">{balance.toLocaleString('pt-AO')} Kz</p>
            </div>

            {/* Método de Retirada */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-700 dark:text-gray-300">Método de retirada:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMethod('IBAN')}
                  className={`px-3 py-1.5 rounded flex items-center gap-1 text-xs font-medium border ${method === 'IBAN'
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                    : 'bg-white dark:bg-zinc-800 text-gray-500 border-gray-200 dark:border-zinc-700'
                    }`}
                >
                  <span className={`rounded-full w-4 h-4 flex items-center justify-center ${method === 'IBAN' ? 'bg-white text-[#FF6B00]' : 'bg-zinc-400 text-white'
                    }`}>
                    <span className="material-symbols-outlined text-[10px]">account_balance</span>
                  </span>
                  IBAN
                </button>
                <button
                  onClick={() => setMethod('Multicaixa')}
                  className={`px-3 py-1.5 rounded flex items-center gap-1 text-xs font-medium border ${method === 'Multicaixa'
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                    : 'bg-white dark:bg-zinc-800 text-gray-500 border-gray-200 dark:border-zinc-700'
                    }`}
                >
                  <span className={`rounded-full w-4 h-4 flex items-center justify-center ${method === 'Multicaixa' ? 'bg-white text-[#FF6B00]' : 'bg-zinc-400 text-white'
                    }`}>
                    <span className="material-symbols-outlined text-[10px]">credit_card</span>
                  </span>
                  Multicaixa
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              {/* Valor */}
              <div className="relative">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#FDF4EE] dark:bg-[#2d2d2d] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FF6B00]/20 dark:text-white placeholder-gray-400"
                  placeholder="Valor (1.000 - 100.000 Kz)"
                  type="text"
                  autoComplete="off"
                  name="withdrawal-amount"
                />
              </div>

              {/* Seletor de IBAN */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="w-full bg-[#FDF4EE] dark:bg-[#2d2d2d] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FF6B00]/20 dark:text-white text-left flex items-center justify-between"
                >
                  <span className={selectedBankId ? 'text-gray-800 dark:text-white' : 'text-gray-400'}>
                    {selectedBankId
                      ? bankAccounts.find(b => b.id === selectedBankId)?.bank_name || `Selecione seu ${method}`
                      : `Por favor selecione seu ${method} de retirada`}
                  </span>
                  <span className="material-symbols-outlined text-gray-400">
                    {showBankDropdown ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showBankDropdown && bankAccounts.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 max-h-48 overflow-y-auto">
                    {bankAccounts.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBankId(bank.id);
                          setShowBankDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm border-b border-gray-100 dark:border-zinc-700 last:border-0"
                      >
                        <div className="font-medium text-gray-800 dark:text-white">{bank.bank_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{bank.iban}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Senha de Segurança */}
              <div className="relative">
                <input
                  value={securityPassword}
                  onChange={(e) => setSecurityPassword(e.target.value)}
                  className="w-full bg-[#FDF4EE] dark:bg-[#2d2d2d] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FF6B00]/20 dark:text-white placeholder-gray-400"
                  placeholder="Senha de segurança"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  name="withdrawal-pin"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-xl"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            {/* Resumo de Taxas */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tarifas</span>
                <span className="font-medium dark:text-white text-gray-800">0 Kz</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Taxa de desconto ({method === 'IBAN' ? '14%' : '20%'})
                </span>
                <span className="font-medium dark:text-white text-gray-800">{calculateTax().toLocaleString('pt-AO')} Kz</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Na verdade recebido</span>
                <span className="font-medium dark:text-white text-gray-800">{calculateReceived().toLocaleString('pt-AO')} Kz</span>
              </div>
            </div>

            {/* Botão Confirme */}
            <button
              onClick={handleWithdraw}
              className="w-full bg-[#FF6B00] text-white py-4 rounded-xl font-semibold text-lg active:scale-[0.98] transition-transform"
            >
              confirme
            </button>
          </div>

          {/* Card de Informações */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4 text-sm leading-relaxed text-gray-800 dark:text-gray-300">
              <p>1: Valor mínimo de retirada: 1.000 Kz | Valor máximo: 100.000 Kz</p>
              <p>2: Horário de retirada: 10:00 às 16:00 horas</p>
              <p>3: O saque chegará à sua conta bancária em até 24 horas úteis</p>
              <p>4: Certifique-se de que os dados bancários coincidem com o titular da conta</p>
              <p>5: Taxa de desconto: IBAN (14%) | Multicaixa (20%)</p>
            </div>
          </div>
        </div>

        <div className="h-10"></div>

        {/* CSS Custom */}
        <style>{`
          .custom-input {
            background-color: #FDF4EE;
          }
          .dark .custom-input {
            background-color: #2d2d2d;
            border-color: #444;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Withdraw;
