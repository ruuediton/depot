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
    <div className="bg-[#FF6B00] min-h-screen flex flex-col items-center font-sans antialiased text-white">
      {/* Header */}
      <header className="w-full px-4 py-6 flex items-center relative">
        <button
          onClick={() => onNavigate('profile')}
          className="z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-white">chevron_left</span>
        </button>
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-xl font-black tracking-tight italic">
          Alterar a senha
        </h1>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md px-5 mt-4">
        <div className="bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle decorative background element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Senha Antiga */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha Atual</label>
              <div className="relative">
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full h-[54px] px-5 pr-12 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all font-bold"
                  placeholder="Introduza a senha antiga"
                  type={showCurrent ? "text" : "password"}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showCurrent ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nova Senha</label>
              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full h-[54px] px-5 pr-12 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all font-bold"
                  placeholder="Mínimo 6 caracteres"
                  type={showNew ? "text" : "password"}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showNew ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Re-introduza a nova palavra-passe */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirmar Senha</label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full h-[54px] px-5 pr-12 bg-gray-50 border-2 border-transparent focus:border-primary/20 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all font-bold"
                  placeholder="Repita a nova senha"
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Botão Confirme */}
            <button
              className="w-full bg-primary hover:bg-[#E85D00] active:scale-[0.96] transition-all text-white font-black uppercase tracking-widest text-sm h-[56px] rounded-2xl mt-4 shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Confirmar Alteração</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Avatar de suporte flutuante */}
      <div className="fixed bottom-10 right-6">
        <div className="relative group cursor-pointer" onClick={() => onNavigate('support')}>
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl transition-transform hover:rotate-6 active:scale-90">
            <img
              alt="Customer Service Representative"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVMsuBX2ic9czUhYRcjD5re9s0_u1JVpGnN0qDdgOqZCmpgzpaGT-BU639iXHlLT0Q3JpCBo9BAidZZdIhy_CmoO2ycCztKP-JaAv5zeKC9Kcf3dlLYJXGZpGCKNLaoAkx7SRBDoDcW4Ffd_f76RfHImKFl8bY4p6coFd-3KqpOTVbjf_GhemPQQTCGKsCzZYXyb8VEOJuYuKz0dg8uN38E9jzPzSleOR4x1vY489hVSZN8G7yw8hC9ggdfynwfGaLuyC7xS-2-0Ks"
            />
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Bottom bar indicator */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/10 rounded-full"></div>
    </div>
  );
};

export default ChangePassword;
