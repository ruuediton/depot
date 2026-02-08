import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SpokeSpinner from '../components/SpokeSpinner';

interface WithdrawalRecord {
  id: string;
  user_id: string;
  nome_completo: string;
  valor_solicitado: number;
  taxa_12_porcento: number;
  data_da_retirada: string;
  hora_da_retirada: string;
  iban: string;
  nome_do_banco: string;
  estado_da_retirada: string;
  data_de_criacao: string;
}

interface Props {
  onNavigate: (page: any) => void;
}

const WithdrawalHistory: React.FC<Props> = ({ onNavigate }) => {
  const [records, setRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('retirada_clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_de_criacao', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching withdrawal history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'revisão':
      case 'pendente':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'aprovado':
      case 'sucedido':
      case 'concluido':
      case 'completado':
      case 'processado':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'rejeitada':
      case 'rejeitado':
      case 'cancelado':
      case 'falhou':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz');
  };

  const maskIban = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/\s/g, '');
    if (clean.length < 13) return val;
    return `${clean.substring(0, 8)}*****${clean.substring(clean.length - 9)}`;
  };

  return (
    <div className="bg-white min-h-screen font-sans text-[#0F1111] pb-10">
      <header className="relative header-gradient-mixture pb-16 pt-4 px-4 overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('retirada')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Retiradas</h1>
          <div className="w-11"></div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <SpokeSpinner size="w-8 h-8" color="text-[#00C853]" />
            <p className="text-[13px] text-[#565959] font-medium">Carregando registros...</p>
          </div>
        ) : records.length > 0 ? (
          records.map((record) => (
            <div key={record.id} className="bg-white border border-[#D5D9D9] rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                    <span className="material-symbols-outlined text-[#565959]">payments</span>
                  </div>
                  <div>
                    <p className="font-bold text-[14px] leading-tight">{record.nome_do_banco}</p>
                    <p className="text-[11px] text-[#565959]">{new Date(record.data_de_criacao).toLocaleDateString('pt-AO')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[15px]">{formatCurrency(record.valor_solicitado)}</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(record.estado_da_retirada)}`}>
                    {record.estado_da_retirada}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-between items-end gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#565959] block mb-0.5">IBAN de Destino</span>
                  <p className="text-[12px] font-mono text-[#0F1111] truncate">{maskIban(record.iban)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#565959] block mb-0.5">Taxa (12%)</span>
                  <p className="text-[12px] font-bold text-red-500">-{formatCurrency(record.taxa_12_porcento)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg flex justify-between items-center">
                <span className="text-[11px] font-bold text-[#565959]">Líquido a receber:</span>
                <span className="text-[13px] font-bold text-green-600">{formatCurrency(record.valor_solicitado - record.taxa_12_porcento)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center px-10">
            <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[40px] text-gray-300">receipt_long</span>
            </div>
            <h3 className="font-bold text-[#0F1111] text-[16px]">Nenhum registro</h3>
            <p className="text-[13px] text-[#565959] mt-1">Suas retiradas aparecerão aqui assim que você as solicitar.</p>
            <button
              onClick={() => onNavigate('retirada')}
              className="mt-6 px-6 py-2 bg-[#00C853] border border-[#00C853] rounded-lg text-white text-[13px] font-medium shadow-sm transition-all active:scale-95"
            >
              Retirar Kwanza Agora
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WithdrawalHistory;

