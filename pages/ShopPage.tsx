import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';
import { useLoading } from '../contexts/LoadingContext';

interface ShopProps {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  balance: number;
}

const Shop: React.FC<ShopProps> = ({ onNavigate, showToast, balance }) => {
  const { withLoading } = useLoading();
  const [products, setProducts] = useState<any[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    fetchInitialData();

    const productsSubscription = supabase
      .channel('shop-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchUserPurchases()]);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('price', { ascending: true });

    if (data) setProducts(data);
  };

  const fetchUserPurchases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('historico_compras')
      .select('product_id')
      .eq('user_id', user.id);

    if (data) setPurchasedIds(data.map(p => p.product_id));
  };

  const handlePurchase = async (product: any) => {
    if (purchasedIds.includes(product.id)) {
      showToast?.("Você já possui este nível VIP!", "warning");
      return;
    }
    setSelectedProduct(product);
  };

  const confirmPurchase = async () => {
    if (!selectedProduct) return;

    if (balance < selectedProduct.price) {
      showToast?.("Saldo insuficiente!", "error");
      onNavigate('deposit');
      return;
    }

    setIsBuying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada");

      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: selectedProduct.id,
        p_user_id: user.id
      });

      if (error) throw error;
      if (data?.success === false) throw new Error(data.message);

      setSelectedProduct(null);
      showToast?.(data?.message || `VIP ${selectedProduct.name} desbloqueado!`, "success");
      setPurchasedIds(prev => [...prev, selectedProduct.id]);

      setTimeout(() => onNavigate('tasks'), 1000);
    } catch (error: any) {
      showToast?.(error.message || "Falha na transação", "error");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="bg-[#A44900] dark:bg-[#1A1A1A] min-h-screen pb-32 font-sans antialiased text-[#0F1111]">
      {/* Header Styled After Image */}
      <header className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-white rounded px-1.5 py-1 w-9 h-9 flex items-center justify-center shadow-sm">
                    <div className="flex flex-col leading-none">
                        <span className="text-[#FF6B00] font-black text-[9px] text-center uppercase">THE</span>
                        <span className="text-[#FF6B00] font-black text-[8px] text-center uppercase">HOME</span>
                    </div>
                </div>
                <h1 className="text-white font-black text-lg tracking-tight uppercase">THE HOME-VIP</h1>
            </div>
            <div className="flex items-center gap-2">
                <button className="text-white/80 p-1.5 bg-white/10 rounded-full">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
                <button className="text-white/80 p-1.5 bg-white/10 rounded-full" onClick={() => onNavigate('support')}>
                    <span className="material-symbols-outlined text-[20px]">headset_mic</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/5 shadow-sm">
                    <span className="material-symbols-outlined text-white text-[16px]">language</span>
                    <span className="text-white text-[11px] font-bold">Português</span>
                    <span className="material-symbols-outlined text-white text-[14px]">expand_more</span>
                </div>
            </div>
        </div>
        <div className="flex justify-end pr-2 pt-2">
            <button className="text-white/40 text-[11px] font-bold hover:text-white/60 transition-colors uppercase tracking-widest">
                Registro de atualização
            </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <SpokeSpinner size="w-10 h-10" color="text-white" />
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => {
              const isPurchased = purchasedIds.includes(product.id);
              
              return (
                <div key={product.id} className="relative bg-[#34271D] dark:bg-[#2D2D2D] rounded-[24px] p-5 shadow-2xl border border-white/5 group hover:scale-[1.02] transition-transform duration-300">
                  {/* VIP Level Badge */}
                  <div className="absolute top-0 right-0 bg-[#E8D5C4] dark:bg-[#3D3D3D] px-4 py-1.5 rounded-tr-[24px] rounded-bl-[16px] text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest z-10">
                    VIP{product.name.replace(/\D/g, '') || '1'}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Left: Product Image Container (Circular like image) */}
                    <div className="relative w-24 h-24 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full animate-pulse blur-sm"></div>
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#241B14] flex items-center justify-center border border-white/10 shadow-inner">
                            <img src={product.image_url || "/vip_placeholder.png"} alt={product.name} className="w-16 h-16 object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                        </div>
                    </div>

                    {/* Right: Info Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Tarefas diárias</p>
                        <p className="text-[15px] font-black text-white">1</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Simples interesse</p>
                        <p className="text-[15px] font-black text-[#00C853]">
                          {(product.daily_income / 1).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Lucro diário</p>
                        <p className="text-[15px] font-black text-white">
                          {product.daily_income?.toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">O lucro total</p>
                        <p className="text-[15px] font-black text-white">
                          {(product.daily_income * product.duration_days)?.toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Section */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handlePurchase(product)}
                      disabled={isPurchased}
                      className={`h-11 px-6 bg-black text-white text-[13px] font-black rounded-full flex items-center gap-3 active:scale-95 transition-all shadow-xl border border-white/5 ${
                        isPurchased ? 'opacity-40 grayscale' : 'hover:bg-[#FF6B00]'
                      }`}
                    >
                      <span className="tracking-tight">{product.price.toLocaleString('pt-AO')} Kz</span>
                      <div className="w-[1px] h-3 bg-white/20"></div>
                      <span className="uppercase tracking-widest text-[10px]">
                        {isPurchased ? 'Ativo' : 'Desbloquear agora'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal - MATCHING IMAGE PRECISELY */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => !isBuying && setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-[340px] bg-white rounded-[32px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500 transform flex flex-col items-center">
            <p className="text-[#565959] text-[16px] font-medium leading-relaxed px-2 mb-8 mt-2">
              O saldo de recarga é desbloqueado automaticamente Precisa recarregar <br/>
              <span className="text-gray-900 font-black tracking-tighter text-lg underline underline-offset-4 decoration-primary/30">
                Kz {selectedProduct.price.toLocaleString('pt-AO')}
              </span>
            </p>

            <button
              disabled={isBuying}
              onClick={confirmPurchase}
              className="w-full h-[54px] bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white rounded-full font-black text-lg transition-all active:scale-90 flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(255,81,47,0.5)] transform hover:brightness-110"
            >
              {isBuying ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'confirme'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#FF6B00] border-t border-white/10 flex items-center justify-around py-3 rounded-t-2xl z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center gap-1 text-white/70">
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Lar</span>
        </button>
        <button onClick={() => onNavigate('tasks')} className="flex flex-col items-center gap-1 text-white/70">
          <span className="material-symbols-outlined text-2xl">receipt_long</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Tarefa</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white font-black">
          <div className="bg-white/20 rounded-full p-1.5 mb-0.5 shadow-inner">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">VIP</span>
        </button>
        <button onClick={() => onNavigate('invite-page')} className="flex flex-col items-center gap-1 text-white/70">
          <span className="material-symbols-outlined text-2xl">groups</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Equipe</span>
        </button>
        <button onClick={() => onNavigate('profile')} className="flex flex-col items-center gap-1 text-white/70">
          <span className="material-symbols-outlined text-2xl">account_circle</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Meu</span>
        </button>
      </nav>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default Shop;
