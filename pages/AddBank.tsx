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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Custom Mini Toast State
  const [localError, setLocalError] = useState<string | null>(null);

  const BANK_PREFIXES: Record<string, string> = {
    "Banco BAI": "0040",
    "Banco BFA": "0006",
    "Banco BIC": "0051",
    "Banco Atlântico": "0055",
    "Banco Sol": "0044",
    "Banco BNI": "0009"
  };

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  useEffect(() => {
    checkExistingBank();
  }, []);

  const checkExistingBank = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc('get_my_bank_accounts');
      if (data && data.length > 0) {
        setExistingBank(data[0]);
        setMode('view');
      }
    } catch (err) {
      console.error('Erro, no servidor', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (existingBank) {
      setBankName(existingBank.nome_banco);
      setHolderName(existingBank.nome_completo);
      setIban(existingBank.iban);
      setMode('edit');
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bancos_clientes')
        .delete()
        .eq('user_id', existingBank.user_id);

      if (error) throw error;

      showToast?.('Apagada sucesso!', 'success');
      setExistingBank(null);
      setBankName('');
      setHolderName('');
      setIban('');
      setMode('create');
    } catch (error: any) {
      showToast?.('Erro ao deletar: ' + (error.message || 'Erro desconhecido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Apenas números
    setIban(value);
  };

  const handleSaveBank = async () => {
    try {
      setLocalError(null);
      let cleanIban = iban.replace(/\D/g, ''); // Apenas números

      // 1. Validação Estrita de 21 dígitos
      if (cleanIban.length !== 21) {
        setLocalError("O IBAN deve ter exatamente 21 dígitos.");
        return;
      }

      // 2. Formatação Final (Sempre AO06 + 21 dígitos)
      let finalIban = `AO06${cleanIban}`;

      // 3. Validação de Prefixo do Banco
      if (bankName && BANK_PREFIXES[bankName]) {
        const expectedPrefix = BANK_PREFIXES[bankName];
        const currentPrefix = cleanIban.substring(0, 4); // Os primeiros 4 números do IBAN angolano são o código do banco

        if (currentPrefix !== expectedPrefix) {
          setLocalError(`Este IBAN não corresponde ao ${bankName}. Verifique se selecionou o banco correto.`);
          return;
        }
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

        showToast?.("Bem sucedido", "success");
        await checkExistingBank();
        setTimeout(() => onNavigate('profile'), 1200);
      }, "Salvando dados bancários...");

    } catch (err: any) {
      if (err.message && !err.message.includes('loading')) {
        setLocalError(err.message);
      }
    }
  };

  const currentBankPrefix = bankName ? BANK_PREFIXES[bankName] : '';
  const ibanPlaceholder = "Digite os 21 números do seu IBAN";

  const maskIban = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/\s/g, '');
    if (clean.length < 13) return val;
    return `${clean.substring(0, 8)}*****${clean.substring(clean.length - 9)}`;
  };

  return (
    <div className="bg-[#F4F7F6] min-h-screen font-display text-gray-900 pb-20 antialiased selection:bg-[#00C853]/10">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-[#0F1111] to-[#1A1C1C] pt-12 pb-24 px-6 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C853]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 overflow-hidden pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C853]/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 overflow-hidden pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <button
            onClick={() => onNavigate('profile')}
            className="size-11 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-white text-[18px] font-black tracking-tight">
            {mode === 'view' ? 'Dados Bancários' : mode === 'edit' ? 'Editar Conta' : 'Nova Conta'}
          </h1>
          <div className="size-11"></div>
        </div>
      </div>

      <main className="px-6 -mt-16 relative z-10 space-y-8">
        {mode === 'view' ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[36px] p-8 shadow-premium border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">verified</span>
              </div>

              <div className="text-center mb-8">
                <div className="size-16 bg-[#EEFFF5] rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <span className="material-symbols-outlined text-[#00C853] text-[32px]">verified_user</span>
                </div>
                <h2 className="text-[20px] font-black text-gray-900 tracking-tight leading-none">Conta Vinculada</h2>
                <p className="text-gray-400 text-[14px] font-medium mt-1">Seus ganhos serão enviados para aqui.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100/50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Banco</span>
                  <p className="text-[15px] font-black text-gray-900">{existingBank?.nome_banco}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100/50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Titular da Conta</span>
                  <p className="text-[15px] font-black text-gray-900">{existingBank?.nome_completo}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100/50">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">IBAN Destino</span>
                  <p className="text-[14px] font-black text-gray-900 font-mono tracking-tighter break-all">
                    {existingBank?.iban}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 px-2">
              <button
                onClick={handleEdit}
                className="w-full h-[60px] bg-gray-900 text-white font-black rounded-[24px] text-[15px] uppercase tracking-widest shadow-xl active:scale-[0.97] transition-all"
              >
                Editar Dados
              </button>
              <button
                onClick={handleDelete}
                className="w-full h-[54px] text-red-500 font-bold text-[13px] uppercase tracking-widest hover:bg-red-50 rounded-[20px] transition-all"
              >
                Remover Conta
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[36px] p-8 shadow-premium border border-white/50 space-y-6">
              <div className="mb-4">
                <h2 className="text-[20px] font-black text-gray-900 tracking-tight leading-none">Dados Bancários</h2>
                <p className="text-gray-400 text-[14px] font-medium mt-1">Vincule uma conta para receber seus lucros.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Selecione o Banco</label>
                  <div className="group bg-gray-50 rounded-[24px] h-[64px] flex items-center px-5 gap-4 border-2 border-transparent focus-within:border-[#00C853] transition-all relative">
                    <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-[#00C853] shadow-sm">
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="bg-transparent flex-1 h-full outline-none text-gray-900 font-black appearance-none cursor-pointer text-[15px] pr-10"
                    >
                      <option value="">Escolha seu banco...</option>
                      <option value="Banco BAI">Banco BAI</option>
                      <option value="Banco BFA">Banco BFA</option>
                      <option value="Banco BIC">Banco BIC</option>
                      <option value="Banco Atlântico">Banco Atlântico</option>
                      <option value="Banco Sol">Banco Sol</option>
                      <option value="Banco BNI">Banco BNI</option>
                    </select>
                    <span className="material-symbols-outlined text-gray-300 absolute right-5 pointer-events-none">unfold_more</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nome do Titular</label>
                  <div className="group bg-gray-50 rounded-[24px] h-[64px] flex items-center px-5 gap-4 border-2 border-transparent focus-within:border-[#00C853] transition-all">
                    <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-[#00C853] shadow-sm">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <input
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="bg-transparent flex-1 h-full outline-none text-gray-900 font-black placeholder:text-gray-200 text-[15px]"
                      placeholder="Nome completo"
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">IBAN (21 Dígitos)</label>
                  <div className="group bg-gray-50 rounded-[24px] h-[64px] flex items-center px-5 gap-4 border-2 border-transparent focus-within:border-[#00C853] transition-all">
                    <div className="size-10 rounded-2xl bg-white flex items-center justify-center text-[#00C853] shadow-sm">
                      <span className="material-symbols-outlined">pin</span>
                    </div>
                    <input
                      value={iban}
                      onChange={handleIbanChange}
                      maxLength={21}
                      className="bg-transparent flex-1 h-full outline-none text-gray-900 font-mono font-black placeholder:text-gray-200 text-[15px] tracking-tight"
                      placeholder="0000 0000 0000 0000 0000 0"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={handleSaveBank}
                disabled={loading}
                className="w-full h-[64px] bg-[#00C853] text-white font-black rounded-[24px] text-[15px] uppercase tracking-widest shadow-[0_16px_32px_-8px_rgba(0,200,83,0.5)] active:scale-[0.97] transition-all flex items-center justify-center"
              >
                {loading ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'Salvar Dados'}
              </button>

              {mode === 'edit' && (
                <button
                  onClick={() => setMode('view')}
                  className="w-full h-[54px] text-gray-400 font-bold text-[13px] uppercase tracking-widest hover:text-gray-600 transition-all"
                >
                  Cancelar
                </button>
              )}

              <div className="flex items-center justify-center gap-2 opacity-30 pt-4">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Servidor Bancário Blindado</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mini Toast */}
      {localError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl max-w-sm mx-4 text-center text-sm font-medium pointer-events-auto">
            {localError}
          </div>
        </div>
      )}

      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="size-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0F1111]">Apagar Conta?</h3>
                <p className="text-[#565959] text-sm">Esta ação não pode ser desfeita. Você precisará vincular novamente para realizar saques.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={confirmDelete}
                  className="w-full h-[45px] bg-red-500 text-white font-black text-[15px] rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  Confirmar Exclusão
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full h-[45px] text-[#565959] font-bold text-[14px] hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Manter Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBank;

