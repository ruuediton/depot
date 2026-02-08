
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';
import { useLoading } from '../contexts/LoadingContext';

interface ShopProps {
  onNavigate: (page: any) => void;
  showToast?: (message: string, type: any) => void;
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

  const handleOpenModal = React.useCallback((product: any) => {
    if (purchasedIds.includes(product.id)) {
      showToast?.("Limite excedido, compre outro!", "warning");
      return;
    }
    setSelectedProduct(product);
  }, [purchasedIds, showToast]);

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    setIsBuying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada");

      if (balance < selectedProduct.price) {
        throw new Error("Balance insuficiente");
      }

      const { data, error } = await supabase.rpc('purchase_product', {
        p_product_id: selectedProduct.id,
        p_user_id: user.id
      });

      if (error) throw error;
      if (data?.success === false) throw new Error(data.message);

      setSelectedProduct(null);
      showToast?.(data?.message || `Compra sucedida!`, "success");
      setPurchasedIds(prev => [...prev, selectedProduct.id]);

      setTimeout(() => onNavigate('purchase-history'), 1000);
    } catch (error: any) {
      showToast?.(error.message || "Falha na transação", "error");
    } finally {
      setIsBuying(false);
    }
  };

  const formatPrice = React.useCallback((price: number) => {
    const [inteiro, centavos] = price.toFixed(2).split('.');
    return { inteiro, centavos };
  }, []);

  return (
    <div className="bg-[#F4F7F6] min-h-screen text-gray-900 font-display antialiased pb-32">
      <main className="max-w-md mx-auto pt-8">
        <div className="px-6 mb-8 mt-4">
          <h1 className="text-[28px] font-black tracking-tight leading-tight">BP Marketplace</h1>
          <p className="text-gray-400 text-[13px] font-medium mt-1 uppercase tracking-widest">Equipamentos de energia solar</p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <SpokeSpinner size="w-12 h-12" color="text-[#00C853]" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            {products.map((product) => {
              const { inteiro, centavos } = formatPrice(product.price);
              const isPurchased = purchasedIds.includes(product.id);

              return (
                <div key={product.id} className="group relative flex flex-col gap-4 p-6 mx-5 bg-white rounded-[40px] shadow-premium border border-white/50 transition-all hover:scale-[1.01] active:scale-[0.98]">
                  {/* Badge Row */}
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-3 py-1 bg-[#EEFFF5] text-[#00C853] text-[9px] font-black rounded-full uppercase tracking-widest border border-[#00C853]/10`}>Oficial</span>
                    {product.price < 10000 && (
                      <span className="px-3 py-1 bg-[#FFFBEB] text-[#D97706] text-[9px] font-black rounded-full uppercase tracking-widest border border-[#FDE68A]">Popular</span>
                    )}
                  </div>

                  <div className="flex gap-4 items-center">
                    {/* Left Side: Image Container */}
                    <div className="relative w-32 h-32 bg-gray-50 rounded-[28px] overflow-hidden shrink-0 flex items-center justify-center p-3 shadow-inner group-hover:bg-white transition-colors duration-500">
                      <img loading="lazy" decoding="async"
                        src={product.image_url || "/placeholder_product.png"}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Right Side: Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-32">
                      <h3 className="text-[17px] font-black leading-tight text-gray-900 mb-2 line-clamp-2 pr-4 tracking-tight">
                        {product.name}
                      </h3>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-lg bg-[#EEFFF5] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] text-[#00C853]">bolt</span>
                          </div>
                          <p className="text-[12px] font-bold text-gray-500 tracking-tight">Renda <span className="text-[#00C853] font-black">Kz {product.daily_income?.toLocaleString()}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-lg bg-gray-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[14px] text-gray-400">schedule</span>
                          </div>
                          <p className="text-[12px] font-bold text-gray-500 tracking-tight">Ativo por <span className="text-gray-900 font-black">{product.duration_days} dias</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Section */}
                  <div className="mt-4 pt-5 border-t border-gray-50 flex items-center justify-between gap-4">
                    <div className="flex items-baseline">
                      <span className="text-[12px] font-black text-[#00C853] pr-1">KZs</span>
                      <span className="text-[26px] font-black text-gray-900 tracking-tighter">{inteiro}</span>
                      <span className="text-[12px] font-black text-gray-400">,{centavos}</span>
                    </div>

                    <button
                      onClick={() => handleOpenModal(product)}
                      disabled={isPurchased}
                      className={`h-[54px] px-8 rounded-[20px] text-[13px] font-black transition-all active:scale-[0.96] shadow-premium uppercase tracking-[0.1em] ${isPurchased
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200 shadow-none'
                        : 'bg-gray-900 hover:bg-[#00C853] text-white'
                        }`}
                    >
                      {isPurchased ? 'Adquirido' : 'Investir'}
                    </button>
                  </div>

                  {isPurchased && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 pointer-events-none opacity-10">
                      <h4 className="text-[40px] font-black text-gray-900 border-8 border-gray-900 px-6 py-2 uppercase tracking-widest whitespace-nowrap">LIMITE EXCEDIDO</h4>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => !isBuying && setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-t-[48px] sm:rounded-[40px] p-8 pb-10 sm:pb-8 border border-white/50 shadow-2xl scale-100 animate-in slide-in-from-bottom-20 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden"></div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="size-20 rounded-[32px] bg-gray-50 flex items-center justify-center mb-5 shadow-inner">
                <img src={selectedProduct.image_url || "/placeholder_product.png"} className="size-12 object-contain" />
              </div>
              <h3 className="text-[22px] font-black text-gray-900 mb-2 tracking-tight">Confirmar Investimento</h3>
              <p className="text-gray-500 text-[14px] font-medium leading-relaxed px-4">
                Você está adquirindo o <span className="font-bold text-gray-900">{selectedProduct.name}</span> por <span className="text-[#00C853] font-black">Kz {selectedProduct.price.toLocaleString()}</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                disabled={isBuying}
                onClick={handlePurchase}
                className="w-full h-[58px] bg-[#00C853] hover:brightness-110 rounded-[22px] font-black text-white text-[15px] transition-all active:scale-[0.96] flex items-center justify-center uppercase tracking-widest shadow-[0_12px_32px_-8px_rgba(0,200,83,0.5)]"
              >
                {isBuying ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'Confirmar Pagamento'}
              </button>
              <button
                disabled={isBuying}
                onClick={() => setSelectedProduct(null)}
                className="w-full h-[54px] bg-transparent text-gray-400 font-bold text-[13px] uppercase tracking-widest hover:text-gray-600 transition-all"
              >
                Voltar
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-8 opacity-20 grayscale">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Criptografia BP SECURE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

