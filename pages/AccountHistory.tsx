import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  time: string;
  dateLabel: string;
  monthIndex: number;
  type: 'incoming' | 'outgoing' | 'info' | 'warning';
  category: 'Recarga' | 'Resgate' | 'Segurança' | 'Promoção' | 'Pedidos' | 'Misto';
  status?: string;
  year: number;
}

interface Props {
  onNavigate: (page: any) => void;
}

const months = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const AccountHistory: React.FC<Props> = ({ onNavigate }) => {
  const [userProfile, setUserProfile] = useState<{ code: string, phone: string } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('code, phone')
        .eq('id', user.id)
        .single();

      setUserProfile({
        code: profile?.code || "N/A",
        phone: profile?.phone || user.phone || user.user_metadata?.phone || "N/A"
      });

      const [depositsRes, depositsUsdtRes, withdrawalsRes, purchasesRes, bonusRes, p2pRes] = await Promise.all([
        supabase.from('depositos_clientes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('depositos_usdt').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('retirada_clientes').select('*').eq('user_id', user.id).order('data_de_criacao', { ascending: false }),
        supabase.from('historico_compras').select('*').eq('user_id', user.id).order('data_compra', { ascending: false }),
        supabase.from('bonus_transacoes').select('*').eq('user_id', user.id).order('data_recebimento', { ascending: false }),
        supabase.from('transacoes_p2p').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false })
      ]);

      const combined: Transaction[] = [];

      // 1. Bank Deposits
      depositsRes.data?.forEach(d => {
        const date = new Date(d.created_at);
        combined.push({
          id: `dep-${d.id}`,
          title: 'Recarga de Saldo',
          subtitle: `${d.nome_do_banco || 'Transferência'} - ${d.estado_de_pagamento || 'pendente'}`,
          amount: Number(d.valor_deposito || 0),
          time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          dateLabel: `${date.getDate()} de ${months[date.getMonth()]}`,
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          type: 'incoming',
          category: 'Recarga',
          status: d.estado_de_pagamento
        });
      });

      // 2. USDT Deposits
      depositsUsdtRes.data?.forEach(d => {
        const date = new Date(d.created_at);
        combined.push({
          id: `usdt-${d.id}`,
          title: 'Recarga Cripto',
          subtitle: `Rede USDT - ${d.status || 'pendente'}`,
          amount: Number(d.amount_kz || 0),
          time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          dateLabel: `${date.getDate()} de ${months[date.getMonth()]}`,
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          type: 'incoming',
          category: 'Recarga',
          status: d.status
        });
      });

      // 3. Withdrawals
      withdrawalsRes.data?.forEach(w => {
        const date = w.data_de_criacao ? new Date(w.data_de_criacao) : new Date();
        combined.push({
          id: `wit-${w.id}`,
          title: 'Resgate de Recompensa',
          subtitle: `${w.nome_do_banco || 'Banco'} - ${w.estado_da_retirada || 'revisão'}`,
          amount: -Number(w.valor_solicitado),
          time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          dateLabel: `${date.getDate()} de ${months[date.getMonth()]}`,
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          type: 'outgoing',
          category: 'Resgate',
          status: w.estado_da_retirada
        });
      });

      // 4. Purchases
      purchasesRes.data?.forEach(p => {
        const date = new Date(p.data_compra);
        combined.push({
          id: `pur-${p.id}`,
          title: p.nome_produto || 'Pedido de Produto',
          subtitle: `Marketplace BP`,
          amount: -Number(p.preco || 0),
          time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          dateLabel: `${date.getDate()} de ${months[date.getMonth()]}`,
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          type: 'outgoing',
          category: 'Pedidos'
        });
      });

      // 5. Bonuses
      bonusRes.data?.forEach(b => {
        const date = new Date(b.data_recebimento);
        combined.push({
          id: `bon-${b.id}`,
          title: 'Incentivo Recebido',
          subtitle: b.origem_bonus || 'Evento Especial',
          amount: Number(b.valor_recebido || 0),
          time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          dateLabel: `${date.getDate()} de ${months[date.getMonth()]}`,
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          type: 'incoming',
          category: 'Promoção'
        });
      });

      // 6. P2P Transfers
      p2pRes.data?.forEach(t => {
        const date = new Date(t.created_at);
        const isSender = t.sender_id === user.id;
        combined.push({
          id: `p2p-${t.id}`,
          title: isSender ? 'Transferência Enviada' : 'Transferência Recebida',
          subtitle: isSender ? `Para outro usuário` : `De outro usuário`,
          amount: isSender ? -Number(t.amount) : Number(t.amount),
          time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          dateLabel: `${date.getDate()} de ${months[date.getMonth()]}`,
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          type: isSender ? 'outgoing' : 'incoming',
          category: 'Misto'
        });
      });

      setTransactions(combined.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        if (b.monthIndex !== a.monthIndex) return b.monthIndex - a.monthIndex;
        const dayA = parseInt(a.dateLabel.split(' ')[0]);
        const dayB = parseInt(b.dateLabel.split(' ')[0]);
        return dayB - dayA;
      }));
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupedTransactions = transactions.reduce((groups: any, transaction) => {
    const date = transaction.dateLabel;
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {});

  const getStatusStyle = (status: string | undefined, category: string) => {
    if (!status) return '';
    const s = status.toLowerCase();

    // 1. Estilo estrito para Retiradas (Resgate)
    if (category === 'Resgate') {
      if (s === 'revisão' || s === 'pendente') return 'text-blue-600 bg-blue-100/50';
      if (s === 'aprovado' || s === 'concluido' || s === 'completado' || s === 'processado') return 'text-green-700 bg-green-100/50';
      if (s === 'rejeitada' || s === 'rejeitado' || s === 'cancelado') return 'text-orange-600 bg-orange-100/50';
    }

    // 2. Estilo estrito para Depósitos (Recarga)
    if (category === 'Recarga') {
      if (s === 'pendente' || s === 'revisão' || s === 'processando...') return 'text-blue-600 bg-blue-100/50';
      if (s === 'sucedido' || s === 'completo' || s === 'concluido' || s === 'sucesso') return 'text-green-700 bg-green-100/50';
      if (s === 'falha' || s === 'falhou' || s === 'rejeitado' || s === 'rejectado') return 'text-red-600 bg-red-100/50';
    }

    // 3. Fallback para outras categorias
    switch (s) {
      case 'completo':
      case 'aprovado':
      case 'sucesso':
      case 'sucedido':
        return 'text-green-700 bg-green-50';
      case 'pendente':
      case 'revisão':
        return 'text-blue-600 bg-blue-50';
      case 'falha':
      case 'falhou':
      case 'rejeitado':
      case 'rejeitada':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-100/50';
    }
  };

  return (
    <div className="bg-white font-sans text-black antialiased min-h-screen flex flex-col">
      <header className="header-gradient-mixture pb-16 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Atividade</h1>
          <div className="w-11"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 touch-pan-y pt-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <SpokeSpinner size="w-8 h-8" />
          </div>
        ) : Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map(date => (
            <div key={date} className="mb-4">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.1em] pb-3 pt-4 px-6 flex items-center gap-2">
                <span className="size-1.5 bg-[#00C853] rounded-full"></span>
                {date}
              </p>
              <div className="flex flex-col gap-2 px-4">
                {groupedTransactions[date].map((t: Transaction) => (
                  <div key={t.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[24px] border border-transparent transition-all active:scale-[0.98]">
                    <div className={`relative flex items-center justify-center size-12 rounded-full shrink-0 ${t.category === 'Recarga' ? 'bg-[#00C853]/10 text-[#00C853]' :
                      t.category === 'Resgate' ? 'bg-red-500/10 text-red-500' :
                        t.category === 'Segurança' ? 'bg-blue-500/10 text-blue-400' :
                          t.category === 'Promoção' ? 'bg-purple-500/10 text-purple-600' :
                            'bg-gray-200 text-gray-600'
                      }`}>
                      <span className="material-symbols-outlined text-[24px]">
                        {t.category === 'Recarga' ? 'add_card' :
                          t.category === 'Resgate' ? 'payments' :
                            t.category === 'Segurança' ? 'security' :
                              t.category === 'Promoção' ? 'redeem' :
                                'shopping_bag'}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-[#111] text-[15px] font-bold truncate leading-tight">{t.title}</p>
                        <p className={`text-[15px] font-black ${t.category === 'Resgate' ? 'text-red-500' :
                          (t.amount > 0 ? 'text-[#00C853]' : 'text-black')
                          }`}>
                          {t.category === 'Resgate' || t.amount < 0 ? '-' : '+'} {Math.abs(t.amount).toLocaleString()} KZs
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <p className="text-gray-400 text-[11px] uppercase font-bold tracking-wider opacity-80 truncate">{t.subtitle}</p>
                          {t.status && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shrink-0 ${getStatusStyle(t.status, t.category)}`}>
                              {t.status}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-[11px] font-medium whitespace-nowrap">{t.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center opacity-30">
            <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-gray-400">folder_off</span>
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-[12px] leading-relaxed text-gray-400">
              Nenhum registro encontrado
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountHistory;
