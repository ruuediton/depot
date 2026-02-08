import React from 'react';

interface Props {
    onNavigate: (page: any) => void;
}

const GuiaIndicacao: React.FC<Props> = ({ onNavigate }) => {
    return (
        <div className="bg-white font-sans text-[#0F1111] antialiased min-h-screen flex flex-col selection:bg-green-100">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-16 flex items-center justify-between px-4 max-w-md mx-auto">
                <button
                    onClick={() => onNavigate('tutorials')}
                    className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="text-base font-black tracking-tight text-[#0F1111]">Guia de Indicação</h1>
                <div className="size-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto pt-20 pb-10 px-6 max-w-md mx-auto w-full no-scrollbar">

                {/* Intro */}
                <section className="mb-10">
                    <div className="bg-green-50 p-6 rounded-[32px] border border-green-100 text-center mb-6">
                        <span className="material-symbols-outlined text-5xl text-[#00C853] mb-3">account_tree</span>
                        <h2 className="text-xl font-black text-[#0F1111] leading-tight mb-2">Sistema de Ganhos BP</h2>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed">
                            Pensa nisto como uma <span className="text-[#00C853] font-bold">árvore familiar</span>: tu és a raiz, teus convidados diretos são teus filhos, os convidados deles são teus netos, e assim vai.
                        </p>
                    </div>
                </section>

                {/* 1. Bônus de Cadastro */}
                <section className="mb-10 relative">
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 -z-10"></div>

                    <div className="flex items-start gap-4 mb-2">
                        <div className="size-10 rounded-full bg-[#00C853] text-white flex items-center justify-center font-black shadow-lg shadow-green-200 shrink-0">1</div>
                        <div>
                            <h3 className="text-lg font-black text-[#0F1111] uppercase tracking-wide">Bónus de Cadastro</h3>
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-[#00C853] text-[10px] font-bold rounded mb-2">Ganho Imediato</span>
                        </div>
                    </div>

                    <div className="ml-[54px] space-y-3">
                        <p className="text-sm font-medium text-gray-600">
                            Quando alguém cria conta usando <strong className="text-[#0F1111]">TEU link</strong>.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500">Ganho por pessoa</span>
                                <span className="text-lg font-black text-[#00C853]">75 Kz</span>
                            </div>
                            <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-2 mt-1">
                                Ex: Zé regista-se com teu link → 75 Kz cai na hora (mesmo sem investir).
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Comissões por Investimento */}
                <section className="mb-10 relative">
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 -z-10"></div>

                    <div className="flex items-start gap-4 mb-2">
                        <div className="size-10 rounded-full bg-[#111] text-white flex items-center justify-center font-black shadow-lg shadow-gray-200 shrink-0">2</div>
                        <div>
                            <h3 className="text-lg font-black text-[#0F1111] uppercase tracking-wide">Comissões de Compra</h3>
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded mb-2">3 Níveis</span>
                        </div>
                    </div>

                    <div className="ml-[54px] space-y-4">
                        {/* Nível 1 */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-2 opacity-10 font-black text-6xl text-gray-300">1</div>
                            <h4 className="font-bold text-[#00C853]">Teus Filhos Diretos</h4>
                            <p className="text-xs text-gray-500 mb-2">Quem tu convidaste.</p>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-[#0F1111]">8%</span>
                                <span className="text-xs font-bold text-gray-400 mb-1.5">do valor investido</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                                Ex: Ana compra 100.000 Kz → Tu ganhas <strong className="text-[#0F1111]">8.000 Kz</strong>
                            </p>
                        </div>

                        {/* Nível 2 */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-2 opacity-10 font-black text-6xl text-gray-300">2</div>
                            <h4 className="font-bold text-[#0F1111]">Teus Netos</h4>
                            <p className="text-xs text-gray-500 mb-2">Convidados dos teus filhos.</p>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-[#0F1111]">4%</span>
                                <span className="text-xs font-bold text-gray-400 mb-1.5">do valor investido</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                                Ex: Carlos compra 50.000 Kz → Tu ganhas <strong className="text-[#0F1111]">2.000 Kz</strong>
                            </p>
                        </div>

                        {/* Nível 3 */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 p-2 opacity-10 font-black text-6xl text-gray-300">3</div>
                            <h4 className="font-bold text-[#0F1111]">Teus Bisnetos</h4>
                            <p className="text-xs text-gray-500 mb-2">Convidados dos teus netos.</p>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-[#0F1111]">1%</span>
                                <span className="text-xs font-bold text-gray-400 mb-1.5">do valor investido</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                                Ex: Madalena compra 30.000 Kz → Tu ganhas <strong className="text-[#0F1111]">300 Kz</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Comissões Diárias */}
                <section className="mb-10 relative">
                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 -z-10"></div>

                    <div className="flex items-start gap-4 mb-2">
                        <div className="size-10 rounded-full bg-amber-400 text-[#111] flex items-center justify-center font-black shadow-lg shadow-amber-100 shrink-0">3</div>
                        <div>
                            <h3 className="text-lg font-black text-[#0F1111] uppercase tracking-wide">Tarefas Diárias</h3>
                            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded mb-2">Recorrente (Novo!)</span>
                        </div>
                    </div>

                    <div className="ml-[54px]">
                        <p className="text-sm font-medium text-gray-600 mb-4">
                            Recebes <strong className="text-[#0F1111]">todos os dias</strong> que teus subordinados realizarem a tarefa.
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-600">Nível 1 (Filhos)</span>
                                <span className="text-sm font-black text-[#00C853]">4% diário</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-600">Nível 2 (Netos)</span>
                                <span className="text-sm font-black text-[#00C853]">2% diário</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-sm font-bold text-gray-600">Nível 3 (Bisnetos)</span>
                                <span className="text-sm font-black text-[#00C853]">1% diário</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Salário Semanal */}
                <section className="mb-4">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="size-10 rounded-full bg-gradient-to-br from-[#00C853] to-[#007600] text-white flex items-center justify-center font-black shadow-lg shadow-green-200 shrink-0">4</div>
                        <div>
                            <h3 className="text-lg font-black text-[#0F1111] uppercase tracking-wide">Salário Semanal</h3>
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-[#007600] text-[10px] font-bold rounded">Meta de Promotor</span>
                        </div>
                    </div>

                    <div className="bg-[#111] text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

                        <p className="text-xs font-medium text-gray-400 mb-4 text-center">
                            Apenas subordinados com <span className="text-white font-bold">Investimento Ativo (mín. 3.000 Kz)</span> contam para estas metas.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-700">military_tech</span>
                                    <div>
                                        <p className="text-sm font-bold text-amber-500">Bronze</p>
                                        <p className="text-[10px] text-gray-400">50 investidores</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black">4.000 Kz</span>
                            </div>

                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-300">stars</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-300">Prata</p>
                                        <p className="text-[10px] text-gray-400">100 investidores</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black">8.000 Kz</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
                                    <div>
                                        <p className="text-sm font-bold text-yellow-400">Ouro</p>
                                        <p className="text-[10px] text-gray-400">500 investidores</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black">50.000 Kz</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pago toda sexta-feira automaticamente</p>
                            <p className="text-[9px] text-[#00C853] mt-1">* Valores corrigidos conforme app oficial</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default GuiaIndicacao;
