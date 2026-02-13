. cmd no import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from './SpokeSpinner';

interface GiftRedeemModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const GiftRedeemModal: React.FC<GiftRedeemModalProps> = ({ isOpen, onClose, showToast }) => {
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleRedeem = async () => {
        if (loading) return;

        if (!promoCode.trim()) {
            showToast?.("Por favor, digite o código.", "warning");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast?.("Sessão expirada. Faça login novamente.", "error");
                return;
            }

            const { data, error } = await supabase.rpc('redeem_gift_code', {
                p_code: promoCode.trim()
            });

            if (error) throw new Error("Não foi possível processar o código.");
            if (!data.success) throw new Error(data.message || "Código inválido ou expirado.");

            // Success Flow
            showToast?.(data.message || "Resgate sucedido!", "success");
            setPromoCode('');
            onClose();

        } catch (error: any) {
            showToast?.(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-[320px] bg-white rounded-[8px] overflow-hidden shadow-2xl transition-all duration-200 transform ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Compact Header */}
                <div className="bg-[#FF6B00] p-4 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <div className="w-12 h-12 bg-white/20 rounded-[8px] flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                        <span className="material-symbols-outlined text-white text-2xl">redeem</span>
                    </div>
                    <h3 className="text-white font-medium text-lg leading-tight">Resgatar presente</h3>
                </div>

                {/* Compact Content */}
                <div className="p-5">
                    <p className="text-gray-400 text-center text-[10px] font-medium tracking-wide mb-4">
                        Insira o seu código da sorte
                    </p>

                    <div className="space-y-3">
                        <div className="bg-gray-50 rounded-[8px] h-10 flex items-center px-3 gap-2 border border-gray-100 focus-within:border-[#FF6B00] focus-within:ring-2 focus-within:ring-[#FF6B00]/10 transition-all">
                            <span className="material-symbols-outlined text-[#FF6B00] text-[18px]">confirmation_number</span>
                            <input
                                type="text"
                                placeholder="Digite o código"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                disabled={loading}
                                className="bg-transparent flex-1 h-full outline-none text-[#111] font-medium placeholder:text-gray-300 text-xs tracking-wider"
                            />
                        </div>

                        <button
                            onClick={handleRedeem}
                            disabled={loading}
                            className={`w-full h-10 rounded-[8px] font-medium text-white transition-all shadow-md flex items-center justify-center text-sm
                                ${loading ? 'bg-gray-200 grayscale cursor-not-allowed' : 'bg-[#FF6B00] shadow-[#FF6B00]/20 active:scale-[0.98] hover:brightness-105'}`}
                        >
                            {loading ? <SpokeSpinner size="w-4 h-4" color="text-gray-400" /> : 'Receber'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftRedeemModal;
