import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useLoading } from '../contexts/LoadingContext';

interface Props {
  onNavigate: (page: any, data?: any) => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  data?: any;
}

const DepositUSDT: React.FC<Props> = ({ onNavigate, showToast, data }) => {
  const { withLoading } = useLoading();
  // Data passed from Recharge.tsx
  const amountUsdt = data?.amountUsdt || 0;
  const amountKz = data?.amountKz || 0;
  const passedRate = data?.exchangeRate || 0;

  const [walletData, setWalletData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const walletAddress = walletData?.endereco_carteira || "Carregando...";
  const recipientName = walletData?.nome_destinatario || "Carregando...";

  // Fetch Unified Wallet
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('usdt_empresarial')
          .select('*')
          .eq('ativo', true)
          .single();

        if (!error && data) {
          setWalletData(data);
        }
      } catch (err) {
        console.error("Wallet fetch error", err);
      }
    };
    fetchWallet();
  }, []);


  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    showToast?.('Endereço copiado!', 'success');
  };


  const handleConfirm = async () => {
    if (!amountUsdt || amountUsdt < 4) {
      showToast?.("Valor inválido.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await withLoading(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão expirada.");

        // Call RPC to create deposit
        const { data, error } = await supabase.rpc('create_usdt_deposit', {
          p_amount_usdt: amountUsdt,
          p_exchange_rate: passedRate
        });

        if (error) throw new Error("Erro de conexão.");
        if (data && !data.success) throw new Error(data.message);

        // Success! Navigate to confirmation details page (same as bank deposit)
        // We construct the deposit object with available data + returned data
        // If data.data exists, use it. Otherwise, use what we have.
        const depositData = data.data || {
          amount: amountKz,
          status: 'pending',
          payment_method: 'USDT',
          created_at: new Date().toISOString(),
          bank_name: 'USDT (TRC20)',
          nome_banco: 'USDT (TRC20)',
          iban: walletAddress,
          nome_destinatario: recipientName
        };

        onNavigate('confirmar-deposito', {
          deposit: {
            ...depositData,
            nome_destinatario: recipientName, // Ensure these are set for display
            nome_banco: 'USDT (TRC20)',
            iban: walletAddress
          }
        });

        return data.message || 'Solicitação enviada!';
      }, 'Solicitação enviada! Aguarde a confirmação.');

    } catch (error: any) {
      console.error(error);
      showToast?.(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white font-sans text-black antialiased min-h-screen flex flex-col pb-32">
      <header className="header-gradient-mixture pb-16 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('deposit')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Recarregar USDT</h1>
          <button
            onClick={() => onNavigate('deposit-usdt-history')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[24px]">history</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-6 no-scrollbar">
        {/* Intro */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="size-16 bg-[#26a17b]/10 rounded-full flex items-center justify-center mb-4 ring-2 ring-[#26a17b]/20">
            <span className="material-symbols-outlined text-[#26a17b]" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>currency_bitcoin</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-black">Depósito Cripto</h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-[280px]">
            Recarregue sua conta usando USDT na rede <span className="text-black font-bold">TRON (TRC20)</span>.
          </p>
        </div>

        {/* Amount Input Section */}
        {/* Amount Read-Only Section */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 text-center">
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">Valor a enviar</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-black text-[#00C853]">{amountUsdt.toFixed(2)}</span>
            <span className="text-sm font-bold text-[#00C853] mt-2">USDT</span>
          </div>
          <div className="mt-2 text-[12px] text-gray-400 font-medium bg-gray-100 rounded-full py-1 px-3 inline-block">
            Equivalente a <span className="text-[#0F1111] font-bold">{amountKz.toLocaleString('pt-AO')} Kz</span>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-6 text-center">Dados para Transferência</h3>

          {/* Recipient Name */}
          <div className="flex flex-col gap-1 mb-4 text-center">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Destinatário</label>
            <p className="text-black font-bold text-sm tracking-wide">{recipientName}</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-8">
            <div className="p-3 bg-white rounded-2xl relative group">
              <div className="size-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl border border-gray-200">
                {/* Replying with a real-looking QR from a public URL for aesthetics */}
                <img loading="lazy" decoding="async"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`}
                  alt="USDT TRC20 QR Code"
                  className="size-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]"
                />
              </div>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-black font-black">zoom_in</span>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-widest text-center">Endereço da Carteira (TRC20)</label>
            <div className="flex items-center gap-2 bg-background-dark p-3 rounded-xl border border-brand-border">
              <p className="flex-1 text-[13px] font-mono font-bold text-text-primary truncate text-center select-all">{walletAddress}</p>
              <button
                onClick={handleCopy}
                className="size-10 bg-primary rounded-lg flex items-center justify-center text-text-primary active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Warning Card */}
        <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-orange-500">warning</span>
            <div className="flex flex-col">
              <p className="text-black text-xs font-bold uppercase tracking-tight">Aviso Importante</p>
              <p className="text-gray-900/80 text-[11px] leading-relaxed mt-1">
                Envie apenas <span className="font-bold text-black underline">USDT via rede TRC20</span>. O envio para outras redes ou moedas resultará na perda definitiva dos fundos.
              </p>
            </div>
          </div>
        </div>

        <div className="h-10"></div>
      </main>

      {/* Footer Confirm */}
      <footer className="fixed bottom-0 max-w-md w-full p-4 bg-white/95 border-t border-gray-100 z-50">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting || !walletData}
          className={`w-full h-[45px] bg-[#00C853] text-white font-bold rounded-xl text-[16px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSubmitting || !walletData ? 'opacity-50 grayscale' : 'shadow-lg shadow-green-200'}`}
        >
          <span>Confirmar Depósito</span>
          <span className="material-symbols-outlined font-bold text-[20px]">send_money</span>
        </button>
      </footer>
    </div>
  );
};

export default DepositUSDT;

