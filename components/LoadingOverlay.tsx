import React from 'react';
import SpokeSpinner from './SpokeSpinner';
import { FeedbackStatus } from '../contexts/LoadingContext';

const LoadingOverlay: React.FC<{ status: FeedbackStatus; message?: string }> = ({ status, message }) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6 pointer-events-none">
            {/* Minimal Background Blur */}
            <div className={`absolute inset-0 bg-black/10 backdrop-blur-[1px] transition-opacity duration-300 ${status !== 'idle' ? 'opacity-100' : 'opacity-0'}`} />

            <div className="bg-black/80 backdrop-blur-md rounded-2xl py-3 px-6 flex flex-col items-center justify-center shadow-lg relative z-10 pointer-events-auto animate-fade-up w-fit max-w-[85vw]">
                {status === 'loading' ? (
                    <div className="flex items-center gap-3">
                        <SpokeSpinner size="w-5 h-5" color="text-white" />
                        {message && <p className="text-[14px] font-medium text-white tracking-tight">{message}</p>}
                    </div>
                ) : (
                    <p className="text-white text-[14px] font-medium text-center leading-relaxed">
                        {message}
                    </p>
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
