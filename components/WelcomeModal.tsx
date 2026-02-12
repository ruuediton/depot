import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Props {
    onClose: () => void;
}

const WelcomeModal: React.FC<Props> = ({ onClose }) => {
    const [whatsappLink, setWhatsappLink] = useState<string>('');
    const [splashMessage, setSplashMessage] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);

        const fetchConfig = async () => {
            try {
                const { data } = await supabase
                    .from('atendimento_links')
                    .select('whatsapp_grupo_vendas_url, splash_message')
                    .limit(1)
                    .single();

                if (data) {
                    if (data.whatsapp_grupo_vendas_url) setWhatsappLink(data.whatsapp_grupo_vendas_url);
                    if (data.splash_message) setSplashMessage(data.splash_message);
                }
            } catch (err) {
                console.error("Error fetching config", err);
            }
        };

        fetchConfig();
    }, []);

    const handleWhatsAppClick = () => {
        if (whatsappLink) {
            window.location.href = whatsappLink;
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 8000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-500 ${isVisible ? 'bg-black/60 backdrop-blur-[2px]' : 'bg-black/0 pointer-events-none'}`}>
            <div className={`relative bg-[#fce9dc] w-[320px] h-[380px] rounded-[40px] shadow-2xl flex flex-col transition-all duration-500 transform ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>

                {/* Decorative Corner Arcs */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#FF6B00] rounded-tl-[40px]" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#FF6B00] rounded-tr-[40px]" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#FF6B00] rounded-bl-[40px]" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#FF6B00] rounded-br-[40px]" />

                {/* Close Icon - Top Right - smaller */}
                <button
                    onClick={handleClose}
                    className="absolute -top-2 -right-2 size-8 rounded-full bg-white shadow-lg flex items-center justify-center text-[#FF6B00] hover:scale-110 active:scale-90 transition-all z-[60]"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                <div className="p-6 flex flex-col items-center flex-1 overflow-hidden">
                    {/* Header - smaller text */}
                    <h2 className="text-[#FF6B00] text-lg font-bold tracking-[0.1em] mb-3 uppercase leading-none">
                        DICA
                    </h2>

                    {/* Scrollable Content Container - fixed area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 w-full flex flex-col gap-3">
                        {splashMessage ? (
                            <div
                                className="text-slate-700 text-[14px] font-normal leading-[1.6] text-center"
                                dangerouslySetInnerHTML={{ __html: splashMessage }}
                            />
                        ) : (
                            <p className="text-slate-700 text-[14px] font-normal leading-[1.6] text-center px-1">
                                A Home Depot é a maior varejista de materiais de construção e reforma residencial do mundo, com sede em Atlanta, Geórgia, EUA. Fundada em 1978, fornece materiais de construção, artigos de decoração, produtos para gramados e jardins, e atende clientes DIY (faça você mesmo), contratação de terceiros (DIFM) e profissionais. Seus negócios abrangem os Estados Unidos, Canadá e México.
                            </p>
                        )}

                        {/* WhatsApp Group Link - more compact */}
                        {whatsappLink && (
                            <div
                                onClick={handleWhatsAppClick}
                                className="py-2.5 px-4 bg-white/50 rounded-xl border border-orange-200 cursor-pointer active:scale-95 transition-all mt-1"
                            >
                                <p className="text-[#00C853] text-[12px] font-semibold flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">groups</span>
                                    Grupo WhatsApp
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Button "Entendi" - smaller and fixed at bottom */}
                    <button
                        onClick={handleClose}
                        className="mt-4 px-8 py-2.5 bg-[#FFDB00] text-[#FF6B00] font-bold text-base rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all border-b-4 border-[#E0C200]"
                    >
                        Entendi
                    </button>
                </div>
            </div>

            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default WelcomeModal;
