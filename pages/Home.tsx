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
        className="mx-4 mt-2 mb-4 bg-white/20 rounded-full py-1.5 px-4 flex items-center gap-2 overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
      >
        <span className="material-symbols-outlined text-sm shrink-0">notifications</span>
        <div className="text-xs font-medium overflow-hidden whitespace-nowrap">
          <div className="scrolling-text">
            VIP 1 é 12.000 Kz e a recompensa diária é 8.000 Kz. Benefícios por 60 dias. Recompensa de indicação nível 1: 10%...
          </div>
        </div>
      </div>

      {/* Carrossel de Banners */}
      <div className="px-4">
        <div className="rounded-xl overflow-hidden shadow-lg mb-6 bg-white relative">
          {/* Container do carrossel */}
          <div className="relative h-40 overflow-hidden">
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

      {/* Grid de ações principais (5 botões) */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        {/* Recarrega */}
        <button
          onClick={() => onNavigate('deposit')}
          className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
          </div>
          <span className="text-xs font-medium leading-tight">Recarrega</span>
        </button>

        {/* Retirar */}
        <button
          onClick={() => onNavigate('retirada')}
          className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl">payments</span>
          </div>
          <span className="text-xs font-medium leading-tight">Retirar</span>
        </button>

        {/* Perfil de companhia */}
        <button
          onClick={() => onNavigate('about-bp')}
          className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl">corporate_fare</span>
          </div>
          <span className="text-xs font-medium leading-tight">Perfil de companhia</span>
        </button>

        {/* Convidar amigos */}
        <button
          onClick={() => onNavigate('invite-page')}
          className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <span className="text-xs font-medium leading-tight">Convidar amigos</span>
        </button>

        {/* Cooperação de Agência */}
        <button
          onClick={() => onNavigate('subordinate-list')}
          className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl">handshake</span>
          </div>
          <span className="text-xs font-medium leading-tight">Cooperação de Agência</span>
        </button>

        {/* Recompensas Diárias */}
        <button
          onClick={() => onNavigate('gift-chest')}
          className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
        >
          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-3xl text-yellow-400">card_giftcard</span>
          </div>
          <span className="text-xs font-medium leading-tight">Recompensas Diárias</span>
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

      {/* Sala de Tarefas */}
      <div className="bg-white dark:bg-card-dark rounded-t-3xl p-6 -mx-0">
        <h3 className="text-black dark:text-white text-xl font-bold mb-4">Sala de Tarefas</h3>

        <div className="space-y-4">
          {loadingData ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 flex gap-4 border border-slate-100 dark:border-zinc-700 shadow-sm animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Card de produto 1 - Resistor */}
              <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 flex gap-4 border border-slate-100 dark:border-zinc-700 shadow-sm" onClick={() => onNavigate('shop')}>
                <div className="relative w-24 h-24 bg-white dark:bg-zinc-700 rounded-lg overflow-hidden shrink-0">
                  <img
                    alt="Resistor Set"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6zaV-cbAV7xxy7KJ60Hx5CeLLC0g0aD9wJa1QQkTb8l6VTjUQ_yWh3rDgOY1UJGQ3fSdw0tYv3We9aZ6ltmauDfRoigMFh8MBNB0m-VGYkAMmobLLaP9LzydH5mAA3e3Ja080cgckAM5Bh1OGXrKy20BlpOmCkeCC7XG7nKVhoZhhG4_ZOfott5g-2Q3KphYqthNa1ACUnH3Zm7RfVGbu3Uon9K3AnkWLlEubou1Haqsx7YRQZFd_esGXBxxo_B7lFbBbxbi6do7M"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">lock</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-primary font-semibold text-lg">$10.00</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">Preço</div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">50pcs Resistor 0.25W 5% 3.3 - 3.3M Ohm Carbon Film resistors</p>
                </div>
              </div>

              {/* Card de produto 2 - Pen Set */}
              <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 flex gap-4 border border-slate-100 dark:border-zinc-700 shadow-sm" onClick={() => onNavigate('shop')}>
                <div className="relative w-24 h-24 bg-white dark:bg-zinc-700 rounded-lg overflow-hidden shrink-0">
                  <img
                    alt="Pen Set"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANftelW4IwDQtQ_F-qAlUO52Btrsa3N5EsLDoRo_kRJu51I6o6cythBDIpuULD1XISI-JsIiap4OEk2PyEmog2iLjseA7U-rxB2CdGzXI2NNH2yKmrhDvoMsVZMg0lGYV_bvHYQMbsoyGlJo7LNYB7jC_E7Q2vdnY7c_pTnXqfKpL-oGo8J-t_CDqoSAPL0UsHtN3e3Ja080cgckAM5Bh1OGXrKy20BlpOmCkeCC7XG7nKVhoZhhG4_ZOfott5g-2Q3KphYqthNa1ACUnH3Zm7RfVGbu3Uon9K3AnkWLlEubou1Haqsx7YRQZFd_esGXBxxo_B7lFbBbxbi6do7M"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">lock</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-primary font-bold text-lg">$15.80</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">Preço</div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">Faber-Castell RX Gel Colour Pen 0.7mm FC Rxgel Pen Bright Ink Gel RX Gel Color Set</p>
                </div>
              </div>

              {/* Card de produto 3 - Lipstick Pen */}
              <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 flex gap-4 border border-slate-100 dark:border-zinc-700 shadow-sm" onClick={() => onNavigate('shop')}>
                <div className="relative w-24 h-24 bg-white dark:bg-zinc-700 rounded-lg overflow-hidden shrink-0">
                  <img
                    alt="Lipstick Pen"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2R03IrwJqAkMwpvg6w3Pn3Gbn7T8ExTQDiuzmdaxy3NnRU1GMT0-ZxZSs2VpfQTQah0w9N5Lp_zCbCyOW3cGLha5__ZK-zY7nSv8LQi6aJgKw7DSEE6nQNTGYnOeBHhuAGZ7tYGNsMfVjbZenpmaWSzAo1Rbfqsh7JSUoGBIoy8r42IRhn9K3AnkWLlEubou1Haqsx7YRQZFd_esGXBxxo_B7lFbBbxbi6do7M"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">lock</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-primary font-bold text-lg">$29.90</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">Preço</div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">Glittering Lipstick Black Ink Pen 0.5mm For School and Office Use Gift</p>
                </div>
              </div>
            </>
          )}
        </div>
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
