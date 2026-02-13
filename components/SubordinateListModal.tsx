import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from './SpokeSpinner';

interface Subordinate {
    id: string;
    phone: string;
    created_at: string;
    invested: number;
}

interface SubordinateListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubordinateListModal: React.FC<SubordinateListModalProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
    const [activeTab, setActiveTab] = useState<number>(1);

    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => setIsVisible(true), 10);
            fetchNetwork();
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchNetwork = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase.rpc('get_my_team');
            if (error) throw error;
            if (data) setSubordinates(data);
        } catch (err) {
            console.error("Erro ao carregar equipe:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubs = subordinates.filter(sub => (sub as any).level === activeTab);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[110] bg-[#FF6B00] transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex flex-col min-h-screen text-black font-sans antialiased">
                <header className="pt-4 px-4 pb-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-white/20 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-white text-[32px]">chevron_left</span>
                        </button>
                        <h1 className="text-[18px] font-medium text-white tracking-tight lowercase">minha equipe</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <div className="flex gap-2 px-4 pb-6 overflow-x-auto no-scrollbar">
                    {[1, 2, 3].map(level => (
                        <button
                            key={level}
                            onClick={() => setActiveTab(level)}
                            className={`flex-1 h-10 rounded-[8px] font-medium text-[13px] transition-all whitespace-nowrap border ${activeTab === level
                                ? 'bg-white text-[#FF6B00] border-white'
                                : 'bg-[#FF6B00] text-white/70 border-white/30'
                                }`}
                        >
                            Nível {level}
                        </button>
                    ))}
                </div>

                <main className="flex-1 px-4 pb-32">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <SpokeSpinner size="w-8 h-8" color="text-white" />
                            <p className="text-white/80 font-medium tracking-wide text-[10px] lowercase">verificando rede...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-[#FFF5EE] p-5 rounded-[8px] mb-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-10 rounded-[8px] bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                                        <span className="material-symbols-outlined text-[24px]">groups</span>
                                    </div>
                                    <div className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-[8px] text-[10px] font-medium lowercase">
                                        nível {activeTab}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-medium lowercase tracking-wide">membros na camada</p>
                                    <p className="text-3xl font-medium text-[#111]">{filteredSubs.length}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-[11px] font-medium text-white/80 lowercase tracking-wide px-1 mb-1">
                                    detalhes da rede
                                </h3>

                                {filteredSubs.length > 0 ? (
                                    filteredSubs.map((sub: any, index: number) => (
                                        <div
                                            key={sub.id}
                                            className="bg-[#FFF5EE] px-3 py-3 rounded-[8px] flex items-center gap-3 shadow-sm"
                                        >
                                            <div className="size-9 rounded-[8px] bg-white flex items-center justify-center text-[#9DA3AE]">
                                                <span className="material-symbols-outlined text-[20px]">person</span>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-[#111] font-medium text-[13px] tracking-tight leading-tight">
                                                    {sub.phone.replace(/(\d{3})(\d{3})(\d{3})/, '+$1 *** $3')}
                                                </p>
                                                <span className="text-gray-400 text-[10px] font-medium mt-0.5">
                                                    desde {new Date(sub.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <div className={`px-2 py-[2px] rounded-[4px] text-[9px] font-medium lowercase tracking-wide ${sub.reloaded_amount >= 3000
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {sub.reloaded_amount >= 3000 ? 'investido' : 'sem invest.'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 bg-white/10 rounded-[8px] border border-white/20 border-dashed">
                                        <div className="size-12 rounded-[8px] bg-white/20 flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-white text-3xl">diversity_3</span>
                                        </div>
                                        <p className="font-medium text-white text-sm">Camada vazia</p>
                                        <p className="text-[11px] text-white/60 px-8 text-center mt-1 italic font-medium">
                                            Convide mais pessoas para expandir sua rede.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SubordinateListModal;
