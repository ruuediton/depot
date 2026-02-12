import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface AddBankProps {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AddBank: React.FC<AddBankProps> = ({ onNavigate, showToast }) => {
  const { withLoading } = useLoading();
  const [bankName, setBankName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [iban, setIban] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingBank, setExistingBank] = useState<any>(null);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');

  const BANK_PREFIXES: Record<string, string> = {
    "Banco BAI": "0040",
    "Banco BFA": "0006",
    "Banco BIC": "0051",
    "Banco Atlântico": "0055",
    "Banco Sol": "0044",
    "Banco BNI": "0009"
  };

  useEffect(() => {
    checkExistingBank();
  }, []);

  const checkExistingBank = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc('get_my_bank_accounts');
      if (data && data.length > 0) {
        setExistingBank(data[0]);
        setBankName(data[0].nome_banco);
        setHolderName(data[0].nome_completo);
        setIban(data[0].iban.replace('AO06', ''));
        setMode('edit');
      }
    } catch (err) {
      console.error('Erro no servidor', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    setIban(value);
  };

  const handleSaveBank = async () => {
    try {
      let cleanIban = iban.replace(/\D/g, '');

      if (cleanIban.length !== 21) {
        showToast?.("O IBAN deve ter exatamente 21 dígitos.", "error");
        return;
      }

      let finalIban = `AO06${cleanIban}`;

      if (bankName && BANK_PREFIXES[bankName]) {
        const expectedPrefix = BANK_PREFIXES[bankName];
        const currentPrefix = cleanIban.substring(0, 4);

        if (currentPrefix !== expectedPrefix) {
          showToast?.(`Este IBAN não corresponde ao ${bankName}. Verifique se selecionou o banco correto.`, "error");
          return;
        }
      }

      if (!bankName || !holderName) {
        showToast?.("Preencha todos os campos.", "error");
        return;
      }

      await withLoading(async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Sessão expirada. Acesse novamente.");
        }

        const payload = {
          p_bank_name: bankName,
          p_holder_name: holderName,
          p_iban: finalIban
        };

        const { error } = await supabase.rpc(
          mode === 'edit' ? 'update_bank_account' : 'add_bank_account',
          payload
        );

        if (error) throw error;

        showToast?.("Dados salvos com sucesso!", "success");
        await checkExistingBank();
        setTimeout(() => onNavigate('profile'), 1200);
      }, "Salvando dados bancários...");

    } catch (err: any) {
      showToast?.(err.message || "Erro ao salvar dados.", "error");
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
            onClick={() => onNavigate('profile')}
            className="flex items-center"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-medium mr-6">
            {mode === 'edit' ? 'Editar Conta Bancária' : 'Adicionar Conta Bancária'}
          </h1>
        </header>

        {/* Main Content */}
        <div className="px-4 space-y-4">
          {mode === 'edit' ? (
            /* View Data Mode (Compact & Flat as requested) */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">Sua conta bancária</h2>
                  <p className="text-gray-500 text-sm font-medium pt-1">Dados cadastrados no sistema</p>
                </div>
                <button
                  onClick={() => setMode('create')}
                  className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B00] active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">edit</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Banco</span>
                  <span className="text-sm font-bold text-slate-800">{bankName}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titular</span>
                  <span className="text-sm font-bold text-slate-800">{holderName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IBAN</span>
                  <span className="text-sm font-mono font-bold text-slate-800 tracking-wider">AO06 {iban}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Form Mode */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm">
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight">Dados Bancários</h2>
                  <p className="text-gray-500 text-sm font-medium">Vincule sua conta para receber</p>
                </div>
                <div className="w-10 h-10 bg-[#FF6B00] rounded-md flex items-center justify-center text-white text-[8px] font-semibold text-center p-1 leading-none uppercase">
                  Depot
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4 mb-6">
                {/* Selecione o Banco */}
                <div className="relative">
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#FDF4EE] dark:bg-[#2d2d2d] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FF6B00]/20 dark:text-white text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="">Selecione o Banco</option>
                    <option value="Banco BAI">Banco BAI</option>
                    <option value="Banco BFA">Banco BFA</option>
                    <option value="Banco BIC">Banco BIC</option>
                    <option value="Banco Atlântico">Banco Atlântico</option>
                    <option value="Banco Sol">Banco Sol</option>
                    <option value="Banco BNI">Banco BNI</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl">
                    expand_more
                  </span>
                </div>

                {/* Nome do Titular */}
                <div className="relative">
                  <input
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full bg-[#FDF4EE] dark:bg-[#2d2d2d] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FF6B00]/20 dark:text-white placeholder-gray-400"
                    placeholder="Nome completo do titular"
                    type="text"
                  />
                </div>

                {/* IBAN (21 Dígitos) */}
                <div className="relative">
                  <input
                    value={iban}
                    onChange={handleIbanChange}
                    maxLength={21}
                    className="w-full bg-[#FDF4EE] dark:bg-[#2d2d2d] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FF6B00]/20 dark:text-white placeholder-gray-400 font-mono"
                    placeholder="IBAN (21 dígitos)"
                    type="text"
                  />
                </div>
              </div>

              {/* Informação sobre IBAN */}
              <div className="bg-[#FFF9F0] dark:bg-zinc-800 rounded-xl p-4 mb-6 border border-orange-100 dark:border-zinc-700">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#FF6B00] text-xl mt-0.5">info</span>
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                      <strong>Importante:</strong> Digite apenas os 21 números do seu IBAN, sem o prefixo "AO06".
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={handleSaveBank}
                disabled={loading}
                className="w-full bg-[#FF6B00] text-white py-4 rounded-xl font-semibold text-lg active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {loading ? 'Salvando...' : existingBank ? 'Atualizar Dados' : 'Salvar Dados'}
              </button>
            </div>
          )}

          {/* Card de Informações - Only on Create/Edit */}
          {mode !== 'edit' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
              <div className="space-y-2 text-xs leading-relaxed text-gray-500">
                <p>O IBAN deve ter exatamente 21 dígitos numéricos.</p>
                <p>Todos os seus ganhos serão transferidos para esta conta.</p>
              </div>
            </div>
          )}
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

export default AddBank;
