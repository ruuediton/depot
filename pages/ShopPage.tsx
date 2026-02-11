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
    <div className="bg-[#FF6B00] min-h-screen flex flex-col font-sans antialiased">
      {/* Header Vazio conforme solicitado */}
      <header className="w-full h-14 flex items-center px-4 relative"></header>

      <main className="flex-1 px-4 pb-32">
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
                <div key={product.id} className="relative bg-white rounded-[4px] p-5 transition-all animate-fade-in border border-white/10">
                  {/* Vip Level Badge */}
                  <div className="absolute top-0 right-0 bg-[#FF6B00] px-3 py-1 rounded-tr-[4px] rounded-bl-[4px] text-[10px] font-semibold text-white z-10">
                    Vip {vipLevel}
                  </div>

                  <div className="flex gap-5">
                    {/* Lado Esquerdo: Imagem ocupando a altura do conteúdo */}
                    <div className="w-28 h-28 bg-[#F8F9FA] rounded-[4px] flex items-center justify-center border border-gray-100 p-2 shrink-0 self-center">
                      <img
                        src={product.image_url || "/vip_placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Lado Direito: Informações */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-none mb-1">Renda</p>
                          <p className="text-[13px] font-semibold text-gray-900">
                            {product.daily_income?.toLocaleString('pt-AO')} Kz
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-none mb-1">Interesse</p>
                          <p className="text-[13px] font-semibold text-[#00C853]">
                            {(product.daily_income / 1).toFixed(2)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-400 font-semibold leading-none mb-1">Lucro total</p>
                          <p className="text-[13px] font-semibold text-[#FF6B00]">
                            {(product.daily_income * product.duration_days)?.toLocaleString('pt-AO')} Kz
                          </p>
                        </div>
                      </div>

                      {/* Preço e Botão */}
                      <div className="flex items-end justify-between mt-1 pt-3 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold leading-none mb-1">Preço</p>
                          <p className="text-base font-semibold text-gray-900">
                            {product.price.toLocaleString('pt-AO')} Kz
                          </p>
                        </div>
                        <button
                          onClick={() => handlePurchase(product)}
                          disabled={isPurchased}
                          className={`h-9 px-6 rounded-[4px] text-[13px] font-semibold transition-all active:scale-95 ${isPurchased
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#FF6B00] text-white'
                            }`}
                        >
                          {isPurchased ? 'Ativo' : 'Comprar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal - Estilo igual à imagem de referência */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-8 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={() => !isBuying && setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-[320px] bg-white rounded-[4px] px-8 py-10 text-center shadow-2xl animate-in zoom-in-95 duration-300 transform">
            <p className="text-[#444444] text-[15px] leading-[1.6] mb-2 px-2">
              O saldo de recarga é desbloqueado automaticamente Precisa recarregar
            </p>
            <p className="text-gray-900 font-bold text-[20px] mb-8">
              Kz {selectedProduct.price.toLocaleString('pt-AO')}
            </p>

            <div className="flex flex-col items-center">
              <button
                disabled={isBuying}
                onClick={confirmPurchase}
                className="w-full h-[52px] bg-[#FF3B30] text-white rounded-full font-semibold text-[16px] transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-red-500/20"
              >
                {isBuying ? <SpokeSpinner size="w-6 h-6" color="text-white" /> : 'confirme'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
