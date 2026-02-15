import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNetwork } from '../contexts/NetworkContext';
import { useLoading } from '../contexts/LoadingContext';

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

    if (phoneNumber.length !== 9) {
      showToast?.("O número de telefone 9 dígitos.", "error");
      return;
    }

    const passwordRegex = /^[a-zA-Z0-9]{6,8}$/;
    if (!passwordRegex.test(password)) {
      showToast?.("A senha deve ser alfanumérica (letras e números) e ter entre 6 e 8 caracteres.", "error");
      return;
    }

    try {
      await withLoading(async () => {
        const { data: status, error: statusError } = await supabase.rpc('check_login_status', {
          phone_input: phoneNumber
        });

        if (!statusError && status?.blocked) {
          throw new Error(status.message);
        }

        const email = `${phoneNumber}@bpcommerce.user`;

        const { error: loginError } = await runWithTimeout(() => supabase.auth.signInWithPassword({
          email,
          password: password,
        }));

        if (loginError) {
          await supabase.rpc('register_failed_attempt', { phone_input: phoneNumber });
          throw new Error("Credenciais inválidas");
        }

        await supabase.rpc('reset_login_attempts', { phone_input: phoneNumber });
      }, "Login sucedido!");

      onNavigate('home');
    } catch (error: any) {
      showToast?.(error.message || "Erro ao entrar", "error");
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1">
          {/* Tab "Login do telefone" */}
          <div className="relative">
            <div className="inline-block bg-[#FFD4B8] rounded-tr-[24px] rounded-tl-[24px] px-6 py-3">
              <span className="text-[#2C3E50] font-semibold text-[15px]">Login do telefone</span>
            </div>
          </div>

          {/* Formulário */}
          <form className="px-6 pt-6 pb-8 space-y-4" onSubmit={handleLogin}>
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
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div className="space-y-3.5">
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
                  autoComplete="current-password"
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

            <div className="flex flex-col gap-4 mt-8">
              {/* Botão Entrar */}
              <button
                type="submit"
                className="w-full h-12 bg-[#FF6B1A] text-white font-bold rounded-xl text-base hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
              >
                Entrar
              </button>

              {/* Botão Inscrever-se */}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="w-full h-12 bg-white text-[#FF6B1A] border-2 border-[#FF6B1A] font-bold rounded-xl text-base hover:bg-[#FFF5F0] active:scale-[0.98] transition-all"
              >
                Inscrever-se
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
