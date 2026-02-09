import React, { useState } from 'react';
import { supabase } from '../supabase';

interface ChangePasswordProps {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onNavigate, showToast }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast?.("Por favor, preencha todos os campos.", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast?.("A nova senha e a confirmação não coincidem.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast?.("A nova senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        showToast?.(`Erro ao atualizar: ${error.message}`, "error");
      } else {
        showToast?.("Senha alterada com sucesso!", "success");
        setTimeout(() => onNavigate('profile'), 2000);
      }
    } catch (err: any) {
      showToast?.("Ocorreu um erro inesperado.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FF6F00] min-h-screen flex flex-col items-center font-sans antialiased">
      {/* Status Bar */}
      <div className="w-full h-12 flex items-center justify-between px-6 text-white">
        <span className="text-sm font-semibold">9:41</span>
        <div className="flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-sm">wifi</span>
          <span className="material-symbols-outlined text-sm">battery_full</span>
        </div>
      </div>

      {/* Header */}
      <header className="w-full px-4 py-2 flex items-center relative">
        <button
          onClick={() => onNavigate('profile')}
          className="z-10 text-white p-2"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium">
          Alterar a senha
        </h1>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md px-4 mt-6">
        <div className="bg-white dark:bg-neutral-900 rounded-[28px] p-6 shadow-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Senha Antiga */}
            <div className="relative">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-14 px-4 pr-12 bg-[#FFF5F0] dark:bg-neutral-800 border-none rounded-xl text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Senha Antiga"
                type={showCurrent ? "text" : "password"}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                <span className="material-symbols-outlined">
                  {showCurrent ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Nova Senha */}
            <div className="relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-14 px-4 pr-12 bg-[#FFF5F0] dark:bg-neutral-800 border-none rounded-xl text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Nova Senha"
                type={showNew ? "text" : "password"}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                type="button"
                onClick={() => setShowNew(!showNew)}
              >
                <span className="material-symbols-outlined">
                  {showNew ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Re-introduza a nova palavra-passe */}
            <div className="relative">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 px-4 pr-12 bg-[#FFF5F0] dark:bg-neutral-800 border-none rounded-xl text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Re-introduza a nova palavra-passe"
                type={showConfirm ? "text" : "password"}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <span className="material-symbols-outlined">
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* Botão Confirme */}
            <button
              className="w-full bg-primary hover:bg-orange-600 active:scale-[0.98] transition-all text-white font-medium py-4 rounded-2xl mt-4 shadow-lg shadow-primary/20"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'confirme'}
            </button>
          </form>
        </div>
      </main>

      {/* Avatar de suporte flutuante */}
      <div className="fixed bottom-10 right-6">
        <div className="relative group cursor-pointer" onClick={() => onNavigate('support')}>
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl transition-transform active:scale-90">
            <img
              alt="Customer Service Representative"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVMsuBX2ic9czUhYRcjD5re9s0_u1JVpGnN0qDdgOqZCmpgzpaGT-BU639iXHlLT0Q3JpCBo9BAidZZdIhy_CmoO2ycCztKP-JaAv5zeKC9Kcf3dlLYJXGZpGCKNLaoAkx7SRBDoDcW4Ffd_f76RfHImKFl8bY4p6coFd-3KqpOTVbjf_GhemPQQTCGKsCzZYXyb8VEOJuYuKz0dg8uN38E9jzPzSleOR4x1vY489hVSZN8G7yw8hC9ggdfynwfGaLuyC7xS-2-0Ks"
            />
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </div>

      {/* Indicador inferior */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full"></div>
    </div>
  );
};

export default ChangePassword;
