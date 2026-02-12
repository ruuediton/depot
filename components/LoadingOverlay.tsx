import React from 'react';
import SpokeSpinner from './SpokeSpinner';
import { FeedbackStatus } from '../contexts/LoadingContext';

const LoadingOverlay: React.FC<{ status: FeedbackStatus; message?: string }> = ({ status, message }) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none">
            {/* Background Blur */}
            <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${status !== 'idle' ? 'opacity-100' : 'opacity-0'}`} />

            <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 pointer-events-auto">
                {status === 'loading' ? (
                    <SpokeSpinner size="w-12 h-12" className="text-white" />
                ) : (
                    <div className="bg-white/95 backdrop-blur-md rounded-[28px] py-4 px-8 shadow-2xl border border-white/20">
                        <p className="text-slate-800 text-[15px] font-bold text-center leading-relaxed tracking-tight">
                            {message}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up {
                    animation: fadeUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LoadingOverlay;
