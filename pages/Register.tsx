import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import OptimizedButton from '../components/OptimizedButton';

interface Props {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const Register: React.FC<Props> = ({ onNavigate, showToast }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const { withLoading } = useLoading();
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const generateCaptcha = () => {
    const chars = '0123456789'; // Numeric as shown in image (8615)
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(code);
    drawCaptcha(code);
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }


    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 200},${Math.random() * 200},${Math.random() * 200},0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }


    ctx.font = 'bold 24px monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Draw each character with slight rotation/color
    const startX = 20;
    const spacing = 20;

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      ctx.translate(startX + (i * spacing), canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 30%)`; // Random dark colors
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    generateCaptcha();
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

    if (!agreedToTerms) {
      showToast?.("Concorde com os termos da isenção de responsabilidade.", "warning");
      return;
    }

    if (captchaInput !== generatedCaptcha) {
      showToast?.("Código de verificação incorreto.", "error");
      generateCaptcha(); // Refresh captcha on error
      setCaptchaInput('');
      return;
    }

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
    <div className="bg-bg-neutral min-h-screen font-sans text-text-main flex flex-col items-center pb-12 antialiased relative">
      {/* Immersive Header - Orange Theme with Pattern */}
      <div className="w-full relative h-[280px] header-gradient-mixture overflow-hidden flex flex-col items-center justify-center">
        {/* Background Pattern - Simplified Dot Pattern via CSS */}
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
          <div className="w-24 h-24 bg-white p-2 rounded-xl rotate-0 flex items-center justify-center shadow-2xl mb-4 border-2 border-primary/20">
            <div className="flex flex-col items-center leading-none text-primary">
              <span className="text-[10px] font-black italic tracking-tighter">THE</span>
              <span className="text-[18px] font-black tracking-tightest">HOME</span>
              <span className="text-[14px] font-black italic tracking-tighter">DEPOT</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">THE HOME-VIP</h1>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full px-4 -mt-10 relative z-30">
        <div className="bg-white rounded-[32px] overflow-hidden shadow-premium">
          {/* Tab Header */}
          <div className="flex">
            <div className="bg-white px-8 py-4 rounded-tr-[32px] relative">
              <span className="text-primary font-black text-[15px]">Cadastre-se por telefone</span>
            </div>
            <div className="flex-1 bg-transparent"></div>
          </div>

          {/* Form Content */}
          <form className="p-8 pt-4 flex flex-col gap-5" onSubmit={handleRegister}>
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

            {/* Captcha Field (Integrated into UI) */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-text-main ml-1 text-glow">Código de Verificação</label>
              <div className="bg-input-bg rounded-[16px] h-[58px] flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/20 transition-all border border-primary/5">
                <input
                  type="text"
                  placeholder="Insira o código"
                  className="bg-transparent flex-1 h-full outline-none text-text-main font-semibold placeholder:text-text-secondary/40 text-[15px]"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                />
                <div className="h-10 w-24 shrink-0 overflow-hidden rounded-[12px] cursor-pointer" onClick={generateCaptcha}>
                  <canvas ref={canvasRef} width={100} height={40} className="w-full h-full object-cover"></canvas>
                </div>
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-text-main ml-1">Senha</label>
              <div className="bg-input-bg rounded-[16px] h-[58px] flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/20 transition-all border border-primary/5">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
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

            {/* Confirm Password Input Group */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-text-main ml-1">Digite novamente a senha</label>
              <div className="bg-input-bg rounded-[16px] h-[58px] flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/20 transition-all border border-primary/5">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite novamente a senha"
                  className="bg-transparent flex-1 h-full outline-none text-text-main font-semibold placeholder:text-text-secondary/40 text-[15px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-text-main/60">
                  <span className="material-symbols-outlined text-[22px]">
                    {showConfirmPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Invitation Code Group */}
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-text-main ml-1">Código de Convite</label>
              <div className="bg-input-bg rounded-[16px] h-[58px] flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/20 transition-all border border-primary/5">
                <input
                  type="text"
                  placeholder="Código de Convite"
                  className="bg-transparent flex-1 h-full outline-none text-text-main font-semibold placeholder:text-text-secondary/40 text-[15px]"
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

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3 px-1 mt-2">
              <div
                className={`size-5 rounded-md flex shrink-0 items-center justify-center border transition-all duration-300 ${agreedToTerms ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}
                onClick={() => setAgreedToTerms(!agreedToTerms)}
              >
                {agreedToTerms && <span className="material-symbols-outlined text-white text-[14px] font-black">check</span>}
              </div>
              <p className="text-[12px] text-text-secondary font-medium">
                Concordar com os <span className="text-primary cursor-pointer border-b border-primary/20">Termos e Regras</span>
              </p>
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              className="w-full h-[54px] bg-primary text-white font-bold rounded-[14px] text-[16px] mt-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              Inscrever-se
            </button>

            {/* Install PWA Button - Styled to fit theme */}
            {showInstallButton && (
              <button
                type="button"
                onClick={handleInstallPWA}
                className="w-full h-[54px] bg-[#1a1c1e] text-white font-bold rounded-[14px] text-[14px] uppercase tracking-wide flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">install_mobile</span>
                Baixar Aplicativo
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full h-[54px] bg-white text-primary border-2 border-primary/40 font-bold rounded-[14px] text-[16px] hover:bg-primary/5 active:scale-[0.98] transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* Redundant support icon at bottom right if needed as per image */}
      <button className="fixed bottom-6 right-6 size-12 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-100 z-[100] active:scale-90 transition-all">
        <img src="https://ui-avatars.com/api/?name=Support&background=fdf2f8&color=ef4444" className="w-full h-full rounded-full object-cover" alt="Support" />
      </button>

      {/* Decorative footer curve */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-200/50 rounded-t-[100%] blur-[2px]"></div>
    </div>
  );
};

export default Register;
