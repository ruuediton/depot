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

    if (phoneNumber.length < 9) {
      showToast?.("Número de telefone inválido.", "error");
      return;
    }

    if (password.length < 6) {
      showToast?.("A senha deve ter pelo menos 6 caracteres.", "error");
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header laranja com padrão de pontos */}
      <div className="relative w-full bg-[#FF6B1A] overflow-hidden" style={{ height: '280px' }}>
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
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/2560px-TheHomeDepot.svg.png"
              alt="The Home Depot"
              className="w-48 h-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          {/* Título "THE HOME-VIP" */}
          <h1 className="text-white text-xl font-bold tracking-wider">THE HOME-VIP</h1>
        </div>
      </div>

      {/* Card de formulário com tab arredondada */}
      <div className="flex-1 px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-t-[32px] shadow-lg overflow-hidden">
          {/* Tab "Cadastre-se por telefone" */}
          <div className="relative">
            <div className="inline-block bg-[#FFD4B8] rounded-tr-[24px] rounded-tl-[24px] px-6 py-3">
              <span className="text-[#2C3E50] font-semibold text-[15px]">Cadastre-se por telefone</span>
            </div>
          </div>

          {/* Formulário */}
          <form className="px-6 pt-6 pb-8 space-y-3.5" onSubmit={handleRegister}>
            {/* Campo de telefone */}
            <div>
              <label className="block text-[#2C3E50] font-semibold text-sm mb-2">
                Número de telefone
              </label>
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 gap-2">
                <span className="text-[#2C3E50] font-medium text-sm">+244</span>
                <input
                  type="tel"
                  placeholder="Número de telefone"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] placeholder:text-[#9CA3AF]"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 9) {
                      setPhoneNumber(value);
                    }
                  }}
                  maxLength={9}
                  pattern="[0-9]{9}"
                  required
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div>
              <label className="block text-[#2C3E50] font-semibold text-sm mb-2">
                Senha
              </label>
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] placeholder:text-[#9CA3AF]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9CA3AF]"
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
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4 gap-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite novamente a senha"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] placeholder:text-[#9CA3AF]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#9CA3AF]"
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
              <div className="flex items-center bg-[#FFF5F0] rounded-xl h-12 px-4">
                <input
                  type="text"
                  placeholder="Código de Convite"
                  className="flex-1 bg-transparent outline-none text-[#2C3E50] placeholder:text-[#9CA3AF]"
                  value={invitationCode}
                  onChange={(e) => {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (!urlParams.get('ref')) {
                      setInvitationCode(e.target.value);
                    }
                  }}
                  readOnly={!!(new URLSearchParams(window.location.search)).get('ref')}
                  required
                />
              </div>
            </div>

            {/* Botão Inscrever-se */}
            <button
              type="submit"
              className="w-full h-12 bg-[#FF6B1A] text-white font-bold rounded-xl text-base mt-5 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Inscrever-se
            </button>

            {/* Botão Entrar */}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full h-12 bg-white text-[#FF6B1A] border-2 border-[#FF6B1A] font-semibold rounded-xl text-base hover:bg-[#FFF5F0] active:scale-[0.98] transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* Ícone de suporte flutuante no canto inferior direito */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-50 overflow-hidden">
        <img
          src="https://ui-avatars.com/api/?name=Support&background=FF6B1A&color=fff&size=56"
          className="w-full h-full object-cover"
          alt="Support"
        />
      </button>
    </div>
  );
};

export default Register;
