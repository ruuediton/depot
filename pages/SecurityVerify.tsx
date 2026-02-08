
import React, { useState } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const SecurityVerify: React.FC<Props> = ({ onNavigate, showToast }) => {
  const [frenteFile, setFrenteFile] = useState<File | null>(null);
  const [versoFile, setVersoFile] = useState<File | null>(null);
  const [frentePreview, setFrentePreview] = useState<string | null>(null);
  const [versoPreview, setVersoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [biUrls, setBiUrls] = useState<{ frente: string; verso: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Verificar status inicial
  React.useEffect(() => {
    checkStatus();

    // Mitigação Anti-Screenshot
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleVisibilityChange = () => setIsFocused(!document.hidden);
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear PrintScreen e atalhos comuns
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'))) {
        setIsBlurred(true);
        showToast?.('Captura de tela detectada e bloqueada por segurança.', 'warning');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Timer para o desfoque
  React.useEffect(() => {
    let timer: any;
    if (biUrls && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBlurred(true);
    }
    return () => clearInterval(timer);
  }, [biUrls, timeLeft]);

  // FunÃ§Ã£o para descriptografar o path
  const decryptPath = (encryptedPath: string) => {
    try {
      return atob(encryptedPath.split('').reverse().join(''));
    } catch (e) {
      return encryptedPath;
    }
  };

  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('verified, bi_frente_url, bi_verso_url')
        .eq('user_id', user.id)
        .single();

      if (!error && data && data.verified) {
        setIsVerified(true);

        // Descriptografar e gerar URLs
        const pathFrente = decryptPath(data.bi_frente_url).replace('documents/', '');
        const pathVerso = decryptPath(data.bi_verso_url).replace('documents/', '');

        const { data: signFrente } = await supabase.storage.from('documents').createSignedUrl(pathFrente, 60);
        const { data: signVerso } = await supabase.storage.from('documents').createSignedUrl(pathVerso, 60);

        if (signFrente?.signedUrl && signVerso?.signedUrl) {
          setBiUrls({ frente: signFrente.signedUrl, verso: signVerso.signedUrl });
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Função simples de ofuscação/encriptação para o path
  const encryptPath = (path: string) => {
    return btoa(path).split('').reverse().join('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'frente' | 'verso') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast?.('O arquivo é muito grande. O máximo é 5MB.', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'frente') {
          setFrenteFile(file);
          setFrentePreview(reader.result as string);
        } else {
          setVersoFile(file);
          setVersoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!frenteFile || !versoFile) {
      showToast?.('Por favor, carregue as imagens da frente e do verso do seu BI.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast?.('Usuário não autenticado.', 'error');
        return;
      }

      const userId = user.id;

      // 1. Upload BI Frente
      const frentePath = `${userId}/bi_frente_${Date.now()}`;
      const { error: errorFrente } = await supabase.storage
        .from('documents')
        .upload(frentePath, frenteFile, { upsert: true });

      if (errorFrente) throw errorFrente;

      // 2. Upload BI Verso
      const versoPath = `${userId}/bi_verso_${Date.now()}`;
      const { error: errorVerso } = await supabase.storage
        .from('documents')
        .upload(versoPath, versoFile, { upsert: true });

      if (errorVerso) throw errorVerso;

      // 3. Encriptar caminhos
      const encryptedFrente = encryptPath(`documents/${frentePath}`);
      const encryptedVerso = encryptPath(`documents/${versoPath}`);

      // 4. Atualizar Profiles
      const { error: errorUpdate } = await supabase
        .from('profiles')
        .update({
          bi_frente_url: encryptedFrente,
          bi_verso_url: encryptedVerso,
          verified: true
        })
        .eq('user_id', userId);

      if (errorUpdate) throw errorUpdate;

      showToast?.('Documentos enviados e verificados com sucesso!', 'success');
      setIsVerified(true);
      setTimeout(() => onNavigate('profile'), 2000);
    } catch (error: any) {
      console.error('Erro na verificação:', error);
      showToast?.('Erro ao processar verificação: ' + (error.message || 'Erro desconhecido'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <SpokeSpinner size="w-10 h-10" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="bg-background-dark font-display text-black antialiased min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm">
          <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px', fontWeight: 'bold' }}>verified_user</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-black">Conta Verificada</h1>
            {isBlurred ? (
              <p className="text-red-400 text-sm font-medium animate-pulse">
                Por questões de segurança, o tempo de leitura terminou.
              </p>
            ) : (
              <p className="text-text-secondary text-sm font-medium">
                Sua identidade foi confirmada. As imagens serão ocultadas em <span className="text-primary font-bold">{timeLeft}s</span>.
              </p>
            )}
          </div>

          {/* Imagens do BI com efeito de Blur */}
          <div className="grid grid-cols-1 gap-4 w-full">
            <div className="relative group">
              <p className="text-left text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">BI Frente</p>
              <div className={`aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-gray-200 bg-surface-dark transition-all duration-700 ${isBlurred ? 'blur-xl scale-95 opacity-50' : ''}`}>
                {biUrls?.frente ? (
                  <img loading="lazy" decoding="async" src={biUrls.frente} alt="Frente" className="w-full h-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SpokeSpinner size="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>

            <div className="relative group">
              <p className="text-left text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">BI Verso</p>
              <div className={`aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-gray-200 bg-surface-dark transition-all duration-700 ${isBlurred ? 'blur-xl scale-95 opacity-50' : ''}`}>
                {biUrls?.verso ? (
                  <img loading="lazy" decoding="async" src={biUrls.verso} alt="Verso" className="w-full h-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SpokeSpinner size="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className={`w-full mt-4 bg-primary hover:bg-green-400 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98]`}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-background-dark font-display text-black antialiased min-h-screen flex flex-col selection:bg-primary selection:text-black transition-all duration-500 ${!isFocused ? 'blur-2xl opacity-50 scale-95 pointer-events-none' : ''}`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {!isFocused && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6">
          <span className="material-symbols-outlined text-primary text-6xl mb-4">security</span>
          <h2 className="text-xl font-bold text-black mb-2">Página Protegida</h2>
          <p className="text-gray-600 text-sm">Por segurança, o conteúdo é ocultado quando você sai da página ou tenta capturá-lo.</p>
        </div>
      )}
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">

        <header className="header-gradient-mixture pb-16 pt-4 px-4">

          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => onNavigate('profile')}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">Verificação</h1>
            <div className="w-11"></div>
          </div>
        </header>

        {/* Progress Indicators */}
        <div className="flex w-full flex-col items-center justify-center py-6">
          <div className="flex gap-2">
            <div className="h-1.5 w-10 rounded-full bg-primary"></div>
            <div className="h-1.5 w-10 rounded-full bg-primary"></div>
            <div className="h-1.5 w-10 rounded-full bg-primary"></div>
          </div>
          <p className="text-xs font-bold text-gray-500 mt-3 uppercase tracking-widest">Finalizando</p>
        </div>

        {/* Headline & Body */}
        <div className="px-6 pb-8">
          <h1 className="text-[32px] font-extrabold leading-tight text-center pb-3">Verifique sua identidade</h1>
          <p className="text-base font-medium leading-relaxed text-center text-text-secondary">
            Para garantir a segurança da sua conta, precisamos de uma foto nítida do seu Bilhete de Identidade (BI).
          </p>
        </div>

        {/* Main Content Form */}
        <div className="flex flex-col gap-6 px-6 flex-1">
          {/* Upload Section: BI Frente */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold leading-tight tracking-tight">BI Frente</h3>
            <label className="group relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-gray-700 bg-surface-dark/50 hover:bg-primary/5 hover:border-primary transition-all cursor-pointer overflow-hidden">
              {frentePreview ? (
                <img loading="lazy" decoding="async" src={frentePreview} alt="Preview" className="w-full h-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]" />
              ) : (
                <div className="flex flex-col items-center gap-4 z-10">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-black">Toque para carregar</p>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">PNG, JPG ou PDF (max. 5MB)</p>
                  </div>
                </div>
              )}
              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={(e) => handleFileChange(e, 'frente')}
              />
            </label>
          </div>

          {/* Upload Section: BI Verso */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold leading-tight tracking-tight">BI Verso</h3>
            <label className="group relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-gray-700 bg-surface-dark/50 hover:bg-primary/5 hover:border-primary transition-all cursor-pointer overflow-hidden">
              {versoPreview ? (
                <img loading="lazy" decoding="async" src={versoPreview} alt="Preview" className="w-full h-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]" />
              ) : (
                <div className="flex flex-col items-center gap-4 z-10">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-black">Toque para carregar</p>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">PNG, JPG ou PDF (max. 5MB)</p>
                  </div>
                </div>
              )}
              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={(e) => handleFileChange(e, 'verso')}
              />
            </label>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-4 p-5 bg-primary/10 rounded-2xl mt-2 border border-primary/10">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-black" style={{ fontSize: '18px', fontWeight: 'bold' }}>info</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              Certifique-se de que todas as informações no seu BI estão legíveis e sem reflexos.
            </p>
          </div>

          <div className="h-12"></div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="sticky bottom-0 w-full p-6 bg-background-dark/90 backdrop-blur-xl border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 bg-primary hover:bg-green-400 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <SpokeSpinner size="w-6 h-6" className="text-black" />
            ) : (
              <>
                <span>Enviar para Verificação</span>
                <span className="material-symbols-outlined font-bold">arrow_forward</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-5 opacity-40">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">Encriptação de ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityVerify;

