import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface PurchaseHistoryProps {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: any) => void;
  profile: any;
}

const STATUS_MAP: any = {
  'pendente': { label: 'Pendente', color: 'text-amber-600' },
  'confirmado': { label: 'Ativo', color: 'text-green-600' },
  'cancelado': { label: 'Cancelado', color: 'text-red-600' }
};

const formatPrice = (price: number) => {
  const [inteiro, centavos] = (Number(price) || 0).toFixed(2).split('.');
  return { inteiro, centavos };
};

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ onNavigate, showToast, profile }) => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isInitialMount = React.useRef(true);

  const fetchPurchases = useCallback(async (showSpinner = false) => {
    if (!profile?.id) return;
    if (showSpinner) setLoading(true);
    else setIsRefreshing(true);

    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('historico_compras')
        .select('*')
        .eq('user_id', profile.id)
        .order('data_compra', { ascending: false });

      if (purchaseError) throw purchaseError;

      let imageMap: Record<string, string> = {};
      try {
        const { data: productData } = await supabase
          .from('products')
          .select('name, image_url');

        productData?.forEach(p => {
          if (p?.name) {
            imageMap[p.name.trim().toLowerCase()] = p.image_url;
          }
        });
      } catch (e) {
        console.warn("Product images fetch failed", e);
      }

      const processed = (purchaseData || []).map(p => {
        const nameKey = p?.nome_produto?.trim().toLowerCase();
        const productImageUrl = nameKey ? imageMap[nameKey] : null;
        return {
          ...p,
          image_url: productImageUrl || null,
          category: 'Shop'
        };
      });

      setPurchases(processed);
    } catch (error: any) {
      console.error("Erro no fetchPurchases:", error);
      showToast?.("Erro ao carregar histórico", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [profile?.id, showToast]);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchPurchases(true);
      isInitialMount.current = false;
    } else {
      fetchPurchases(false);
    }

    let subscription: any;
    const initRealtime = async () => {
      if (!profile?.id) return;

      subscription = supabase
        .channel(`purchases-history-sync-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'historico_compras',
            filter: `user_id=eq.${profile.id}`
          },
          () => fetchPurchases(false)
        )
        .subscribe();
    };

    initRealtime();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchPurchases]);



  return (
    <div className="bg-white min-h-screen text-[#0F1111] font-sans selection:bg-amber-100 pb-32">
      <header className="header-gradient-mixture pb-16 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Minhas Compras</h1>
          <div className="w-11">
            {isRefreshing && (
              <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
            <p className="text-[12px] text-[#565959] font-medium animate-pulse">Aguarde um momento...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-10 animate-in fade-in duration-700">
            <div className="size-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-gray-300 text-5xl">receipt_long</span>
            </div>
            <h3 className="text-[#0F1111] font-bold text-lg mb-2">Sem pedidos</h3>
            <p className="text-[#565959] text-sm leading-relaxed mb-8">
              Você ainda não realizou nenhuma compra. Visite a loja para ver as ofertas.
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-3 bg-[#00C853] hover:bg-[#00C853] rounded-full font-medium text-[14px] border border-[#00C853] active:scale-95 transition-all"
            >
              Ir para Loja
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 border-b border-gray-100">
             {purchases.map((purchase, index) => {
               const { inteiro, centavos } = formatPrice(purchase.preco);
               const status = STATUS_MAP[purchase.status] || STATUS_MAP['confirmado'];
              const dateObj = new Date(purchase.data_compra);

              return (
                <div key={`${purchase.id}-${index}`} className="flex gap-4 p-4 items-start active:bg-gray-50 transition-colors animate-in slide-in-from-bottom-2 duration-300">
                  {/* Image Container - Flat */}
                  <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2 border border-gray-100">
                    <img loading="lazy" decoding="async"
                      src={purchase.image_url || "/placeholder_product.png"}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => (e.currentTarget.src = "/placeholder_product.png")}
                    />
                    <div className="absolute top-0 right-0 bg-white px-1.5 py-0.5 rounded-bl-sm border-l border-b border-gray-100">
                      <span className="text-[8px] font-bold text-[#565959]">ID: {purchase.id.toString().slice(-4)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[11px] font-bold ${status.color}`}>Pedido {status.label}</span>
                      <span className="size-1 bg-gray-300 rounded-full"></span>
                      <span className="text-[11px] text-[#565959] font-medium">
                        {isNaN(dateObj.getTime()) ? 'Data indisponível' : dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <h3 className="text-[14px] font-medium leading-tight line-clamp-2 text-[#0F1111] mb-1">
                      {purchase.nome_produto}
                    </h3>

                    <div className="flex items-baseline mb-2">
                      <span className="text-[11px] font-bold mr-0.5">Kz</span>
                      <span className="text-[20px] font-bold tracking-tight">{inteiro}</span>
                      <span className="text-[11px] font-bold">{centavos}</span>
                    </div>

                    {/* Stats Box - No Shadow */}
                    <div className="p-2 ml-[-4px] rounded-lg bg-[#F7F8F8] border border-gray-200/50 space-y-1 w-full">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#565959] font-bold uppercase tracking-tighter">Rendimento</span>
                        <span className="text-[#007600] font-black">+ Kz {Number(purchase.rendimento_diario || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#565959] font-bold uppercase tracking-tighter">Vencimento</span>
                        <span className="text-[#0F1111] font-bold">
                          {isNaN(new Date(purchase.data_expiracao).getTime()) ? '--' : new Date(purchase.data_expiracao).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {purchases.length > 0 && (
          <div className="p-10 text-center bg-[#F7F8F8] border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#007600] text-xl">verified_user</span>
              <p className="text-[12px] font-bold text-[#007600]">Proteção ao Consumidor BP</p>
            </div>
            <p className="text-[11px] text-[#565959] leading-relaxed max-w-[240px] mx-auto">
              Sua segurança é nossa prioridade. Em caso de dúvidas sobre seus rendimentos, consulte o suporte 24h.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PurchaseHistory;

