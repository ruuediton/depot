import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface HomeProps {
  onNavigate: (page: any) => void;
  onOpenSupport?: () => void;
  profile: any;
}

interface MarketingItem {
  id: string;
  url_image: string;
  descricao_nome: string;
  data: string;
}

const Home: React.FC<HomeProps> = ({ onNavigate, profile }) => {
  const [cheapestProduct, setCheapestProduct] = useState<any>(null);
  const [marketingItems, setMarketingItems] = useState<MarketingItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Imagens do carrossel
  const carouselImages = [
    {
      url: "/carousel1.png",
      title: "THE HOME DEPOT",
      subtitle: "YOUR HOME IMPROVEMENT STORE"
    },
    {
      url: "/carousel2.png",
      title: "NATIONWIDE EXPANSION",
      subtitle: "COMING SUMMER 2025"
    },
    {
      url: "/carousel3.png",
      title: "QUALITY PRODUCTS",
      subtitle: "EVERYTHING YOU NEED"
    }
  ];

  useEffect(() => {
    if (!profile?.id) return;

    const timer = setTimeout(() => setLoadingData(false), 800);
    return () => clearTimeout(timer);
  }, [profile?.id]);

  // Auto-deslizar carrossel a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <div className="bg-[#FF6B00] min-h-screen pb-20 font-sans antialiased pt-4">

      {/* Banner de alerta com animação */}
      <div
        onClick={() => onNavigate('gift-chest')}
        className="mx-4 mt-2 mb-4 bg-white/10 backdrop-blur-md rounded-full py-1.5 px-4 flex items-center gap-2 overflow-hidden cursor-pointer active:scale-[0.98] transition-all border border-white/10"
      >
        <span className="material-symbols-outlined text-[16px] shrink-0 text-white/80 z-10 bg-[#FF6B00]/50 py-1 pr-2">notifications</span>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee flex gap-8 whitespace-nowrap">
            <span className="text-[11px] font-medium text-white/90">
              VIP 1 é 12.000 Kz e a recompensa diária é 8.000 Kz. Benefícios por 60 dias. Recompensa de indicação nível 1: 10%... VIP 2 é 45.000 Kz com recompensa de 12.000 Kz! Participe agora e ganhe bônus de rede!
            </span>
            <span className="text-[11px] font-medium text-white/90">
              VIP 1 é 12.000 Kz e a recompensa diária é 8.000 Kz. Benefícios por 60 dias. Recompensa de indicação nível 1: 10%... VIP 2 é 45.000 Kz com recompensa de 12.000 Kz! Participe agora e ganhe bônus de rede!
            </span>
          </div>
        </div>
      </div>

      {/* Carrossel de Banners */}
      <div className="px-4">
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-5 bg-white relative border border-white/10">
          {/* Container do carrossel - Aumentado conforme solicitado */}
          <div className="relative h-56 overflow-hidden">
            {carouselImages.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                  ? 'opacity-100 translate-x-0'
                  : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                  }`}
              >
                <img
                  alt={slide.title}
                  className="w-full h-full object-contain bg-gray-100"
                  src={slide.url}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                  <h2 className="text-2xl font-bold italic tracking-tighter text-white">
                    {slide.title.split(' ').map((word, i) =>
                      word === 'FROM' ? (
                        <span key={i} className="text-primary font-bold"> {word} </span>
                      ) : (
                        <span key={i}>{word} </span>
                      )
                    )}
                  </h2>
                  <p className="text-[10px] text-white/80">{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Avatar do perfil */}
          <div className="absolute right-4 bottom-4 w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg z-10">
            <img
              alt="Support"
              className="w-full h-full object-cover"
              src={profile?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAvTdB2RECG0r99JebLEuhQFQCYJTJ1QbSGBZavZaT-ezAX1d9wzcMBwaGFIuzr_4I1tUtr1HiM02GpaM295-MH_N9ZeO0TPPaU2jXYPTpBiWvaf13RX6lNOscbTs1QbZ08XV1ukus6NWPZj0ZcMf-kdRPdqCgFTNtUg20uNKfWo0hF8PGAnFxdHfFBy219Xd5pi053E9qKMpEuNRmpvnmsAuFXxVaQ1tq3NTHBAYOelGIHsK_oKBmFjN_u2ArCvl6UQMA-g3Nl1C7n"}
              onError={(e) => {
                e.currentTarget.src = '/default_avatar.png';
              }}
            />
          </div>

          {/* Indicadores de posição */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-white/50'
                  }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid de ações principais (6 botões) - Compactado */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-5">
        {/* Recarrega */}
        <button
          onClick={() => onNavigate('deposit')}
          className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white/10 backdrop-blur-md border border-white/10"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
          <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tighter">Recarrega</span>
        </button>

        {/* Retirar */}
        <button
          onClick={() => onNavigate('retirada')}
          className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white/10 backdrop-blur-md border border-white/10"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tighter">Retirar</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => onNavigate('about-bp')}
          className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white/10 backdrop-blur-md border border-white/10"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">corporate_fare</span>
          </div>
          <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tighter whitespace-nowrap">Perfil</span>
        </button>

        {/* Convidar */}
        <button
          onClick={() => onNavigate('invite-page')}
          className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white/10 backdrop-blur-md border border-white/10"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">person_add</span>
          </div>
          <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tighter">Convidar</span>
        </button>

        {/* Equipe */}
        <button
          onClick={() => onNavigate('subordinate-list')}
          className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white/10 backdrop-blur-md border border-white/10"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">handshake</span>
          </div>
          <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tighter">Equipe</span>
        </button>

        {/* Prêmios */}
        <button
          onClick={() => onNavigate('gift-chest')}
          className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center bg-white/10 backdrop-blur-md border border-white/10"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-yellow-300">card_giftcard</span>
          </div>
          <span className="text-[10px] font-semibold leading-tight text-white uppercase tracking-tighter">Prêmios</span>
        </button>
      </div>

      {/* Botão Aplicativo */}
      <div className="px-4">
        <button
          onClick={() => onNavigate('tutorials')}
          className="w-full bg-gradient-to-r from-yellow-400/90 to-yellow-500/90 rounded-full py-4 px-6 flex items-center justify-between mb-8 shadow-inner shadow-white/20"
        >
          <span className="text-xl font-bold tracking-wide">Aplicativo</span>
          <span className="material-symbols-outlined font-bold">download_for_offline</span>
        </button>
      </div>

      {/* Reprodutor de Vídeo - Substitui Sala de Tarefas */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-t-[40px] p-6 -mx-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">


        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black group cursor-pointer border border-slate-100 dark:border-white/10">
          {/* YouTube Video Embed */}
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/bLbiUqIu8WE?autoplay=1&mute=1&modestbranding=1&rel=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        <p className="mt-4 text-slate-500 dark:text-slate-400 text-xs text-center font-medium leading-relaxed italic">
          "Conheça mais sobre nossa estrutura e como estamos mudando o mercado de varejo residencial no mundo todo."
        </p>
      </div>

      {/* Botão flutuante de presente */}
      <div className="fixed right-4 bottom-24 z-40">
        <button
          onClick={() => onNavigate('gift-chest')}
          className="w-12 h-12 bg-black dark:bg-zinc-700 rounded-full flex items-center justify-center border-2 border-primary/50 shadow-lg"
        >
          <span className="material-symbols-outlined text-yellow-400">card_giftcard</span>
        </button>
      </div>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default Home;
