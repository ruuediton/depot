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
    const [stats, setStats] = useState({ total_invited: 0, total_investors: 0, total_earned: 0 });
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

            setStats({
                total_invited: totalInvited,
                total_investors: totalInvestors,
                total_earned: totalEarned
            });

        } catch (error) {
            console.error("Error fetching invite data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (!inviteCode) return;

        // Garantir formatação do link
        let baseUrl = inviteLinkBase.trim();
        // Remover protocolo se existir para garantir padronização (ou adicionar se faltar, mas aqui vamos assumir que o usuário pode ter colocado 'domain.com' ou 'https://domain.com')
        // Melhor abordagem: garantir que começa com https://
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        // Remover barra final se existir
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

    return (
        <div className="bg-white font-sans text-[#0F1111] antialiased min-h-screen flex flex-col selection:bg-amber-100">
            <header className="header-gradient-mixture pb-16 pt-4 px-4">

                <div className="relative z-10 flex items-center justify-center h-11">
                    <h1 className="text-xl font-black text-white tracking-tight">Convidar Amigos</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-40">
                {loading ? (
                    <div className="flex justify-center py-20"><SpokeSpinner size="w-8 h-8" color="text-[#00C853]" /></div>
                ) : (
                    <>
                        {/* Hero Card - Neutral */}
                        <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-6 text-[#111] relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <span className="material-symbols-outlined text-9xl text-[#00C853]">group_add</span>
                            </div>

                            <h3 className="text-2xl font-black mb-1 leading-tight tracking-tighter">Indique e Ganhe</h3>
                            <p className="text-[13px] font-bold text-[#565959] mb-6 max-w-[200px]">Compartilhe a experiência BP e ganhe comissões ilimitadas.</p>

                            <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-50 shadow-sm relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#565959] mb-1">Seu Código</p>
                                    <p className="text-3xl font-black tracking-wider font-mono text-[#00C853]">{inviteCode || '---'}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        const btn = e.currentTarget;
                                        btn.classList.add('scale-75');
                                        setTimeout(() => btn.classList.remove('scale-75'), 200);
                                        handleCopyCode();
                                    }}
                                    className="size-12 bg-[#F8FAF8] text-black rounded-xl flex items-center justify-center active:scale-90 transition-all border border-gray-100/50 hover:bg-[#00C853] hover:text-white"
                                >
                                    <span className="material-symbols-outlined">content_copy</span>
                                </button>
                            </div>
                        </div>

                        {/* Link Action - Flat */}
                        <div className="bg-white rounded-[32px] p-5 border border-gray-50 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-full bg-[#F8FAF8] text-[#0F1111] flex items-center justify-center border border-gray-50">
                                    <span className="material-symbols-outlined text-2xl">link</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[16px]">Link de Convite</h4>
                                    <p className="text-[12px] text-[#565959] font-medium">Divulgue seu ref para novos usuários</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => {
                                        const btn = e.currentTarget;
                                        btn.classList.add('scale-95');
                                        setTimeout(() => btn.classList.remove('scale-95'), 200);
                                        handleCopyLink();
                                    }}
                                    className="flex-1 h-[45px] bg-[#111] text-white rounded-2xl font-black text-[15px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/5 active:bg-[#333]"
                                >
                                    <span className="material-symbols-outlined text-xl">share</span>
                                    Copiar Link de Convite
                                </button>
                            </div>
                        </div>

                        {/* Stats Overview - Flat */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-[32px] p-5 border border-gray-50 shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">groups</span>
                                <p className="text-2xl font-black">{stats.total_invited}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Indicados</p>
                            </div>
                            <div className="bg-white rounded-[32px] p-5 border border-gray-50 shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-3xl text-[#00C853] mb-2">account_balance_wallet</span>
                                <p className="text-2xl font-black">Kz {stats.total_earned}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Recebido</p>
                            </div>
                        </div>

                        {/* View Team Button - Neutral & Borderless */}
                        <div className="pt-2">
                            <button
                                onClick={() => onNavigate('subordinate-list')}
                                className="w-full h-[45px] bg-[#F8FAF8] text-[#111] rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-all border border-gray-50"
                            >
                                <span className="material-symbols-outlined">group</span>
                                Ver Minha Equipe
                            </button>
                        </div>

                        {/* Instructions - Flat */}
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <h4 className="font-bold text-[13px] uppercase tracking-widest text-[#565959] px-2">Como Funciona</h4>

                            <div className="flex gap-4 items-start px-2">
                                <div className="size-8 rounded-full bg-gray-50 border border-gray-50 flex items-center justify-center font-black text-xs shrink-0 text-[#0F1111]">1</div>
                                <div>
                                    <p className="font-bold text-[14px]">Compartilhe seu link</p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">Envie seu link exclusivo para seus contatos.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start px-2">
                                <div className="size-8 rounded-full bg-gray-50 border border-gray-50 flex items-center justify-center font-black text-xs shrink-0 text-[#0F1111]">2</div>
                                <div>
                                    <p className="font-bold text-[14px]">Eles se cadastram</p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">Seus amigos criam contas na BP usando seu ref.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start px-2">
                                <div className="size-8 rounded-full bg-gray-50 border border-gray-50 flex items-center justify-center font-black text-xs shrink-0 text-[#0F1111]">3</div>
                                <div>
                                    <p className="font-bold text-[14px]">Você lucra</p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">Receba comissões automáticas por cada operação deles.</p>
                                </div>
                            </div>
                        </div>

                        {/* Recompensas por Metas - Premium Section */}
                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center border border-transparent">
                                        <span className="material-symbols-outlined text-[#E47911] text-[24px]">workspace_premium</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[15px] text-[#0F1111] leading-none">Metas de Equipe</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Apenas membros investidores contam</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-green-50 rounded-full border border-green-100 font-black">
                                    <span className="text-[10px] text-[#00C853]">{stats.total_investors} INVESTIDORES</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { level: 1, target: 50, reward: 4000, title: 'Bronze', color: '#B12704', bg: 'bg-[#FFF5F2]', icon: 'military_tech' },
                                    { level: 2, target: 100, reward: 8000, title: 'Prata', color: '#565959', bg: 'bg-[#F7F8F8]', icon: 'stars' },
                                    { level: 3, target: 500, reward: 50000, title: 'Ouro', color: '#856404', bg: 'bg-[#FFFBF0]', icon: 'emoji_events' },
                                    { level: 4, target: 1000, reward: 100000, title: 'Diamante', color: '#007185', bg: 'bg-[#F0F9FB]', icon: 'diamond' },
                                ].map((meta) => {
                                    const progress = Math.min((stats.total_investors / meta.target) * 100, 100);
                                    const isReached = stats.total_investors >= meta.target;

                                    return (
                                        <div key={meta.level} className={`group relative overflow-hidden rounded-[32px] border transition-all duration-300 ${isReached ? 'border-green-100 bg-white shadow-xl shadow-green-900/5' : 'bg-white border-gray-50 shadow-sm'}`}>
                                            <div className="p-5 relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-3">
                                                        <div className={`size-12 rounded-2xl flex items-center justify-center border border-transparent ${isReached ? 'bg-green-50 text-green-600' : `${meta.bg}`}`} style={{ color: isReached ? undefined : meta.color }}>
                                                            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isReached ? 'verified' : meta.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isReached ? 'text-green-600' : 'text-gray-400'}`}>NÍVEL {meta.level} • {meta.title}</p>
                                                            <h5 className="font-black text-[18px] text-[#111] leading-tight">{meta.target} <span className="text-[13px] font-bold text-gray-400">Investidores</span></h5>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Prêmio</span>
                                                        <div className="flex items-baseline gap-0.5 text-[#B12704]">
                                                            <span className="text-[10px] font-black">Kz</span>
                                                            <span className="text-[20px] font-black tracking-tighter">{meta.reward.toLocaleString('pt-AO')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end mb-1 px-1">
                                                        <p className="text-[10px] font-bold text-gray-400">
                                                            {isReached ? <span className="flex items-center gap-1 text-green-600 font-black">META ATINGIDA</span> : <>Progresso: <span className="text-[#111]">{stats.total_investors}</span> / {meta.target}</>}
                                                        </p>
                                                        <span className={`text-[11px] font-black ${isReached ? 'text-green-600' : 'text-[#111]'}`}>{Math.floor(progress)}%</span>
                                                    </div>
                                                    <div className="relative w-full h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                                        <div className={`h-full transition-all duration-1000 ease-out ${isReached ? 'bg-green-500' : 'bg-[#00C853]'}`} style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default InvitePage;
