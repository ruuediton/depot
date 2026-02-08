import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

const Toast: React.FC<{ message: string; type: ToastType; isOpen: boolean; onClose: () => void }> = ({ message, type, isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;


    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-fit max-w-[90vw] animate-in fade-in zoom-in slide-in-from-top-4 duration-500 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md flex items-center justify-center py-3 px-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
                <p className="text-gray-800 font-bold text-[14px] text-center leading-tight tracking-tight">{message}</p>
            </div>
        </div>
    );
};

export default Toast;
