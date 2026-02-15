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
    const [levelStats, setLevelStats] = useState({
        lvl1: { reg: 0, valid: 0, earnings: 0 },
        lvl2: { reg: 0, valid: 0, earnings: 0 },
        lvl3: { reg: 0, valid: 0, earnings: 0 }
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
                .select('valor_recebido, origem_user_id')
                .eq('user_id', user.id);

            const totalEarned = bonusData?.reduce((acc, curr) => acc + Number(curr.valor_recebido), 0) || 0;

            // Calculate Level Stats
            const getLevelData = (lvl: number) => {
                const members = teamData?.filter((m: any) => m.level === lvl) || [];
                const reg = members.length;
                const valid = members.filter((m: any) => (m.reloaded_amount || 0) >= 3000).length;

                const memberIds = new Set(members.map((m: any) => m.id));
                const earnings = bonusData?.reduce((acc: number, curr: any) => {
                    if (memberIds.has(curr.origem_user_id)) {
                        return acc + Number(curr.valor_recebido);
                    }
                    return acc;
                }, 0) || 0;

                return { reg, valid, earnings };
            };

            setLevelStats({
                lvl1: getLevelData(1),
                lvl2: getLevelData(2),
                lvl3: getLevelData(3)
            });

            // 4. Buscar link atualizado do app
            const { data: linkData } = await supabase
                .from('atendimento_links')
                .select('link_app_atualizado')
                .limit(1)
                .single();

            if (linkData?.link_app_atualizado) {
                setInviteLinkBase(linkData.link_app_atualizado);
            }

            setStats({
                total_invited: totalInvited,
                total_investors: totalInvestors,
                total_earned: totalEarned,
                team_recharge: teamData?.reduce((acc: number, m: any) => acc + (m.reloaded_amount || 0), 0) || 0,
                team_withdraw: 0,
                new_team: totalInvited,
                first_recharge: totalInvestors,
                first_withdraw: 0
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
        <div className="bg-[#FF6B00] min-h-screen pb-32 font-sans antialiased text-gray-900 overflow-x-hidden pt-4">

            <main className="px-4 space-y-5 pt-4">
                {/* Invite Card */}
                <div className="bg-white rounded-[8px] p-6 shadow-2xl space-y-6">
                    <div className="text-center space-y-5">
                        <div className="bg-slate-50 rounded-[8px] p-6 relative border border-slate-100 flex flex-col items-center">
                            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-[0.2em] mb-2">Código de Convite</p>
                            <p className="text-4xl font-semibold tracking-[0.15em] text-[#FF6B00]">{inviteCode || '------'}</p>
                            <button
                                onClick={handleCopyCode}
                                className="absolute top-3 right-3 bg-[#0F1111] text-white text-[9px] px-4 py-1.5 rounded-[8px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                            >
                                COPY
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed px-4 text-center">Compartilhe seu link de indicação e comece a ganhar</p>
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-[8px] gap-2 border border-slate-100 overflow-hidden">
                                <p className="text-[10px] text-blue-600 truncate font-semibold flex-1 text-left px-3">
                                    {`https://${inviteLinkBase}/register?ref=${inviteCode || ''}`}
                                </p>
                                <button
                                    onClick={handleCopyLink}
                                    className="bg-[#0F1111] text-white text-[9px] px-4 py-2.5 rounded-[8px] font-bold uppercase tracking-widest whitespace-nowrap active:scale-95 transition-all shadow-lg"
                                >
                                    COPY
                                </button>
                            </div>
                        </div>

                        {/* Social Icons Row */}
                        <div className="flex justify-between items-center px-2 pt-2 gap-3 overflow-x-auto no-scrollbar opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            {[
                                { alt: 'X', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhx5-lT7B7E2FVlK97yT3c0q4Ch2pgcxlj80jC1J0tjwYj_t_KeWWGniIkPk503o3aMLeo46n1ZCsI218A23cFZ2dpzE-UnYFlfs-6iUs4xayiraQEfM4zV0jf6xgA20DpRK2PYqvzuFDOa1BHkXKiqi5Lq0X2RIisCbApcuBoEhgYnkfCdsJ0RSko9QWSwXLOjiqBDKRXNb5l7OcR3RhbWtD_PRZ19lifogKv3zAi8StIbzovDXaZvMcH9x1CX7ny8bbIAqiiZhVE' },
                                { alt: 'FB', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx2yBbXF4VxQQiP3XFnFAlEwIukAjFHKFLAEP5Gwb0BUiE71zhNnmtJsL8V_tXFAyPV1WIdgqEDukZnEFmse3nVnD5S1VOJdYlSL8b7kN_6HzZzqFV_OfGkFSuSzq2RmwLSQdkkrrauLk9L2mi4Epb0WMudh1hhlHd06oTKnRtDlm-uTjGFFcTg7YrS__XpclGOU3MvHMnkJunE9vM_IwMgABnh5357jnVCP4fXRCIszZJ6bacF1T__2AOOGUne714IrYzjM0JfGMF' },
                                { alt: 'Telegram', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIjplkS6vX2ZVDhzGtz4--YvUv-BjpJ5SNaXmK7nfEJ1w9GgUDmohK9GQNHYJD4YeF01vxGAUq8J3m0dSZSqJtx80VjzulJP1hK2pPQcRJSlwcV87Tj3BracskKFeO9RailMw7DVLKLBq6C7aI-8pC-ozJN1Xrzw1FvuziDM-Nd9gohNBdSE93uoBaFX-gCJb4iwg7Cv_eUeYCn3niNTBtLm3KATD8LhgH3GXW--sfAnT45c1vuGnL1gt-fXWcKjazuIa-DV6FSjxl' },
                                { alt: 'WA', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyVuIhjEv2kavOVV-dzNjc8TbJynhlcUkCigQbDFW3BG8bULCkPSV8obwp1YbArxtMhs75Uk-uYxsaMMO3EJMu-qcfZa4Lv_ElW4wOwZ74-zJJdpu5raMZ2-8TD7nF0KZbrishYsYDy-5rVEGfFsGejcKpJJRmn7y-1_4cRq3knzt_xjrN1VOVFTIonaSVXhAlOC_AJ-CjsobLqkwuG4y5ZiF51oa7dfqz6vmeWGglqkAZQpO0a8O64aJaLhCIv8GQjbLNVAafH61R' },
                                { alt: 'IG', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgipAUaXtaQgfTfe7SYrvQC-h33WNQR4MLqPGK5TLedxqc_q8xst4U57leujrpvtKI540zQK2VgnfQ7AwR548O6LaRiOjaorsMSj-uathzzyaoFWvblIgwgZSf3nJpvNWGXhkZ5E880nTJEyqedHdVwhNpHQfn8BiweFxNKLJguQlqa7qcyLSE9kRzwexeJbc_L2FDkpIsaBOS2LfuMaBg1v609enxnE03Tcu5i4oYAK1nKwtF-uhk64hNue0UDue1pAP8l0WiUPoC' },
                                { alt: 'TikTok', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlAJ0qJOtiRDMY5P4T9B-SiS7cYg70lhS_167Wexx5vQiw7uiJSkZZtEtSEWZijIiVBlNtubv6auocEqd3lFpgJcPC5zJzy-8o3xC0G2r-DOnmT9CcyN_ZrtUOiY8mFo9OUhBTcmR7NJBsOfwdyfGSKqPP53y3qpnPMyFL8rehR8EiuoCPpvsAXYK8Uzk57xvnU7jWQ1LtVXBjqcCF7S7efxDQE-gsob_TLZ8-CJDbHM-woWreZpk-2r4hstzi3UymR-CPFTacBENr' }
                            ].map((icon, idx) => (
                                <img key={idx} alt={icon.alt} className="w-5 h-5 object-contain" src={icon.src} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Date Filter Label */}
                <div className="flex items-center gap-3 text-white/90 px-2 mt-2">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Período de seleção</span>
                </div>

                {/* Team Stats Yellow Card */}
                <div className="bg-[#FFF9C4]/90 backdrop-blur-md rounded-[8px] p-8 grid grid-cols-3 gap-y-8 gap-x-2 text-center shadow-lg">
                    {[
                        { label: 'Tamanho equipe', value: stats.total_invited },
                        { label: 'Recarga equipe', value: `Kz ${stats.team_recharge.toLocaleString()}` },
                        { label: 'Retirada equipe', value: `Kz ${stats.team_withdraw.toLocaleString()}` },
                        { label: 'Novo time', value: stats.new_team },
                        { label: 'Recarga 1ª vez', value: stats.first_recharge },
                        { label: 'Primeira retirada', value: stats.first_withdraw }
                    ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <p className="text-[9px] text-gray-500 font-semibold uppercase leading-tight tracking-tight">{item.label}</p>
                            <p className="text-[15px] font-bold text-gray-900 tracking-tight">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Level Cards Section */}
                <div className="space-y-5">
                    {[
                        { level: 1, gradient: 'bg-[#7E3AF2]', comission: '10%', stats: levelStats.lvl1 },
                        { level: 2, gradient: 'bg-[#3F83F8]', comission: '5%', stats: levelStats.lvl2 },
                        { level: 3, gradient: 'bg-[#1A56DB]', comission: '2%', stats: levelStats.lvl3 }
                    ].map((lvl) => (
                        <div key={lvl.level} className={`${lvl.gradient} relative overflow-hidden rounded-[8px] p-6 text-white shadow-2xl border border-white/10 group`}>
                            {/* Star Decoration Background */}
                            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-9xl rotate-12">grade</span>
                            </div>

                            {/* Badge */}
                            <div className="absolute top-0 left-0 bg-white/20 py-2 px-10 text-[9px] font-bold uppercase -rotate-45 -translate-x-8 translate-y-3 backdrop-blur-md border-b border-white/20 shadow-sm">
                                NÍVEL {lvl.level}
                            </div>

                            <div className="flex justify-between items-center ml-8 relative z-10 pt-2">
                                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-6">
                                    <div className="text-center">
                                        <p className="text-[9px] font-medium opacity-60 uppercase tracking-[0.1em] mb-1">Registro/Válido</p>
                                        <p className="text-[17px] font-semibold">{lvl.stats.reg}/{lvl.stats.valid}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-medium opacity-60 uppercase tracking-[0.1em] mb-1">Comissão</p>
                                        <p className="text-[17px] font-semibold">{lvl.comission}</p>
                                    </div>
                                    <div className="col-span-2 text-center flex flex-col items-center">
                                        <p className="text-[9px] font-medium opacity-60 uppercase tracking-[0.1em] mb-1">Renda acumulada</p>
                                        <p className="text-2xl font-bold text-yellow-300 drop-shadow-sm">Kz {lvl.stats.earnings.toLocaleString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onNavigate('subordinate-list')}
                                    className="bg-white/10 hover:bg-white/20 transition-all text-white text-[10px] font-bold px-6 py-2.5 rounded-[8px] border border-white/20 uppercase tracking-widest ml-4 shadow-sm active:scale-95"
                                >
                                    DETALHES
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>



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
