import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface HomeProps {
  onNavigate: (page: any) => void;
  onOpenSupport?: () => void;
  profile: any;
}

interface MarketingItem {
  id: string;
  url_image: string;
  descricao_nome: string;
  data: string;
}

const carouselImages = [
  "/carousel1.png",
  "/carousel2.png",
  "/carousel3.png"
];

const FILTERS = [
  { label: 'Geral', icon: 'star', page: 'historico-conta' },
  { label: 'P2P', icon: 'sync_alt', page: 'p2p-transfer' },
  { label: 'Retiradas', icon: 'shopping_bag', page: 'withdrawal-history' },
  { label: 'Compras', icon: 'account_balance', page: 'purchase-history' },
  { label: 'Recargas', icon: 'handshake', page: 'deposit-history' },
  { label: 'Suporte', icon: 'contact_support', page: 'support' }
];

const Home: React.FC<HomeProps> = ({ onNavigate, profile }) => {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cheapestProduct, setCheapestProduct] = useState<any>(null);
  const [marketingItems, setMarketingItems] = useState<MarketingItem[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchCheapest = async () => {
      try {
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('price', { ascending: true })
          .limit(1);

        if (products && products.length > 0) {
          setCheapestProduct(products[0]);
        }
      } catch (err) {
        console.error("Home fetch error:", err);
      }
    };

    const fetchMarketing = async () => {
      try {
        const { data, error } = await supabase
          .from('marketing')
          .select('*')
          .order('data', { ascending: false })
          .limit(15);

        if (data && !error) {
          setMarketingItems(data);
        }
      } catch (err) {
        console.error("Marketing fetch error:", err);
      }
    };

    const fetchRecentPurchases = async () => {
      try {
        const { data } = await supabase
          .from('historico_compras')
          .select('id, nome_produto, status')
          .eq('user_id', profile.id)
          .order('data_compra', { ascending: false })
          .limit(5);

        if (data) {
          setRecentPurchases(data);
        }
      } catch (err) {
        console.error("Purchases fetch error:", err);
      }
    };

    const loadAll = async () => {
      setLoadingData(true);
      try {
        await Promise.all([
          fetchCheapest(),
          fetchMarketing(),
          fetchRecentPurchases()
        ]);
      } catch (err) {
        console.error("Home data load error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    if (profile?.id) {
      loadAll();
    }
  }, [profile?.id]);

  return (
    <div className="flex flex-col pb-32 bg-bg-neutral min-h-screen font-sans antialiased relative">
      <section className="relative w-full h-[220px] overflow-hidden rounded-b-[40px] shadow-lg">
        <div className="flex transition-transform duration-1000 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {carouselImages.map((img, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url("${img}")` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {carouselImages.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-6 bg-primary' : 'w-2 bg-white/40'}`}></div>
          ))}
        </div>
      </section>

      {/* Marquee Banner - Orange Theme */}
      <div className="bg-primary py-2 overflow-hidden flex items-center h-9 relative z-20 shadow-[0_4px_20px_rgba(250,100,0,0.2)]">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-[10px] font-black text-white px-8 flex items-center gap-2">
            <span className="size-1 bg-white/40 rounded-full"></span> BEM-VINDO AO THE HOME VIP <span className="size-1 bg-white/40 rounded-full"></span> OFERTAS EXCLUSIVAS DIÁRIAS <span className="size-1 bg-white/40 rounded-full"></span> SUPORTE 24H DISPONÍVEL
          </span>
          <span className="text-[10px] font-black text-white px-8 flex items-center gap-2">
            <span className="size-1 bg-white/40 rounded-full"></span> BEM-VINDO AO THE HOME VIP <span className="size-1 bg-white/40 rounded-full"></span> OFERTAS EXCLUSIVAS DIÁRIAS <span className="size-1 bg-white/40 rounded-full"></span> SUPORTE 24H DISPONÍVEL
          </span>
        </div>
      </div>

      {/* Quick Actions - Enhanced Style */}
      <div className="px-5 pt-8 mb-2">
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => onNavigate('deposit')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-[24px] shadow-premium active:scale-95 transition-all group hover:bg-primary/5">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[24px]">add_card</span>
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Recarga</span>
          </button>
          <button onClick={() => onNavigate('retirada')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-[24px] shadow-premium active:scale-95 transition-all group hover:bg-primary/5">
            <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Retirar</span>
          </button>
          <button onClick={() => onNavigate('tutorials')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-[24px] shadow-premium active:scale-95 transition-all group hover:bg-primary/5">
            <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[24px]">auto_stories</span>
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Guia</span>
          </button>
        </div>
      </div>

      {/* Sticky Filters - Home VIP Style */}
      <div className="sticky top-0 z-40 glass-panel py-4 mt-6">
        <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar scroll-smooth">
          {FILTERS.map((f: any) => (
            <button key={f.label} onClick={() => f.page ? onNavigate(f.page) : setActiveFilter(f.label)} className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-2xl px-5 transition-all active:scale-95 shadow-sm ${activeFilter === f.label ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-gray-50'}`}>
              <span className={`material-symbols-outlined text-[18px]`} style={{ fontVariationSettings: activeFilter === f.label ? "'FILL' 1" : "'FILL' 0" }}>{f.icon}</span>
              <p className={`text-[12px] uppercase tracking-wider ${activeFilter === f.label ? 'font-black' : 'font-bold'}`}>{f.label}</p>
            </button>
          ))}
        </div>
      </div>

      {cheapestProduct && (
        <section className="mt-8">
          <div className="flex items-center justify-between px-6 pb-4">
            <h2 className="text-[20px] font-black leading-tight text-text-main tracking-tight">Oportunidades de Hoje</h2>
            <button onClick={() => onNavigate('shop')} className="text-[12px] font-bold text-primary uppercase tracking-widest hover:underline">Ver todas</button>
          </div>
          <div className="px-5">
            <div className="relative w-full overflow-hidden rounded-[32px] bg-white shadow-premium group border border-white/50">
              <div className="p-6 flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-36 h-36 bg-gray-50 rounded-[24px] p-4 flex items-center justify-center shadow-inner">
                  <img loading="lazy" decoding="async" src={cheapestProduct.image_url || "/placeholder_product.png"} alt="" className="max-w-full max-h-full object-contain drop-shadow-md" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">LÍDER DE VENDAS</span>
                    </div>
                    <h3 className="text-text-main text-[18px] font-bold mt-3 leading-tight line-clamp-2">{cheapestProduct.name}</h3>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="text-[14px] font-black text-primary/70 uppercase tracking-tighter">KZs</span>
                      <span className="text-[32px] font-black text-text-main leading-none tracking-tighter">{cheapestProduct.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="bg-primary hover:brightness-110 text-white text-[13px] font-black py-4 px-6 rounded-2xl w-full mt-6 transition-all shadow-[0_12px_24px_-8px_rgba(250,100,0,0.4)] uppercase tracking-widest"
                  >
                    Investir Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Marketing Section */}
      <section className="mt-8 px-5">
        <h2 className="text-[18px] font-bold text-text-main mb-5 leading-tight tracking-tight px-1">Recomendados para você</h2>

        {loadingData ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-40 rounded-3xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : marketingItems.slice(0, 4).length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {marketingItems.slice(0, 4).map((item, i) => (
              <div key={item.id} onClick={() => onNavigate('shop')} className="cursor-pointer group">
                <div className="bg-white h-48 flex items-center justify-center shadow-premium rounded-[28px] p-4 mb-3 border border-white/50 group-hover:bg-primary/5 group-hover:scale-[1.02] transition-all overflow-hidden relative">
                  <img loading="lazy" decoding="async" src={item.url_image} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-lg" alt={item.descricao_nome} />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">Premium</span>
                  </div>
                </div>
                <div className="px-1">
                  <span className="text-text-main text-[13px] font-bold leading-tight line-clamp-2 mt-1">{item.descricao_nome}</span>
                  <div className="flex items-center gap-1 mt-1 text-primary">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    <span className="text-[10px] font-black tracking-widest uppercase">Promoção</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((item, i) => (
              <div key={i} className="cursor-pointer group opacity-40">
                <div className="bg-white h-48 p-4 flex items-center justify-center shadow-premium rounded-[28px] mb-3 border border-white/50">
                  <span className="material-symbols-outlined text-gray-300 text-5xl">inventory_2</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => onNavigate('shop')} className="mt-6 w-full py-4 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold text-text-secondary uppercase tracking-widest hover:text-primary hover:bg-white transition-all shadow-sm">Ver catálogo completo</button>
      </section>

      <div className="h-10"></div>

      <section className="bg-white rounded-t-[40px] px-6 pt-10 pb-6 shadow-[0_-20px_50px_rgba(250,100,0,0.03)]">
        <h2 className="text-[18px] font-bold text-text-main mb-6 leading-tight tracking-tight">Continuar explorando</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-1">
          {marketingItems.slice(4, 8).length > 0 ? (
            marketingItems.slice(4, 8).map((item) => (
              <div key={item.id} onClick={() => onNavigate('shop')} className="min-w-[180px] cursor-pointer group">
                <div className="bg-gray-50 h-44 flex items-center justify-center rounded-[32px] mb-3 group-hover:bg-primary/5 transition-all overflow-hidden border border-gray-100">
                  <img loading="lazy" decoding="async" src={item.url_image} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                </div>
                <p className="text-[14px] text-text-main font-bold leading-tight truncate px-1">{item.descricao_nome}</p>
                <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider mt-1 px-1">Visualizado</p>
              </div>
            ))
          ) : recentPurchases.length > 0 ? (
            recentPurchases.map((purchase) => (
              <div key={purchase.id} onClick={() => onNavigate('purchase-history')} className="min-w-[180px] cursor-pointer group">
                <div className="bg-gray-50 h-44 flex items-center justify-center rounded-[32px] mb-3 group-hover:bg-primary/5 transition-all overflow-hidden border border-gray-100">
                  <img loading="lazy" decoding="async" src="/placeholder_product.png" className="w-full h-full object-contain opacity-80 mix-blend-multiply" />
                </div>
                <p className="text-[14px] text-text-main font-bold leading-tight truncate px-1">{purchase.nome_produto}</p>
                <p className="text-[11px] text-primary font-bold uppercase tracking-wider mt-1 px-1">{purchase.status === 'pendente' ? 'Processando' : 'Investido'}</p>
              </div>
            ))
          ) : (
            [1, 2, 3].map((_, i) => (
              <div key={i} onClick={() => onNavigate('shop')} className="min-w-[180px] cursor-pointer opacity-50">
                <div className="bg-gray-50 h-44 flex items-center justify-center rounded-[32px] mb-3 border border-gray-100">
                  <span className="material-symbols-outlined text-gray-200 text-4xl">travel_explore</span>
                </div>
                <p className="text-[14px] text-text-main font-bold leading-tight truncate px-1">Novas Ofertas</p>
              </div>
            ))
          )}
        </div>
        <button onClick={() => onNavigate('purchase-history')} className="w-full py-4 text-[12px] font-black text-primary border-t border-gray-50 uppercase tracking-[0.2em] hover:bg-primary/5 transition-all rounded-b-[40px]">Seu Histórico Completo</button>
      </section>

      <div className="h-2 bg-[#F0F2F2]"></div>

      <section className="bg-white px-4 pt-4 pb-6">
        <h2 className="text-[16px] font-bold text-text-main mb-3 leading-tight">Conquiste os melhores produtos</h2>
        <div className="grid grid-cols-2 gap-3">
          {marketingItems.slice(8, 12).length > 0 ? (
            marketingItems.slice(8, 12).map((item) => (
              <div key={item.id} onClick={() => onNavigate('shop')} className="cursor-pointer group">
                <div className="bg-[#F7F8F8] h-40 flex items-center justify-center border border-gray-100 rounded-lg mb-1.5 group-hover:bg-primary/5 transition-colors overflow-hidden">
                  <img loading="lazy" decoding="async" src={item.url_image} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[12px] text-text-main font-medium truncate">{item.descricao_nome}</p>
              </div>
            ))
          ) : (
            [
              { title: 'Eletrônicos', img: '/placeholder_product.png' },
              { title: 'Acessórios', img: '/placeholder_product.png' },
              { title: 'Móveis', img: '/placeholder_product.png' },
              { title: 'Decoração', img: '/placeholder_product.png' }
            ].map((cat, i) => (
              <div key={i} onClick={() => onNavigate('shop')} className="cursor-pointer">
                <div className="bg-[#F7F8F8] h-40 p-3 flex items-center justify-center border border-gray-100 rounded-lg mb-1.5">
                  <img loading="lazy" decoding="async" src={cat.img} className="max-h-full max-w-full object-contain opacity-80" />
                </div>
                <p className="text-[12px] text-text-main font-medium">{cat.title}</p>
              </div>
            ))
          )}
        </div>
        <button onClick={() => onNavigate('shop')} className="mt-4 text-[13px] font-medium text-primary hover:underline">Ver mais</button>
      </section>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; }
      `}</style>
    </div>
  );
};

export default Home;

