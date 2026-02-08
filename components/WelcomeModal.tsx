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
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'}`}>
            <div className={`bg-white/10 backdrop-blur-2xl w-full max-w-[280px] rounded-2xl shadow-2xl border border-white/30 p-4 flex flex-col transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white text-lg font-black tracking-tight">Dicas</h2>
                    <button
                        onClick={handleClose}
                        className="size-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* Content - Mensagem do Banco */}
                <div className="flex-1 mb-4">
                    {splashMessage ? (
                        <div
                            className="text-white/90 text-sm font-normal leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: splashMessage }}
                        />
                    ) : (
                        <p className="text-white/90 text-sm font-normal leading-relaxed">
                            Bem-vindo! Junte-se ao nosso grupo para receber atualizações e suporte.
                        </p>
                    )}
                </div>

                {/* Footer - Link WhatsApp */}
                <p
                    onClick={handleWhatsAppClick}
                    className="text-[#00C853] text-sm font-medium italic cursor-pointer hover:text-[#00E676] transition-colors text-center pt-3 border-t border-white/20"
                >
                    Clique entre Grupo WhatsApp
                </p>
            </div>
        </div>
    );
};

export default WelcomeModal;
