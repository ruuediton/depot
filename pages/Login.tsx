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
    <div className="bg-[#FFF8F5] min-h-screen font-sans text-[#27153E] flex flex-col antialiased relative">
      {/* Header laranja com padrão de bolinhas */}
      <div className="w-full relative overflow-hidden flex flex-col items-center justify-start pt-12 pb-24" style={{
        backgroundColor: '#F96302',
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)`,
        backgroundSize: '18px 18px',
        backgroundPosition: '0 0'
      }}>


        {/* Logo e Título */}
        <div className="relative z-10 flex flex-col items-center mt-6">
          <div className="mb-6 drop-shadow-2xl">
            {/* Logo The Home Depot Style */}
            <div className="w-[110px] h-[110px] bg-[#F96302] border-[3px] border-white relative shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <span className="text-white font-[1000] italic text-[11px] leading-[0.8] tracking-tighter w-full text-left ml-4 -mb-1">THE</span>
                <span className="text-white font-[1000] text-[30px] leading-[0.8] tracking-[-0.05em] w-full text-center">HOME</span>
                <span className="text-white font-[1000] italic text-[19px] leading-[0.8] tracking-tighter w-full text-right mr-4 mt-1">DEPOT</span>
              </div>
            </div>
          </div>
          <h1 className="text-[26px] font-[900] text-white tracking-[0.05em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">THE HOME-VIP</h1>
        </div>
      </div>

      {/* Card de login que sobrepõe o header */}
      <div className="w-full px-0 -mt-10 relative z-30 flex-1">
        <div className="bg-white rounded-t-[40px] min-h-full shadow-[0_-15px_50px_rgba(0,0,0,0.08)] flex flex-col">
          {/* Sessão de Tab/Título do formulário */}
          <div className="flex justify-end pt-8 pr-12 pb-2">
            <span className="text-[#27153E] font-semibold text-[18px]">Login do telefone</span>
          </div>

          <form className="px-10 pt-4 pb-12 flex flex-col gap-7" onSubmit={handleLogin}>
            {/* Campo Número de telefone */}
            <div className="space-y-3.5">
              <label className="text-[17px] font-semibold text-[#27153E]">Número de telefone</label>
              <div className="bg-[#FFF6F0] rounded-[20px] h-[64px] flex items-center px-6 gap-4 border border-[#FDEEE7]">
                <span className="text-[#27153E] font-semibold text-[18px] opacity-80">+244</span>
                <input
                  type="tel"
                  placeholder="Número de telefone"
                  className="bg-transparent flex-1 h-full outline-none text-[#27153E] font-bold placeholder:text-[#27153E]/20 text-[17px]"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-3.5">
              <label className="text-[17px] font-semibold text-[#27153E]">Senha</label>
              <div className="bg-[#FFF6F0] rounded-[20px] h-[64px] flex items-center px-6 gap-4 border border-[#FDEEE7]">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className="bg-transparent flex-1 h-full outline-none text-[#27153E] font-bold placeholder:text-[#27153E]/20 text-[17px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#27153E]/40">
                  <span className="material-symbols-outlined text-[26px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5 mt-10">
              {/* Botão Entrar */}
              <button
                type="submit"
                className="w-full h-[64px] bg-[#F96302] text-white font-black rounded-[22px] text-[19px] shadow-[0_12px_30px_rgba(249,99,2,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Entrar
              </button>

              {/* Botão Inscrever-se */}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="w-full h-[64px] bg-white text-[#F96302] border-2 border-[#FDEEE7] font-black rounded-[22px] text-[19px] hover:bg-[#FFF6F0] active:scale-[0.98] transition-all"
              >
                Inscrever-se
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Support - Circular com imagem real */}
      <button className="fixed bottom-8 right-8 z-[200] w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-white active:scale-95 transition-all">
        <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=128"
          className="w-full h-full object-cover"
          alt="Support" />
      </button>

    </div>

  );
};

export default Login;
