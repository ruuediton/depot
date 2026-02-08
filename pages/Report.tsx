
import React, { useState } from 'react';

interface ReportProps {
  onNavigate: (page: any) => void;
}

const Report: React.FC<ReportProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('Transação');

  const categories = ['Transação', 'Conta', 'Bug no App', 'Outros'];

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-black antialiased">
      <header className="header-gradient-mixture pb-16 pt-4 px-4">

        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-white text-[28px]">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white tracking-tight">Relatar Problema</h1>
          <div className="w-11"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col pb-24">
        {/* Description Text */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-gray-700 text-base font-normal leading-normal">
            Pedimos desculpa pelo inconveniente. Conte-nos o que aconteceu para podermos ajudar.
          </p>
        </div>

        {/* Chips / Categories */}
        <div className="px-5 py-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${selectedCategory === cat
                  ? 'border-primary bg-primary/20'
                  : 'bg-[#393628] border-transparent hover:border-gray-600'
                  }`}
              >
                <span className={`text-sm leading-normal ${selectedCategory === cat ? 'font-semibold text-black' : 'font-medium text-gray-700'}`}>
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="px-5 py-2">
          <label className="flex flex-col w-full">
            <span className="text-black text-base font-bold leading-normal pb-3">Descrição do Problema</span>
            <textarea
              className="form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-2 focus:ring-primary border-transparent bg-[#393628] min-h-40 placeholder:text-[text-gray-400] p-4 text-base font-normal leading-normal transition-shadow"
              placeholder="Digite aqui os detalhes (ex: ID da transação, mensagem de erro)..."
            ></textarea>
          </label>
        </div>

        {/* Attachments Section */}
        <div className="px-5 pt-6 pb-2">
          <h3 className="text-black text-lg font-bold leading-tight tracking-tight pb-4">Anexar evidências (Opcional)</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {/* Upload Button */}
            <button className="flex flex-col items-center justify-center h-24 w-24 shrink-0 rounded-xl border-2 border-dashed border-gray-600 bg-transparent hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-primary text-3xl mb-1">add_a_photo</span>
              <span className="text-xs font-medium text-gray-600">Adicionar</span>
            </button>
            {/* Preview Item 1 */}
            <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden group">
              <img loading="lazy" decoding="async"
                alt="Screenshot preview 1"
                className="h-full w-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_w8Y1HFtPRYFT_ab96b1E1I5YCqAAmHFY-MRe9d8xnzgcrcWCw7GJNTxs1SBx-SK4h6uaoK8isWNuogvm7PhR0v4tQ8fnsgg3NXqhsIsbHGLjRTpNkYm9c-eKz7omZS3tIxdRfGF0ySxuPIIedKtIa7sHIDEyc-TLDfUTDr4LxlF2XHeqb9Nn8kCS5u5ja8XAdkfWVoqRqBi-aHnHw6TNPsi2a2GIwYyOEPLjNvAAdSyMFL7zlIdY2b25ZQmJ4mcNDtkiIlPKOnFT"
              />
              <button className="absolute top-1 right-1 bg-black/60 text-black rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {/* Preview Item 2 */}
            <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden group">
              <img loading="lazy" decoding="async"
                alt="Screenshot preview 2"
                className="h-full w-full object-cover contrast-[1.05] brightness-[1.02] saturate-[1.05]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7BGwxeVYHoxuTS7KncwwH2r2aPLRB5iLpMifrNYjl2bjhitrnzdCjy4Ha_kcmWN8CSG2uIbbbeZ67nsv7CidIAJVdnyiRsgo953ca2W-qFkoUIIVw75pdgJjWzM5I1T2CtvsME-LTAbyGkdPXHXYthbLQnLKxWYHoJ0OcWfcmIc1YY3aWabV1YpRGCTBbtL1tb9wyP5DnpQjaq6lvUlIE_kKIyoSYfB3FSngIth9tPJ8H71yf0fsINVJHtNpM0HmoS5ZpA1QuVvht"
              />
              <button className="absolute top-1 right-1 bg-black/60 text-black rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Formatos suportados: PNG, JPG (Max 5MB)</p>
        </div>

        {/* Footer / Security Note */}
        <div className="mt-auto px-5 pt-8 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
            <span className="material-symbols-outlined text-lg">lock</span>
            <p className="text-xs font-medium">Seus dados são enviados de forma segura e criptografada.</p>
          </div>
          {/* Contact Support Link */}
          <button
            onClick={() => onNavigate('support')}
            className="text-primary text-sm font-semibold mb-6 hover:underline flex items-center justify-center gap-1 w-full"
          >
            <span>Precisa de resposta imediata? Falar com Atendente</span>
            <span className="material-symbols-outlined text-base">open_in_new</span>
          </button>
        </div>
      </main>

      {/* Fixed Bottom Button Area */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background-dark/95 border-t border-gray-200 p-5 z-20">
        <button className="flex w-full items-center justify-center rounded-full bg-primary py-4 px-6 transition-transform active:scale-[0.98]">
          <span className="text-white text-base font-bold leading-none tracking-wide">Enviar Relato</span>
        </button>
      </div>
    </div>
  );
};

export default Report;

