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

  const filterInput = (val: string) => val.replace(/[^a-zA-Z0-9]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast?.("Por favor, introduza a sua senha antiga.", "warning");
      return;
    }

    if (!newPassword) {
      showToast?.("A nova senha não pode estar vazia.", "warning");
      return;
    }

    if (!confirmPassword) {
      showToast?.("Por favor, confirme a sua nova senha.", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast?.("As senhas introduzidas não são iguais.", "error");
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
    <div className="bg-[#FF6B00] min-h-screen flex flex-col font-sans antialiased">
      {/* Header Fiel à Imagem */}
      <header className="w-full h-14 flex items-center px-4 relative">
        <button
          onClick={() => onNavigate('profile')}
          className="z-10 text-white"
        >
          <span className="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>
        <h1 className="absolute inset-0 flex items-center justify-center text-white text-[16px] font-medium">
          Alterar a senha
        </h1>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 mt-4">
        <div className="bg-white rounded-[32px] p-8 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Senha Antiga */}
            <div className="relative">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(filterInput(e.target.value))}
                className="w-full h-[54px] px-6 pr-12 bg-[#FFF5F0] border-none rounded-[20px] text-gray-400 placeholder-gray-400 focus:ring-0 focus:outline-none transition-all text-sm font-medium"
                placeholder="Senha Antiga"
                type={showCurrent ? "text" : "password"}
              />
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800"
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showCurrent ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* Nova Senha */}
            <div className="relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(filterInput(e.target.value))}
                className="w-full h-[54px] px-6 pr-12 bg-[#FFF5F0] border-none rounded-[20px] text-gray-400 placeholder-gray-400 focus:ring-0 focus:outline-none transition-all text-sm font-medium"
                placeholder="Nova Senha"
                type={showNew ? "text" : "password"}
              />
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800"
                type="button"
                onClick={() => setShowNew(!showNew)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNew ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* Re-introduza a nova palavra-passe */}
            <div className="relative">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(filterInput(e.target.value))}
                className="w-full h-[54px] px-6 pr-12 bg-[#FFF5F0] border-none rounded-[20px] text-gray-400 placeholder-gray-400 focus:ring-0 focus:outline-none transition-all text-sm font-medium"
                placeholder="Re-introduza a nova palavra-passe"
                type={showConfirm ? "text" : "password"}
              />
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800"
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirm ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* Botão Confirme - Igual à foto */}
            <button
              className="w-full bg-[#FF6B00] hover:bg-orange-600 active:scale-[0.98] transition-all text-white font-medium h-[54px] rounded-[20px] mt-2 flex items-center justify-center"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'confirme'}
            </button>
          </form>
        </div>
      </main>

      {/* Ícone de suporte flutuante */}
      <div className="fixed bottom-24 right-4">
        <div
          className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white/20 active:scale-90 transition-transform cursor-pointer"
          onClick={() => onNavigate('support')}
        >
          <img
            alt="Customer Service"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVMsuBX2ic9czUhYRcjD5re9s0_u1JVpGnN0qDdgOqZCmpgzpaGT-BU639iXHlLT0Q3JpCBo9BAidZZdIhy_CmoO2ycCztKP-JaAv5zeKC9Kcf3dlLYJXGZpGCKNLaoAkx7SRBDoDcW4Ffd_f76RfHImKFl8bY4p6coFd-3KqpOTVbjf_GhemPQQTCGKsCzZYXyb8VEOJuYuKz0dg8uN38E9jzPzSleOR4x1vY489hVSZN8G7yw8hC9ggdfynwfGaLuyC7xS-2-0Ks"
          />
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
