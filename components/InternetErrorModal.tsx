import React from 'react';

const InternetErrorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleRetry = () => {
    if (navigator.onLine) {
      onClose();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-[280px] bg-white/10 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-300 border border-white/30">
        <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-[#00C853] text-3xl">wifi_off</span>
        </div>
        <h3 className="text-white text-lg font-black mb-1">Sem Conexão</h3>
        <p className="text-white/80 text-xs font-bold leading-relaxed mb-6">Sua internet parece estar lenta ou desconectada. Tente novamente.</p>
        <button onClick={handleRetry} className="w-full h-12 bg-[#00C853] text-white font-black rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all mb-3 text-sm">
          TENTAR AGORA
        </button>
        <button onClick={onClose} className="text-white/60 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
          IGNORAR
        </button>
      </div>
    </div>
  );
};

export default InternetErrorModal;
