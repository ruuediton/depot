import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, showToast }) => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const filterInput = (val: string) => val.replace(/[^a-zA-Z0-9]/g, '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            showToast?.("Por favor, introduza a sua senha antiga.", "warning");
            return;
        }

        if (!newPassword) {
            showToast?.("A nova senha não pode estar vazia.", "warning");
            return;
        }

        if (!confirmPassword) {
            showToast?.("Por favor, confirme a sua nova senha.", "warning");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast?.("As senhas introduzidas não são iguais.", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast?.("A nova senha deve ter pelo menos 6 caracteres.", "error");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                showToast?.(`Erro ao atualizar: ${error.message}`, "error");
            } else {
                showToast?.("Senha alterada com sucesso!", "success");
                setTimeout(() => {
                    onClose();
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }, 2000);
            }
        } catch (err: any) {
            showToast?.("Ocorreu um erro inesperado.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`w-full max-w-[340px] bg-white rounded-[8px] overflow-hidden shadow-2xl transition-all duration-200 transform ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#FF6B00] px-5 py-4 flex items-center justify-between text-white">
                    <h3 className="text-lg font-medium lowercase">alterar a senha</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Senha Antiga */}
                        <div className="relative">
                            <input
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(filterInput(e.target.value))}
                                className="w-full h-12 px-4 pr-10 bg-[#F8F9FA] border border-gray-100 rounded-[8px] text-gray-700 placeholder:text-gray-400 focus:border-[#FF6B00]/30 focus:outline-none transition-all text-sm font-medium"
                                placeholder="senha antiga"
                                type={showCurrent ? "text" : "password"}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {showCurrent ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>

                        {/* Nova Senha */}
                        <div className="relative">
                            <input
                                value={newPassword}
                                onChange={(e) => setNewPassword(filterInput(e.target.value))}
                                className="w-full h-12 px-4 pr-10 bg-[#F8F9FA] border border-gray-100 rounded-[8px] text-gray-700 placeholder:text-gray-400 focus:border-[#FF6B00]/30 focus:outline-none transition-all text-sm font-medium"
                                placeholder="nova senha"
                                type={showNew ? "text" : "password"}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {showNew ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>

                        {/* Confirmar Nova Senha */}
                        <div className="relative">
                            <input
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(filterInput(e.target.value))}
                                className="w-full h-12 px-4 pr-10 bg-[#F8F9FA] border border-gray-100 rounded-[8px] text-gray-700 placeholder:text-gray-400 focus:border-[#FF6B00]/30 focus:outline-none transition-all text-sm font-medium"
                                placeholder="confirmar nova senha"
                                type={showConfirm ? "text" : "password"}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {showConfirm ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                className="w-full bg-[#FF6B00] text-white font-medium h-12 rounded-[8px] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-orange-100"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>processando...</span>
                                    </span>
                                ) : 'confirmar alteração'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-4 text-[10px] text-gray-400 text-center font-medium leading-relaxed italic">
                        Por segurança, use uma combinação de letras e números com no mínimo 6 caracteres.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
