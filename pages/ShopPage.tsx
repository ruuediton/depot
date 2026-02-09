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
    <div className="bg-[#F7F9FB] min-h-screen pb-32 font-sans antialiased text-[#1A1A1A]">
      {/* Simple Header */}
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">VIP Shop</h1>
        <p className="text-sm text-gray-500 font-medium">Invista e aumente seus lucros diários</p>
      </header>

      <main className="max-w-md mx-auto px-4 pt-2 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <SpokeSpinner size="w-10 h-10" color="text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const isPurchased = purchasedIds.includes(product.id);
              const vipLevel = product.name.replace(/\D/g, '') || '1';

              return (
                <div key={product.id} className="relative bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 group transition-all duration-300">
                  {/* VIP Level Badge */}
                  <div className="absolute top-4 right-4 bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest z-10">
                    VIP {vipLevel}
                  </div>

                  <div className="flex items-start gap-5">
                    {/* Left: Product Image */}
                    <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 p-2">
                      <img src={product.image_url || "/vip_placeholder.png"} alt={product.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Right: Info Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Renda Diária</p>
                        <p className="text-[14px] font-black text-gray-900">
                          {product.daily_income?.toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Interesse</p>
                        <p className="text-[14px] font-black text-[#00C853]">
                          {(product.daily_income / 1).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-2 pt-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Lucro Total</p>
                        <p className="text-[14px] font-black text-primary">
                          {(product.daily_income * product.duration_days)?.toLocaleString('pt-AO')} Kz
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Section */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Preço</p>
                      <p className="text-lg font-black text-gray-900">{product.price.toLocaleString('pt-AO')} Kz</p>
                    </div>
                    <button
                      onClick={() => handlePurchase(product)}
                      disabled={isPurchased}
                      className={`h-11 px-8 rounded-full text-[14px] font-bold transition-all active:scale-95 ${isPurchased
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110'
                        }`}
                    >
                      {isPurchased ? 'Ativo' : 'Comprar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isBuying && setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-[320px] bg-white rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300 transform">
            <h3 className="text-xl font-black text-gray-900 mb-4">Confirmar Compra</h3>
            <p className="text-gray-500 text-[14px] leading-relaxed mb-8">
              Deseja investir <span className="text-primary font-bold">Kz {selectedProduct.price.toLocaleString('pt-AO')}</span> para desbloquear o <span className="font-bold text-gray-900">VIP {selectedProduct.name.replace(/\D/g, '')}</span>?
            </p>

            <div className="flex flex-col gap-3">
              <button
                disabled={isBuying}
                onClick={confirmPurchase}
                className="w-full h-[54px] bg-primary text-white rounded-2xl font-bold text-[16px] transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                {isBuying ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'Confirmar'}
              </button>
              <button
                disabled={isBuying}
                onClick={() => setSelectedProduct(null)}
                className="w-full h-[50px] text-gray-400 font-bold text-[14px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
