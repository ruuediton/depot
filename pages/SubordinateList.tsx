import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface Subordinate {
  id: string;
  phone: string;
  created_at: string;
  invested: number;
}

interface Props {
  onNavigate: (page: any) => void;
}

const SubordinateList: React.FC<Props> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [activeTab, setActiveTab] = useState<number>(1);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      // Usar a nova RPC que retorna os 3 níveis
      const { data, error } = await supabase.rpc('get_my_team');

      if (error) throw error;

      if (data) {
        setSubordinates(data);
      }
    } catch (err) {
      console.error("Erro ao carregar equipe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const filteredSubs = subordinates.filter(sub => (sub as any).level === activeTab);

  return (
    <div className="bg-[#FF6B00] font-sans text-black antialiased min-h-screen flex flex-col">
      <header className="pt-4 px-4 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('invite')}
            className="w-10 h-10 flex items-center justify-center rounded-[4px] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-white text-[32px]">chevron_left</span>
          </button>
          <h1 className="text-[18px] font-semibold text-white tracking-tight">Minha Equipe</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Tabs / Level Selection - Flat Style */}
      <div className="flex gap-2 px-4 pb-6 overflow-x-auto no-scrollbar">
        {[1, 2, 3].map(level => (
          <button
            key={level}
            onClick={() => setActiveTab(level)}
            className={`flex-1 h-10 rounded-[4px] font-semibold text-[13px] uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === level
              ? 'bg-white text-[#FF6B00] border-white'
              : 'bg-[#FF6B00] text-white/70 border-white/30'
              }`}
          >
            Nível {level}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-32 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <SpokeSpinner size="w-8 h-8" color="text-white" />
            <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Verificando rede...</p>
          </div>
        ) : (
          <>
            {/* Summary Card - Flat */}
            <div className="bg-white p-5 rounded-[4px] mb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="size-10 rounded-[4px] bg-[#FFF0E0] flex items-center justify-center text-[#FF6B00]">
                  <span className="material-symbols-outlined text-[24px]">account_tree</span>
                </div>
                <div className="px-3 py-1 bg-[#FFF0E0] text-[#FF6B00] rounded-[4px] text-[10px] font-bold uppercase tracking-widest">
                  NÍVEL {activeTab}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Membros na Camada</p>
                <p className="text-3xl font-bold text-[#111]">{filteredSubs.length}</p>
              </div>
            </div>

            {/* List - Flat */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[11px] font-semibold text-white/80 uppercase tracking-[0.1em] px-1 mb-1">
                Detalhes da Rede
              </h3>

              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub: any, index: number) => (
                  <div
                    key={sub.id}
                    className="bg-white px-3 py-2.5 rounded-[4px] flex items-center gap-3 shadow-sm border-b border-gray-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="size-9 rounded-[4px] bg-[#F5F7FA] flex items-center justify-center text-[#9DA3AE]">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[#111] font-bold text-[13px] tracking-tight leading-tight">
                        {sub.phone.replace(/(\d{3})(\d{3})(\d{3})/, '+$1 *** $3')}
                      </p>
                      <span className="text-gray-400 text-[10px] font-semibold mt-0.5">
                        Desde {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className={`px-2 py-[2px] rounded-[2px] text-[9px] font-bold uppercase tracking-wide ${sub.reloaded_amount >= 3000
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#FFEBEE] text-[#D32F2F]'
                        }`}>
                        {sub.reloaded_amount >= 3000 ? 'INVESTIDO' : 'SEM INVEST.'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white/10 rounded-[4px] border border-white/20 border-dashed animate-in fade-in zoom-in duration-500">
                  <div className="size-12 rounded-[4px] bg-white/20 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-white text-3xl">diversity_3</span>
                  </div>
                  <p className="font-bold text-white text-sm">Camada vazia</p>
                  <p className="text-[11px] text-white/60 px-8 text-center mt-1 italic">
                    Convide mais pessoas para expandir sua rede de nível {activeTab}.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SubordinateList;

