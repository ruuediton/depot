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
    <div className="bg-white font-sans text-black antialiased min-h-screen flex flex-col">
      <header className="header-gradient-mixture pb-16 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('invite')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Minha Equipe</h1>
          <div className="w-11"></div>
        </div>
      </header>

      {/* Tabs / Level Selection */}
      <div className="flex gap-2 p-4 pb-0 overflow-x-auto no-scrollbar">
        {[1, 2, 3].map(level => (
          <button
            key={level}
            onClick={() => setActiveTab(level)}
            className={`px-6 h-11 rounded-2xl font-black text-[13px] uppercase tracking-wider transition-all flex-1 whitespace-nowrap ${activeTab === level
              ? 'bg-[#00C853] text-white border border-[#00C853]'
              : 'bg-[#F8FAF8] text-gray-400 border border-gray-50'
              }`}
          >
            Nível {level}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-32 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Verificando rede...</p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-50 mb-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#00C853] border border-gray-100">
                  <span className="material-symbols-outlined text-[28px]">account_tree</span>
                </div>
                <div className="px-3 py-1 bg-green-50 text-[#00C853] rounded-full border border-green-100 text-[10px] font-black uppercase tracking-widest">NÍVEL {activeTab}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Membros na Camada</p>
                <p className="text-4xl font-black text-[#111]">{filteredSubs.length}</p>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">Detalhes da Rede</h3>

              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub: any) => (
                  <div key={sub.id} className="bg-white p-4 rounded-[24px] border border-gray-50 flex items-center gap-4 shadow-sm">
                    <div className="size-12 rounded-full bg-[#F8FAF8] flex items-center justify-center text-gray-400 border border-gray-50">
                      <span className="material-symbols-outlined">person</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[#111] font-bold text-base tracking-tight">
                        {sub.phone.replace(/(\d{3})(\d{3})(\d{3})/, '+$1 *** $3')}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-400 text-[10px] font-bold">Desde {new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${sub.reloaded_amount >= 3000
                        ? 'bg-green-50 text-[#00C853] border border-green-100'
                        : 'bg-red-50 text-red-400 border border-red-100'
                        }`}>
                        {sub.reloaded_amount >= 3000 ? 'INVESTIDO' : 'SEM INVEST.'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-[32px] border border-dashed border-gray-100">
                  <div className="size-16 rounded-full bg-white flex items-center justify-center mb-4 border border-gray-100">
                    <span className="material-symbols-outlined text-gray-200 text-4xl">diversity_3</span>
                  </div>
                  <p className="font-bold text-gray-300 text-sm">Camada vazia</p>
                  <p className="text-[11px] text-gray-400 px-10 text-center mt-1 italic">Convide mais pessoas para expandir sua rede de nível {activeTab}.</p>
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

