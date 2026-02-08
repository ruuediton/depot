
import React from 'react';
import { Transaction } from '../types';

const transactions: Transaction[] = [
  { id: '1', title: 'Sony Headphones', subtitle: 'BP Marketplace', amount: -33500, date: 'Hoje, 14:30', type: 'outgoing', icon: 'shopping_bag' },
  { id: '2', title: 'Transferência Recebida', subtitle: 'De: João Silva', amount: 5000, date: 'Hoje, 10:15', type: 'incoming', icon: 'arrow_downward' },
  { id: '3', title: 'BP Prime Video', subtitle: 'Assinatura Mensal', amount: -2490, date: 'Ontem, 09:00', type: 'outgoing', icon: 'smart_display' },
  { id: '4', title: 'Pagamento de Fatura', subtitle: 'Cartão BP Prime', amount: -80000, date: 'Ontem', type: 'outgoing', icon: 'receipt_long' },
];

interface WalletProps {
  onNavigate: (page: any) => void;
}

const Wallet: React.FC<WalletProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-24 font-sans text-[#0F1111]">
      <header className="header-gradient-mixture pb-20 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Carteira BP</h1>
          <button className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90">
            <span className="material-symbols-outlined text-white text-[24px]">search</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 mt-6">
        <div className="mb-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 border border-gray-100 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00C853]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Saldo BP Pay</p>
                <div className="size-8 rounded-full bg-green-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00C853] text-[20px]">account_balance_wallet</span>
                </div>
              </div>
              <p className="text-[#0F1111] text-3xl font-black tracking-tight mb-4">Kz 142.250,00</p>
              <div className="flex gap-4 border-t border-gray-100 pt-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Entradas (Mês)</p>
                  <p className="text-[#00C853] text-sm font-black flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    Kz 33.450
                  </p>
                </div>
                <div className="w-px bg-gray-100"></div>
                <div className="flex-1">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Saídas (Mês)</p>
                  <p className="text-[#0F1111] text-sm font-black flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    Kz 22.200
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3">
          <button
            onClick={() => onNavigate('p2p-transfer')}
            className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl active:scale-[0.98] transition-all group hover:bg-white hover:shadow-sm"
          >
            <div className="size-12 rounded-xl bg-[#00C853] flex items-center justify-center text-white shadow-lg shadow-green-200">
              <span className="material-symbols-outlined">send</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[#0F1111] font-black text-sm uppercase tracking-tight">Enviar Dinheiro</p>
              <p className="text-gray-500 text-xs font-medium">Transferência instantânea</p>
            </div>
            <div className="size-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-green-50 transition-colors">
              <span className="material-symbols-outlined text-gray-400 group-hover:text-[#00C853] text-[20px]">chevron_right</span>
            </div>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
          <button className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#0F1111] px-4">
            <span className="text-white text-[12px] font-bold uppercase tracking-wide">Todos</span>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 px-4 transition-all hover:bg-gray-50 active:scale-95">
            <span className="text-[#0F1111] text-[12px] font-bold uppercase tracking-wide">Entradas</span>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 px-4 transition-all hover:bg-gray-50 active:scale-95">
            <span className="text-[#0F1111] text-[12px] font-bold uppercase tracking-wide">Saídas</span>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest pb-3 px-1">Hoje</p>
          {transactions.slice(0, 2).map(t => (
            <div key={t.id} className="group flex items-center gap-4 py-3 bg-white hover:bg-gray-50 transition-all cursor-pointer rounded-xl px-2 -mx-2">
              <div className={`relative flex items-center justify-center size-12 rounded-xl border shrink-0 ${t.type === 'incoming' ? 'bg-green-50 border-green-100 text-[#00C853]' : 'bg-gray-50 border-gray-100 text-[#0F1111]'}`}>
                <span className="material-symbols-outlined">{t.icon}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-[#0F1111] text-[14px] font-bold truncate leading-tight">{t.title}</p>
                  <p className={`text-[14px] font-black whitespace-nowrap ${t.type === 'incoming' ? 'text-[#00C853]' : 'text-[#0F1111]'}`}>
                    {t.amount > 0 ? '+' : '-'} {Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-gray-400 text-[11px] font-medium truncate">{t.subtitle}</p>
                  <p className="text-gray-300 text-[10px] font-bold uppercase">{t.date.split(', ')[1] || t.date}</p>
                </div>
              </div>
            </div>
          ))}

          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest pb-3 pt-6 px-1">Ontem</p>
          {transactions.slice(2).map(t => (
            <div key={t.id} className="group flex items-center gap-4 py-3 bg-white hover:bg-gray-50 transition-all cursor-pointer rounded-xl px-2 -mx-2">
              <div className={`relative flex items-center justify-center size-12 rounded-xl border shrink-0 ${t.type === 'incoming' ? 'bg-green-50 border-green-100 text-[#00C853]' : 'bg-gray-50 border-gray-100 text-[#0F1111]'}`}>
                <span className="material-symbols-outlined">{t.icon}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-[#0F1111] text-[14px] font-bold truncate leading-tight">{t.title}</p>
                  <p className={`text-[14px] font-black whitespace-nowrap ${t.type === 'incoming' ? 'text-[#00C853]' : 'text-[#0F1111]'}`}>
                    {t.amount > 0 ? '+' : '-'} {Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-gray-400 text-[11px] font-medium truncate">{t.subtitle}</p>
                  <p className="text-gray-300 text-[10px] font-bold uppercase">{t.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wallet;

