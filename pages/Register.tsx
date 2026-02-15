import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';

interface Props {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const Register: React.FC<Props> = ({ onNavigate, showToast }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const { withLoading } = useLoading();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) setInvitationCode(refCode);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      showToast?.("App já está instalado ou não disponível para instalação.", "info");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast?.("App instalado com sucesso!", "success");
      setShowInstallButton(false);
    } else {
      showToast?.("Instalação cancelada.", "info");
    }

    setDeferredPrompt(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneNumber.length !== 9) {
      showToast?.("O número de telefone deve ter exatamente 9 dígitos.", "error");
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9]{6,8}$/;
    if (!passwordRegex.test(password)) {
      showToast?.("A senha deve ser alfanumérica (letras e números) e ter entre 6 e 8 caracteres.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast?.("As senhas não coincidem.", "error");
      return;
    }

    if (!invitationCode) {
      showToast?.("Por favor insira o código do convite.", "warning");
      return;
    }

    try {
      await withLoading(async () => {
        const email = `${phoneNumber}@bpcommerce.user`;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              phone: phoneNumber,
              referred_by: invitationCode
            }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error("Este número já está registrado.");
          }
          throw error;
        }
      }, "Registro realizado com sucesso!");

      setTimeout(() => onNavigate('login'), 1500);

    } catch (err: any) {
      showToast?.(err.message || "Erro ao registrar.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header laranja com padrão de pontos */}
      <div className="relative w-full max-w-md bg-[#FF6B1A] overflow-hidden shrink-0" style={{ height: '280px' }}>
        {/* Padrão de pontos */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 2px, transparent 2px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Logo e título centralizados */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          {/* Logo do Home Depot */}
          <div className="mb-4">
            <img
              src="/logo.semfungo.png"
              alt="The Home Depot"
              className="w-32 h-auto"
            />
          </div>

          {/* Título "THE HOME-VIP" */}
          <h1 className="text-white text-xl font-bold tracking-wider">THE HOME-VIP</h1>
        </div>
      </div>

      {/* Card de formulário com tab arredondada */}
      <div className="w-full max-w-md px-4 -mt-8 relative z-10 flex-1 flex flex-col mx-auto transition-all duration-300">
        <div className="bg-white rounded-t-[32px] shadow-lg overflow-hidden flex-1">
          {/* Tab "Cadastre-se por telefone" */}
          <div className="relative">
            <div className="inline-block bg-[#FFD4B8] rounded-tr-[24px] rounded-tl-[24px] px-6 py-3">
              <span className="text-[#2C3E50] font-semibold text-[15px]">Cadastre-se por telefone</span>
            </div>
          </div>

          {/* Formulário */}
          <form className="px-6 pt-6 pb-8 space-y-4" onSubmit={handleRegister}>
            {/* Campo de telefone */}
            <div>
              <label className="block text-[#2C3E50] font-semibold text-sm mb-2">
                Número de telefone
              </label>
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 gap-2 border border-transparent focus-within:border-[#FF6B1A]/30 focus-within:ring-4 focus-within:ring-[#FF6B1A]/10 transition-all">
                <span className="text-[#2C3E50] font-medium text-sm">+244</span>
                <input
                  type="tel"
                  placeholder="Número de telefone"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] font-semibold placeholder:text-[#9CA3AF]"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 9) {
                      setPhoneNumber(value);
                    }
                  }}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div>
              <label className="block text-[#2C3E50] font-semibold text-sm mb-2">
                Senha (6-8 letras e números)
              </label>
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 gap-2 border border-transparent focus-within:border-[#FF6B1A]/30 focus-within:ring-4 focus-within:ring-[#FF6B1A]/10 transition-all">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] font-semibold placeholder:text-[#9CA3AF]"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    if (value.length <= 8) {
                      setPassword(value);
                    }
                  }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9CA3AF] hover:text-[#FF6B1A] transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Campo de confirmar senha */}
            <div>
              <label className="block text-[#2C3E50] font-semibold text-sm mb-2">
                Digite novamente a senha
              </label>
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 gap-2 border border-transparent focus-within:border-[#FF6B1A]/30 focus-within:ring-4 focus-within:ring-[#FF6B1A]/10 transition-all">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] font-semibold placeholder:text-[#9CA3AF]"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    if (value.length <= 8) {
                      setConfirmPassword(value);
                    }
                  }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#9CA3AF] hover:text-[#FF6B1A] transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Campo de código de convite */}
            <div>
              <label className="block text-[#2C3E50] font-semibold text-sm mb-2">
                Código de Convite
              </label>
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 border border-transparent focus-within:border-[#FF6B1A]/30 focus-within:ring-4 focus-within:ring-[#FF6B1A]/10 transition-all">
                <input
                  type="text"
                  placeholder="Código de Convite"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] font-semibold placeholder:text-[#9CA3AF]"
                  value={invitationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                    const urlParams = new URLSearchParams(window.location.search);
                    if (!urlParams.get('ref')) {
                      setInvitationCode(value);
                    }
                  }}
                  readOnly={!!(new URLSearchParams(window.location.search)).get('ref')}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                className="w-full h-12 bg-[#FF6B1A] text-white font-bold rounded-xl text-base hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
              >
                Inscrever-se
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full h-12 bg-white text-[#FF6B1A] border-2 border-[#FF6B1A] font-bold rounded-xl text-base hover:bg-[#FFF5F0] active:scale-[0.98] transition-all"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
