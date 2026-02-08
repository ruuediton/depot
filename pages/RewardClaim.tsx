
import React from 'react';

interface Props {
  onNavigate: (page: any) => void;
  onOpenSupport?: () => void;
}

const RewardClaim: React.FC<Props> = ({ onNavigate, onOpenSupport }) => {
  return (
    <div className="bg-background-dark font-display text-black antialiased min-h-screen flex flex-col selection:bg-primary selection:text-black">
      {/* App Bar */}
      <header className="header-gradient-mixture pb-12 pt-4 px-4">
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => onNavigate('home')}
            className="text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Recompensa</h2>
          <div className="flex w-12 items-center justify-end">
            <button onClick={() => onOpenSupport?.()} className="flex cursor-pointer items-center justify-center rounded-lg h-[45px] bg-transparent text-white p-0">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-6 max-w-lg mx-auto w-full relative overflow-hidden pb-20">
        {/* Confetti (Static Visual Elements) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-sm bg-primary rotate-12 opacity-60"></div>
          <div className="absolute top-[25%] right-[20%] w-2 h-2 rounded-sm bg-white/40 -rotate-45"></div>
          <div className="absolute top-[40%] left-[10%] w-2 h-2 rounded-sm bg-primary/60 rotate-[30deg]"></div>
          <div className="absolute top-[35%] right-[10%] w-2 h-2 rounded-sm bg-primary rotate-12"></div>
          <div className="absolute bottom-[30%] left-[20%] w-2 h-2 rounded-sm bg-white/20 rotate-12"></div>
          <div className="absolute bottom-[40%] right-[15%] w-2 h-2 rounded-sm bg-primary/40 -rotate-12"></div>
        </div>

        {/* Text Header */}
        <div className="text-center z-10 mb-8 animate-in fade-in zoom-in duration-500">
          <h2 className="text-primary text-5xl font-black tracking-tight mb-3">Parabéns!</h2>
          <div className="flex flex-col items-center">
            <span className="text-black text-xs font-black opacity-50 uppercase tracking-[0.3em] mb-2">Recebeste</span>
            <div className="flex items-baseline gap-3">
              <span className="text-primary text-7xl font-black">500</span>
              <span className="text-primary text-3xl font-black">Kz</span>
            </div>
          </div>
        </div>

        {/* Opened Treasure Chest Visual */}
        <div className="relative w-full aspect-square max-w-[320px] mb-12 flex items-center justify-center animate-in slide-in-from-bottom duration-700">
          {/* Main Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,209,37,0.25)_0%,_rgba(24,23,17,0)_70%)] rounded-full scale-125"></div>

          <div className="relative w-full flex flex-col items-center">
            {/* Floating Top Lid */}
            <div className="w-64 h-24 bg-[#323028] rounded-t-2xl border-x-4 border-t-4 border-[#3a3830] relative -mb-4 z-0 rotate-[-12deg] -translate-y-12 -translate-x-4 border-b-4 border-black/40">
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-primary/10 rounded-full"></div>
            </div>

            {/* Inner Glow Light */}
            <div className="absolute top-4 w-48 h-32 bg-primary/40 blur-3xl rounded-full z-10 animate-pulse"></div>
            <div className="absolute top-6 w-32 h-20 bg-primary/60 blur-xl rounded-full z-10"></div>

            {/* Chest Body */}
            <div className="relative w-64 h-44 bg-[#2a2820] rounded-b-2xl border-x-4 border-b-4 border-[#3a3830] z-20 overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent"></div>
              <div className="flex-1 flex items-center justify-center relative">
                {/* Reward Icon */}
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center z-30 animate-bounce-slow">
                  <span className="material-symbols-outlined text-[#181711] text-6xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>

                {/* Metallic rivets */}
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-white/10"></div>
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10"></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/10"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-white/10"></div>
              </div>
              <div className="h-4 bg-black/30"></div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full space-y-5 pb-8 z-10">
          <p className="text-black/60 text-center text-sm font-medium leading-relaxed px-8">
            O valor foi adicionado ao seu saldo digital e está pronto a ser usado.
          </p>

          <div className="flex px-4">
            <button
              onClick={() => {
                alert("Sucesso! 500 Kz resgatados.");
                onNavigate('wallet');
              }}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-16 bg-primary text-white text-xl font-black tracking-wide active:scale-95 transition-transform"
            >
              <span className="truncate uppercase tracking-wider">Resgatar Agora</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('historico-conta')}
            className="w-full text-center text-black/40 text-sm font-bold py-2 tracking-widest uppercase hover:text-black transition-colors"
          >
            Ver detalhes da transação
          </button>
        </div>
      </main>

      {/* Footer decoration */}
      <div className="h-2 bg-primary/5 w-full mt-auto"></div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default RewardClaim;

