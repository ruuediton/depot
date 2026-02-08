
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from '../components/SpokeSpinner';

interface Props {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: any) => void;
}

const Rewards: React.FC<Props> = ({ onNavigate, showToast }) => {
  const { withLoading, showError } = useLoading();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [hasCollectedToday, setHasCollectedToday] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [potentialIncome, setPotentialIncome] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      const { data, error } = await supabase.rpc('get_task_screen_data');
      if (error) throw error;

      if (data) {
        setPurchases(data.purchases || []);
        setPotentialIncome(data.potential_income || 0);
        setHasCollectedToday(data.has_collected_today || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await withLoading(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão expirada.");

        const { data, error } = await supabase.rpc('collect_daily_income');

        if (error) throw new Error("Erro de comunicação. Tente novamente.");

        if (!data.success) {
          throw new Error(data.message || "Erro ao coletar renda.");
        }

        setHasCollectedToday(true);
        return data.message;
      }, "Tarefa diária concluída!");

    } catch (error: any) {
      showError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white font-sans text-[#0F1111] min-h-screen selection:bg-amber-100">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white">
        {/* Header removed as per user request */}

        {/* 6?? Rendimento Diário Badge */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="flex items-center gap-2 bg-[#F0F2F2] border border-gray-200 px-5 py-2 rounded-full">
            <span className="material-symbols-outlined text-[#007600] text-[18px]">trending_up</span>
            <span className="text-[13px] font-bold text-[#007600] uppercase tracking-wide">
              Hoje: {hasCollectedToday ? '+0,00' : `+${potentialIncome.toLocaleString()}`} Kz
            </span>
          </div>
        </div>

        {/* Action Button - BP Hub Style */}
        <div className="flex flex-col items-center justify-center py-10">
          <button
            onClick={handleCheckIn}
            disabled={hasCollectedToday || isProcessing}
            className={`relative z-10 flex flex-col items-center justify-center w-32 h-32 rounded-full transition-all active:scale-95 group border-4 ${hasCollectedToday
              ? 'bg-gray-100 border-gray-200 text-[#565959]'
              : 'bg-[#00C853] border-[#00C853] text-[#0F1111] hover:bg-[#00C853]'
              }`}
          >
            {isProcessing ? (
              <SpokeSpinner className="text-[#0F1111]" size="w-8 h-8" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[44px] mb-1">
                  {hasCollectedToday ? 'verified' : 'power_settings_new'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-tight text-center px-2">
                  {hasCollectedToday ? 'Coletado' : 'Check-in'}
                </span>
              </>
            )}
          </button>
          <p className={`mt-6 text-[12px] font-bold uppercase tracking-[0.2em] ${hasCollectedToday ? 'text-[#565959]' : 'text-[#007600] animate-pulse'}`}>
            {hasCollectedToday ? 'RENDA COLETADA' : 'SISTEMA ONLINE'}
          </p>
        </div>

        {/* Ticker / Log - Flat */}
        <div className="mx-4 mb-8 p-3 rounded-lg bg-[#00C853] border border-[#00C853]/30 flex items-center gap-3 overflow-hidden">
          <span className="material-symbols-outlined text-[#0F1111] text-[20px] shrink-0">info</span>
          <div className="flex-1 overflow-hidden relative h-5">
            <div className="absolute whitespace-nowrap animate-marquee flex items-center text-[13px] text-[#0F1111] font-medium">
              <span className="mr-12">• Realize seu check-in diariamente para receber seus ganhos.</span>
              <span className="mr-12">• Seus dispositivos ativos geram recompensas 24 horas por dia.</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Flat Borders */}
        <div className="grid grid-cols-2 gap-3 px-4 mb-10">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[20px] text-[#565959]">calendar_month</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#565959]">Projeção Semanal</span>
            </div>
            <p className="text-[18px] font-bold text-[#0F1111]">
              Kz {(potentialIncome * 7).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[20px] text-[#565959]">inventory</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#565959]">Ativos Totais</span>
            </div>
            <p className="text-[18px] font-bold text-[#0F1111]">
              {purchases.filter(p => p.status === 'confirmado').length} Unidades
            </p>
          </div>
        </div>

        {/* Active Items List - Divider Design */}
        <div className="flex flex-col px-4 pb-32">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[16px] font-bold text-[#0F1111]">Equipamentos Ativos</h3>
            <button
              onClick={() => onNavigate('purchase-history')}
              className="text-[12px] font-bold text-[#007185] hover:underline"
            >
              Detalhes
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-200 text-center">
              <p className="text-[#565959] text-[13px] font-medium leading-relaxed mb-6">
                Você ainda não possui eletrônicos ativos. Visite a loja para começar.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="w-full h-11 bg-[#00C853] hover:bg-[#00C853] text-white text-[13px] font-bold uppercase rounded-full transition-all border border-[#00C853]"
              >
                Loja
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center gap-4 py-4 active:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-16 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center p-2 border border-gray-100">
                    {purchase.url_produtos ? (
                      <img loading="lazy" decoding="async" alt={purchase.nome} className="object-contain w-full h-full" src={purchase.url_produtos} />
                    ) : (
                      <span className="material-symbols-outlined text-[#565959] text-[32px]">devices</span>
                    )}
                    <div className={`absolute top-0 right-0 w-2.5 h-2.5 ${purchase.status === 'confirmado' ? 'bg-[#007600]' : 'bg-amber-500'} rounded-full border-2 border-white -mr-1 -mt-1`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-medium text-[#0F1111] truncate">{purchase.nome}</h4>
                    <div className="flex items-center gap-2 mt-1.5 font-bold">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-[#00C853] rounded-full ${purchase.status === 'confirmado' ? 'w-full' : 'w-0'}`}></div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-tighter ${purchase.status === 'confirmado' ? 'text-[#007600]' : 'text-amber-600'}`}>
                        {purchase.status === 'confirmado' ? 'Gerando' : 'Aguardando'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#0F1111]">+{purchase.renda_diaria.toLocaleString()} Kz</p>
                    <p className="text-[10px] text-[#565959] font-bold">/dia</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;

