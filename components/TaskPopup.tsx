
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';
import SpokeSpinner from './SpokeSpinner';

interface TaskPopupProps {
  onClose: () => void;
  onNavigate: (page: any) => void;
  showToast: (message: string, type: any) => void;
}

const TaskPopup: React.FC<TaskPopupProps> = ({ onClose, onNavigate, showToast }) => {
  const { withLoading, showError } = useLoading();
  const [loading, setLoading] = useState(true);
  const [hasProducts, setHasProducts] = useState(false);
  const [hasCollectedToday, setHasCollectedToday] = useState(false);
  const [potentialIncome, setPotentialIncome] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchTaskStatus();

    // Auto-close after 8 minutes
    const timer = setTimeout(() => {
      onClose();
    }, 8 * 60 * 1000);

    return () => clearTimeout(timer);
  }, []);

  const fetchTaskStatus = async () => {
    setLoading(true);
    try {
      // Verificação robusta de autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      // Se não houver usuário ou erro de autenticação, não mostra o popup
      if (!user || authError) {
        onClose();
        return;
      }

      const { data, error } = await supabase.rpc('get_task_screen_data');
      if (error) throw error;

      if (data) {
        const purchases = data.purchases || [];
        setHasProducts(purchases.length > 0);
        setHasCollectedToday(data.has_collected_today || false);
        setPotentialIncome(data.potential_income || 0);

        // If already collected, don't show the popup at all
        if (data.has_collected_today) {
          onClose();
        } else {
          setIsVisible(true);
        }
      }
    } catch (err) {
      console.error("Task status error:", err);
      onClose();
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
        // After collection, it shouldn't appear anymore. 
        // We close it after a short delay so they see the success state.
        setTimeout(() => onClose(), 1500);
        return data.message;
      }, "Tarefa diária concluída!");

    } catch (error: any) {
      showError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white w-full max-w-[340px] rounded-[4px] overflow-hidden relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="p-6 pt-10 flex flex-col items-center">
          {loading ? (
            <div className="py-12">
              <SpokeSpinner size="w-10 h-10" color="text-[#00C853]" />
            </div>
          ) : (
            <>
              {/* Dynamic Content based on product status */}
              {!hasProducts ? (
                <div className="flex flex-col items-center text-center">
                  <div className="size-16 rounded-2xl bg-[#00C853]/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#00C853] text-[32px]">inventory_2</span>
                  </div>

                  <p className="text-[#00C853] font-bold text-[15px] leading-relaxed mb-6">
                    Olá! Informamos que, no momento, você não possui nenhum produto ativo. <br />
                    Para realizar tarefas e obter lucros diários, é necessário recarregar a sua conta e adquirir um produto.
                  </p>

                  <button
                    onClick={() => {
                      onNavigate('deposit');
                      onClose();
                    }}
                    className="text-[#00C853] font-bold text-[14px] underline underline-offset-4 decoration-2 active:opacity-70 transition-all mb-4"
                  >
                    Recarregar conta
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <p className="text-[#00C853] font-bold text-[15px] leading-relaxed mb-6">
                    Olá! Você ainda não realizou a sua coleta de renda diária. <br />
                    Clique no botão abaixo para coletar os seus lucros de hoje.
                  </p>

                  {/* Profit Value Badge */}
                  <div className="bg-[#F0F2F2] border border-gray-200 px-4 py-1.5 rounded-full mb-8">
                    <span className="text-[13px] font-bold text-[#007600] uppercase tracking-wide">
                      Total de hoje: +{potentialIncome.toLocaleString()} Kz
                    </span>
                  </div>

                  {/* Circular Collect Button */}
                  <button
                    onClick={handleCheckIn}
                    disabled={hasCollectedToday || isProcessing}
                    className={`relative flex flex-col items-center justify-center w-32 h-32 rounded-full transition-all active:scale-95 border-4 mb-4 ${hasCollectedToday
                        ? 'bg-gray-100 border-gray-200 text-[#565959]'
                        : 'bg-[#00C853] border-[#00C853] text-[#0F1111] shadow-[0_10px_25px_rgba(0,200,83,0.3)]'
                      }`}
                  >
                    {isProcessing ? (
                      <SpokeSpinner className="text-[#0F1111]" size="w-8 h-8" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[44px] mb-1">
                          {hasCollectedToday ? 'verified' : 'power_settings_new'}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-tight">
                          {hasCollectedToday ? 'Coletado' : 'Coletar'}
                        </span>
                      </>
                    )}
                  </button>

                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${hasCollectedToday ? 'text-[#565959]' : 'text-[#007600] animate-pulse'
                    }`}>
                    {hasCollectedToday ? 'RENDA COLETADA' : 'AGUARDANDO COLETA'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
