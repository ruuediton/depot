import React from 'react';
import SpokeSpinner from './SpokeSpinner';
import { FeedbackStatus } from '../contexts/LoadingContext';

const LoadingOverlay: React.FC<{ status: FeedbackStatus; message?: string }> = ({ status, message }) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent backdrop-blur-[2px] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl py-3 px-6 flex flex-col items-center justify-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.1)] animate-in zoom-in-95 duration-300 pointer-events-auto">
                {status === 'loading' ? (
                    <SpokeSpinner size="w-8 h-8" color="text-[#00C853]" />
                ) : (
                    <p className="text-gray-800 text-[14px] font-bold text-center max-w-[240px] leading-tight tracking-tight">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;
