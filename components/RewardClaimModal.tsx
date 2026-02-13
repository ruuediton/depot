import React, { useState, useEffect } from 'react';

interface RewardClaimModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSupport?: () => void;
}

const RewardClaimModal: React.FC<RewardClaimModalProps> = ({ isOpen, onClose, onOpenSupport }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[110] bg-[#F4F7F6] transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col min-h-screen text-black font-sans antialiased">
                {/* App Bar */}
                <header className="bg-gradient-to-b from-[#FF6B00] to-[#FF8C00] pb-12 pt-4 px-4">
                    <div className="relative z-10 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-white/10 rounded-[8px] transition-colors"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <h2 className="text-white text-lg font-medium tracking-tight flex-1 text-center pr-12 lowercase">recompensa</h2>
                        <div className="flex w-12 items-center justify-end">
                            <button onClick={() => onOpenSupport?.()} className="flex cursor-pointer items-center justify-center rounded-[8px] h-[45px] bg-transparent text-white p-0">
                                <span className="material-symbols-outlined">help_outline</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col justify-center items-center px-6 max-w-lg mx-auto w-full relative overflow-hidden pb-20">
                    <div className="text-center z-10 mb-8 mt-[-40px]">
                        <h2 className="text-[#FF6B00] text-5xl font-medium tracking-tight mb-3">Parabéns!</h2>
                        <div className="flex flex-col items-center">
                            <span className="text-black text-xs font-medium opacity-50 uppercase tracking-[0.3em] mb-2">Recebeste</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-[#FF6B00] text-7xl font-medium">500</span>
                                <span className="text-[#FF6B00] text-3xl font-medium">Kz</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full aspect-square max-w-[320px] mb-12 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,209,37,0.25)_0%,_rgba(24,23,17,0)_70%)] rounded-full scale-125"></div>
                        <div className="relative w-full flex flex-col items-center">
                            <div className="w-64 h-24 bg-[#323028] rounded-t-2xl border-x-4 border-t-4 border-[#3a3830] relative -mb-4 z-0 rotate-[-12deg] -translate-y-12 -translate-x-4 border-b-4 border-black/40"></div>
                            <div className="absolute top-4 w-48 h-32 bg-[#FF6B00]/40 blur-3xl rounded-full z-10 animate-pulse"></div>
                            <div className="relative w-64 h-44 bg-[#2a2820] rounded-b-2xl border-x-4 border-b-4 border-[#3a3830] z-20 overflow-hidden flex flex-col">
                                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B00]/20 to-transparent"></div>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <div className="w-20 h-20 bg-[#FF6B00] rounded-full flex items-center justify-center z-30 animate-bounce-slow shadow-lg shadow-[#FF6B00]/30">
                                        <span className="material-symbols-outlined text-white text-4xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </div>
                                </div>
                                <div className="h-4 bg-black/30"></div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-5 pb-8 z-10">
                        <p className="text-black/60 text-center text-sm font-medium leading-relaxed px-8">
                            O valor foi adicionado ao seu saldo digital e está pronto a ser usado.
                        </p>
                        <div className="flex px-4">
                            <button
                                onClick={() => {
                                    alert("Sucesso! 500 Kz resgatados.");
                                    onClose();
                                }}
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-[8px] h-14 bg-[#FF6B00] text-white text-lg font-medium active:scale-95 transition-all shadow-lg shadow-[#FF6B00]/20"
                            >
                                <span className="truncate">Resgatar agora</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
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

export default RewardClaimModal;
