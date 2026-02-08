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
    <div className="bg-bg-neutral min-h-screen font-sans text-text-main flex flex-col items-center pb-12 antialiased relative">
      {/* Immersive Header - Orange Theme with Pattern */}
      <div className="w-full relative h-[280px] header-gradient-mixture overflow-hidden flex flex-col items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}></div>

        {/* Top bar icons */}
        <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
          <button className="flex items-center justify-center size-10 rounded-full bg-black/10 text-white backdrop-blur-sm active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">headset_mic</span>
          </button>
        </div>

        <div className="absolute top-6 right-6 z-20">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/10 text-white backdrop-blur-sm text-[12px] font-bold active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">language</span>
            Português
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
        </div>

        {/* Logo and Brand */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-2xl mb-4 border-2 border-primary/20">
            <div className="flex flex-col items-center leading-none text-primary">
              <span className="text-[10px] font-black italic tracking-tighter">THE</span>
              <span className="text-[18px] font-black tracking-tightest">HOME</span>
              <span className="text-[14px] font-black italic tracking-tighter">DEPOT</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">THE HOME-VIP</h1>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full px-4 -mt-10 relative z-30">
        <div className="bg-white rounded-[32px] overflow-hidden shadow-premium">
          {/* Tab Header */}
          <div className="flex">
            <div className="bg-white px-8 py-4 rounded-tr-[32px] relative">
              <span className="text-primary font-black text-[15px]">Acessar minha conta</span>
            </div>
            <div className="flex-1 bg-transparent"></div>
          </div>

          {/* Form Content */}
          <form className="p-8 pt-4 flex flex-col gap-6" onSubmit={handleLogin}>
            {/* Phone Input Group */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-text-main ml-1">Número de telefone</label>
              <div className="bg-input-bg rounded-[16px] h-[58px] flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/20 transition-all border border-primary/5">
                <span className="text-text-main font-bold text-[14px]">+244</span>
                <input
                  type="tel"
                  placeholder="Número de telefone"
                  className="bg-transparent flex-1 h-full outline-none text-text-main font-semibold placeholder:text-text-secondary/40 text-[15px]"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-text-main ml-1">Senha</label>
              <div className="bg-input-bg rounded-[16px] h-[58px] flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/20 transition-all border border-primary/5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  className="bg-transparent flex-1 h-full outline-none text-text-main font-semibold placeholder:text-text-secondary/40 text-[15px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-main/60">
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              className="w-full h-[54px] bg-primary text-white font-bold rounded-[14px] text-[16px] mt-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              Entrar Agora
            </button>

            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="w-full h-[54px] bg-white text-primary border-2 border-primary/40 font-bold rounded-[14px] text-[16px] hover:bg-primary/5 active:scale-[0.98] transition-all"
            >
              Criar Nova Conta
            </button>
          </form>
        </div>
      </div>

      {/* Support Icon */}
      <button className="fixed bottom-6 right-6 size-12 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-100 z-[100] active:scale-90 transition-all">
        <img src="https://ui-avatars.com/api/?name=Support&background=fdf2f8&color=ef4444" className="w-full h-full rounded-full object-cover" alt="Support" />
      </button>

      {/* Decorative footer curve */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-200/50 rounded-t-[100%] blur-[2px]"></div>
    </div>
  );
};

export default Login;
