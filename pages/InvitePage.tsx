import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
    onNavigate: (page: any) => void;
    showToast?: (message: string, type: any) => void;
}

const InvitePage: React.FC<Props> = ({ onNavigate, showToast }) => {
    const { withLoading } = useLoading();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total_invited: 0,
        total_investors: 0,
        total_earned: 0,
        team_recharge: 0,
        team_withdraw: 0,
        new_team: 0,
        first_recharge: 0,
        first_withdraw: 0
    });
    const [inviteLinkBase, setInviteLinkBase] = useState<string>('vendas-online.vercel.app');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInviteData();
    }, []);

    const fetchInviteData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Buscar código de convite do perfil
            const { data: profile } = await supabase
                .from('profiles')
                .select('invite_code')
                .eq('id', user.id)
                .single();

            if (profile) setInviteCode(profile.invite_code);

            // 2. Buscar equipe total (3 níveis) usando a RPC
            const { data: teamData } = await supabase.rpc('get_my_team');
            const totalInvited = teamData?.length || 0;
            const totalInvestors = teamData?.filter((m: any) => (m.reloaded_amount || 0) >= 3000).length || 0;

            // 3. Buscar ganhos totais do histórico de bônus
            const { data: bonusData } = await supabase
                .from('bonus_transacoes')
                .select('valor_recebido')
                .eq('user_id', user.id);

            const totalEarned = bonusData?.reduce((acc, curr) => acc + Number(curr.valor_recebido), 0) || 0;

            // 4. Buscar link atualizado do app
            const { data: linkData } = await supabase
                .from('atendimento_links')
                .select('link_app_atualizado')
                .limit(1)
                .single();

            if (linkData?.link_app_atualizado) {
                setInviteLinkBase(linkData.link_app_atualizado);
            }

            // Simular outros dados de equipe baseados no teamData para preencher o grid amarelo
            // Em um cenário real, estas métricas viriam de novas RPCs ou cálculos complexos.
            setStats({
                total_invited: totalInvited,
                total_investors: totalInvestors,
                total_earned: totalEarned,
                team_recharge: teamData?.reduce((acc: number, m: any) => acc + (m.reloaded_amount || 0), 0) || 0,
                team_withdraw: 0, // Placeholder
                new_team: totalInvited, // Placeholder
                first_recharge: totalInvestors, // Placeholder
                first_withdraw: 0 // Placeholder
            });

        } catch (error) {
            console.error("Error fetching invite data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (!inviteCode) return;
        let baseUrl = inviteLinkBase.trim();
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }
        const link = `${baseUrl}/register?ref=${inviteCode}`;
        navigator.clipboard.writeText(link).then(() => {
            showToast?.("Link copiado com sucesso!", "success");
        });
    };

    const handleCopyCode = () => {
        if (!inviteCode) return;
        navigator.clipboard.writeText(inviteCode).then(() => {
            showToast?.("Código copiado!", "success");
        });
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#FF6B00]">
            <SpokeSpinner size="w-10 h-10" color="text-white" />
        </div>
    );

    return (
        <div className="bg-[#FF6B00] min-h-screen pb-32 font-sans antialiased text-gray-900 overflow-x-hidden">
            {/* Custom Header */}
            <header className="sticky top-0 z-50 bg-[#FF6B00] px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="bg-white rounded px-1.5 py-1 w-9 h-9 flex items-center justify-center shadow-sm">
                        <div className="flex flex-col leading-none">
                            <span className="text-[#FF6B00] font-black text-[9px] text-center uppercase">THE</span>
                            <span className="text-[#FF6B00] font-black text-[8px] text-center uppercase">HOME</span>
                        </div>
                    </div>
                    <h1 className="text-white font-black text-lg tracking-tight">The Home Depot</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-white/90 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                    </button>
                    <button className="text-white/90 active:scale-95 transition-transform" onClick={() => onNavigate('support')}>
                        <span className="material-symbols-outlined text-[24px]">headset_mic</span>
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/10">
                        <span className="material-symbols-outlined text-white text-[16px]">language</span>
                        <span className="text-white text-[11px] font-bold">Português</span>
                        <span className="material-symbols-outlined text-white text-[14px]">expand_more</span>
                    </div>
                </div>
            </header>

            <main className="px-4 space-y-5 pt-4">
                {/* Invite Card */}
                <div className="bg-white rounded-[24px] p-6 shadow-xl space-y-6">
                    <div className="text-center space-y-5">
                        <div className="bg-gray-50 rounded-2xl p-5 relative border border-gray-100 flex flex-col items-center">
                            <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">Código de Convite</p>
                            <p className="text-4xl font-black tracking-[0.2em] text-[#FF6B00] font-mono">{inviteCode || '------'}</p>
                            <button
                                onClick={handleCopyCode}
                                className="absolute top-3 right-3 bg-black text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-wider active:scale-90 transition-all"
                            >
                                cópia
                            </button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[11px] text-gray-500 font-bold leading-tight">Compartilhe seu link de indicação e comece a ganhar</p>
                            <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl gap-3 border border-gray-100 overflow-hidden">
                                <p className="text-[11px] text-blue-500 truncate font-black flex-1 text-left px-2">
                                    {`https://${inviteLinkBase}/register?ref=${inviteCode || ''}`}
                                </p>
                                <button
                                    onClick={handleCopyLink}
                                    className="bg-black text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-wider whitespace-nowrap active:scale-90 transition-all"
                                >
                                    cópia
                                </button>
                            </div>
                        </div>

                        {/* Social Icons Row */}
                        <div className="flex justify-between items-center px-2 pt-2 gap-2 overflow-x-auto no-scrollbar grayscale opacity-80">
                            {[
                                { alt: 'X', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhx5-lT7B7E2FVlK97yT3c0q4Ch2pgcxlj80jC1J0tjwYj_t_KeWWGniIkPk503o3aMLeo46n1ZCsI218A23cFZ2dpzE-UnYFlfs-6iUs4xayiraQEfM4zV0jf6xgA20DpRK2PYqvzuFDOa1BHkXKiqi5Lq0X2RIisCbApcuBoEhgYnkfCdsJ0RSko9QWSwXLOjiqBDKRXNb5l7OcR3RhbWtD_PRZ19lifogKv3zAi8StIbzovDXaZvMcH9x1CX7ny8bbIAqiiZhVE' },
                                { alt: 'FB', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx2yBbXF4VxQQiP3XFnFAlEwIukAjFHKFLAEP5Gwb0BUiE71zhNnmtJsL8V_tXFAyPV1WIdgqEDukZnEFmse3nVnD5S1VOJdYlSL8b7kN_6HzZzqFV_OfGkFSuSzq2RmwLSQdkkrrauLk9L2mi4Epb0WMudh1hhlHd06oTKnRtDlm-uTjGFFcTg7YrS__XpclGOU3MvHMnkJunE9vM_IwMgABnh5357jnVCP4fXRCIszZJ6bacF1T__2AOOGUne714IrYzjM0JfGMF' },
                                { alt: 'Telegram', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIjplkS6vX2ZVDhzGtz4--YvUv-BjpJ5SNaXmK7nfEJ1w9GgUDmohK9GQNHYJD4YeF01vxGAUq8J3m0dSZSqJtx80VjzulJP1hK2pPQcRJSlwcV87Tj3BracskKFeO9RailMw7DVLKLBq6C7aI-8pC-ozJN1Xrzw1FvuziDM-Nd9gohNBdSE93uoBaFX-gCJb4iwg7Cv_eUeYCn3niNTBtLm3KATD8LhgH3GXW--sfAnT45c1vuGnL1gt-fXWcKjazuIa-DV6FSjxl' },
                                { alt: 'WA', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyVuIhjEv2kavOVV-dzNjc8TbJynhlcUkCigQbDFW3BG8bULCkPSV8obwp1YbArxtMhs75Uk-uYxsaMMO3EJMu-qcfZa4Lv_ElW4wOwZ74-zJJdpu5raMZ2-8TD7nF0KZbrishYsYDy-5rVEGfFsGejcKpJJRmn7y-1_4cRq3knzt_xjrN1VOVFTIonaSVXhAlOC_AJ-CjsobLqkwuG4y5ZiF51oa7dfqz6vmeWGglqkAZQpO0a8O64aJaLhCIv8GQjbLNVAafH61R' },
                                { alt: 'IG', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgipAUaXtaQgfTfe7SYrvQC-h33WNQR4MLqPGK5TLedxqc_q8xst4U57leujrpvtKI540zQK2VgnfQ7AwR548O6LaRiOjaorsMSj-uathzzyaoFWvblIgwgZSf3nJpvNWGXhkZ5E880nTJEyqedHdVwhNpHQfn8BiweFxNKLJguQlqa7qcyLSE9kRzwexeJbc_L2FDkpIsaBOS2LfuMaBg1v609enxnE03Tcu5i4oYAK1nKwtF-uhk64hNue0UDue1pAP8l0WiUPoC' },
                                { alt: 'TikTok', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlAJ0qJOtiRDMY5P4T9B-SiS7cYg70lhS_167Wexx5vQiw7uiJSkZZtEtSEWZijIiVBlNtubv6auocEqd3lFpgJcPC5zJzy-8o3xC0G2r-DOnmT9CcyN_ZrtUOiY8mFo9OUhBTcmR7NJBsOfwdyfGSKqPP53y3qpnPMyFL8rehR8EiuoCPpvsAXYK8Uzk57xvnU7jWQ1LtVXBjqcCF7S7efxDQE-gsob_TLZ8-CJDbHM-woWreZpk-2r4hstzi3UymR-CPFTacBENr' }
                            ].map((icon, idx) => (
                                <img key={idx} alt={icon.alt} className="w-6 h-6 object-contain" src={icon.src} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Date Filter Label */}
                <div className="flex items-center gap-2 text-white font-black text-sm px-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="uppercase tracking-widest text-[11px]">Período de seleção</span>
                </div>

                {/* Team Stats Yellow Card */}
                <div className="bg-[#FFF9C4] rounded-[24px] p-6 grid grid-cols-3 gap-y-8 text-center border border-white/20 shadow-inner">
                    {[
                        { label: 'Tamanho da equipe', value: stats.total_invited },
                        { label: 'Recarga da equipe', value: `Kz ${stats.team_recharge.toLocaleString()}` },
                        { label: 'Retirada da equipe', value: `Kz ${stats.team_withdraw.toLocaleString()}` },
                        { label: 'Novo time', value: stats.new_team },
                        { label: 'Recarga 1ª vez', value: stats.first_recharge },
                        { label: 'Primeira retirada', value: stats.first_withdraw }
                    ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <p className="text-[9px] text-gray-600 font-black uppercase leading-tight tracking-tighter px-1">{item.label}</p>
                            <p className="text-[17px] font-black text-gray-900 tracking-tight">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Level Cards Section */}
                <div className="space-y-4">
                    {[
                        { level: 1, gradient: 'bg-[#7E3AF2]', comission: '13%', reg: `${stats.total_invited}/0`, earnings: stats.total_earned },
                        { level: 2, gradient: 'bg-[#3F83F8]', comission: '2%', reg: '0/0', earnings: 0 },
                        { level: 3, gradient: 'bg-[#1A56DB]', comission: '1%', reg: '0/0', earnings: 0 }
                    ].map((lvl) => (
                        <div key={lvl.level} className={`${lvl.gradient} relative overflow-hidden rounded-[24px] p-6 text-white shadow-2xl border border-white/5`}>
                            {/* Star Decoration Background */}
                            <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined text-8xl rotate-12">grade</span>
                            </div>

                            {/* Tilted Badge */}
                            <div className="absolute top-0 left-0 bg-white/20 py-1.5 px-10 text-[10px] font-black uppercase -rotate-45 -translate-x-7 translate-y-2 border-b border-white/30 backdrop-blur-sm z-20">
                                NÍVEL {lvl.level}
                            </div>

                            <div className="flex justify-between items-center ml-10 relative z-10 pt-2">
                                <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mb-1">Registro/Válido</p>
                                        <p className="text-xl font-black">{lvl.reg}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mb-1">Comissão</p>
                                        <p className="text-xl font-black">{lvl.comission}</p>
                                    </div>
                                    <div className="col-span-2 text-center pt-2">
                                        <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mb-1">Renda total</p>
                                        <p className="text-2xl font-black text-yellow-300">Kz {lvl.earnings.toLocaleString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onNavigate('subordinate-list')}
                                    className="bg-black/30 hover:bg-black/50 transition-all text-white text-[11px] font-black px-5 py-2 rounded-full border border-white/10 uppercase tracking-widest ml-4 shadow-lg active:scale-95"
                                >
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Fixed Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FF6B00] border-t border-white/10 flex items-center justify-around py-3 rounded-t-2xl z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
                <button onClick={() => onNavigate('home')} className="flex flex-col items-center gap-1 text-white/70">
                    <span className="material-symbols-outlined text-[24px]">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Lar</span>
                </button>
                <button onClick={() => onNavigate('tasks')} className="flex flex-col items-center gap-1 text-white/70">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tarefa</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white font-black group">
                    <div className="bg-white/20 rounded-full p-1.5 mb-0.5 shadow-inner">
                        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider">Equipe</span>
                </button>
                <button onClick={() => onNavigate('shop')} className="flex flex-col items-center gap-1 text-white/70">
                    <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">VIP</span>
                </button>
                <button onClick={() => onNavigate('profile')} className="flex flex-col items-center gap-1 text-white/70">
                    <span className="material-symbols-outlined text-[24px]">account_circle</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Meu</span>
                </button>
            </nav>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .material-symbols-outlined {
                  font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>
        </div>
    );
};

export default InvitePage;
