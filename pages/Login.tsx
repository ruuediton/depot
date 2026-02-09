import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNetwork } from '../contexts/NetworkContext';
import { useLoading } from '../contexts/LoadingContext';
import OptimizedButton from '../components/OptimizedButton';

interface Props {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const Login: React.FC<Props> = ({ onNavigate, showToast }) => {
  const { runWithTimeout } = useNetwork();
  const { withLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const cleanPassword = password.trim();

    if (!cleanPhone || cleanPhone.length < 9) {
      showToast?.("Número de telefone inválido.", "error");
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6 || cleanPassword.length > 8) {
      showToast?.("A senha deve ter entre 6 e 8 caracteres.", "error");
      return;
    }

    try {
      await withLoading(async () => {
        const { data: status, error: statusError } = await supabase.rpc('check_login_status', {
          phone_input: cleanPhone
        });

        if (!statusError && status?.blocked) {
          throw new Error(status.message);
        }

        const email = `${cleanPhone}@bpcommerce.user`;

        const { error: loginError } = await runWithTimeout(() => supabase.auth.signInWithPassword({
          email,
          password: cleanPassword,
        }));

        if (loginError) {
          await supabase.rpc('register_failed_attempt', { phone_input: cleanPhone });
          throw new Error("Credenciais inválidas");
        }

        await supabase.rpc('reset_login_attempts', { phone_input: cleanPhone });
      }, "Login sucedido!");

      onNavigate('home');
    } catch (error: any) {
      showToast?.(error.message || "Erro ao entrar", "error");
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen font-sans text-text-main flex flex-col antialiased relative">
      {/* Header laranja com padrão de bolinhas */}
      <div className="w-full relative overflow-hidden flex flex-col items-center justify-start pt-6 pb-20" style={{
        background: 'linear-gradient(180deg, #FF7A1F 0%, #FF6B00 100%)'
      }}>
        {/* Padrão de bolinhas */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)',
          backgroundSize: '32px 32px'
        }}></div>

        {/* Ícone headset - canto superior esquerdo */}
        <div className="absolute top-5 left-5 z-20">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white backdrop-blur-sm active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]">headset_mic</span>
          </button>
        </div>

        {/* Seletor de idioma - canto superior direito */}
        <div className="absolute top-5 right-5 z-20">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/20 text-white backdrop-blur-sm text-[13px] font-semibold active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">language</span>
            Português
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>

        {/* Logo THE HOME DEPOT */}
        <div className="relative z-10 flex flex-col items-center mt-8">
          <div className="mb-5">
            <svg width="160" height="80" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="160" height="80" fill="white" rx="8" />
              <text x="80" y="25" fontFamily="Arial Black, sans-serif" fontSize="14" fontWeight="900" fill="#FF6B00" textAnchor="middle" fontStyle="italic">THE</text>
              <text x="80" y="48" fontFamily="Arial Black, sans-serif" fontSize="28" fontWeight="900" fill="#FF6B00" textAnchor="middle" letterSpacing="-1">HOME</text>
              <text x="80" y="68" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="900" fill="#FF6B00" textAnchor="middle" fontStyle="italic">DEPOT</text>
            </svg>
          </div>
          <h1 className="text-[26px] font-black text-white tracking-[0.15em] uppercase drop-shadow-lg">The Home Depot</h1>
        </div>
      </div>

      {/* Card de login com curva decorativa */}
      <div className="w-full px-5 -mt-12 relative z-30">
        <div className="bg-white rounded-t-[40px] overflow-hidden shadow-xl relative">
          {/* Curva decorativa superior */}
          <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-full bg-[#F5E6D3] -mt-8"></div>
              <div className="w-20 h-20 rounded-full bg-[#F5E6D3] -mt-10"></div>
              <div className="w-16 h-16 rounded-full bg-[#F5E6D3] -mt-8"></div>
            </div>
          </div>

          {/* Tab "Login do telefone" */}
          <div className="flex justify-end pt-10 pr-6">
            <div className="bg-white px-6 py-2.5 rounded-t-2xl relative">
              <span className="text-[#1A1A1A] font-semibold text-[15px]">Login do telefone</span>
            </div>
          </div>

          {/* Formulário */}
          <form className="px-6 pt-6 pb-8 flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Campo Número de telefone */}
            <div className="space-y-2.5">
              <label className="text-[14px] font-semibold text-[#1A1A1A] block">Número de telefone</label>
              <div className="bg-[#F5E6D3] rounded-xl h-[52px] flex items-center px-4 gap-3 border border-[#E8D4BD]">
                <span className="text-[#1A1A1A] font-semibold text-[15px]">+1</span>
                <input
                  type="tel"
                  placeholder="Número de telefone"
                  className="bg-transparent flex-1 h-full outline-none text-[#1A1A1A] font-medium placeholder:text-[#999999] text-[15px]"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2.5">
              <label className="text-[14px] font-semibold text-[#1A1A1A] block">Senha</label>
              <div className="bg-[#F5E6D3] rounded-xl h-[52px] flex items-center px-4 gap-3 border border-[#E8D4BD]">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className="bg-transparent flex-1 h-full outline-none text-[#1A1A1A] font-medium placeholder:text-[#999999] text-[15px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#666666]">
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              className="w-full h-[52px] bg-[#FF6B00] text-white font-bold rounded-xl text-[16px] mt-6 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
            >
              Entrar
            </button>

            {/* Botão Inscrever-se */}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="w-full h-[52px] bg-white text-[#FF6B00] border-2 border-[#FF6B00] font-bold rounded-xl text-[16px] hover:bg-[#FFF5EE] active:scale-[0.98] transition-all"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </div>

      {/* Avatar de suporte - canto inferior direito */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-white z-[100] active:scale-90 transition-all overflow-hidden">
        <img src="https://ui-avatars.com/api/?name=Support&background=FF6B00&color=ffffff&size=128" className="w-full h-full object-cover" alt="Support" />
      </button>
    </div>
  );
};

export default Login;
