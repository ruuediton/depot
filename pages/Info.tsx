
import React from 'react';

interface Props {
    onNavigate: (page: any) => void;
}

const Info: React.FC<Props> = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-white text-black font-sans antialiased">
            {/* Header */}
            <header className="bg-[#00C853] sticky top-0 z-30 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors active:scale-95"
                    >
                        <span className="material-symbols-outlined text-white text-[24px]">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-black text-white tracking-tight text-center flex-1">Central Legal</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 relative z-20">
                <div className="flex flex-col gap-12">

                    {/* SECTION: TERMS & CONDITIONS */}
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Termos de Uso</h2>
                        </div>

                        <div className="flex flex-col gap-8">
                            <p className="text-[#111] text-sm font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                Ao utilizar o aplicativo BP Commerce, você concorda integralmente com os termos descritos abaixo. Leia-os com atenção.
                            </p>

                            <LegalSection
                                number="01"
                                title="Aceitação dos Termos"
                                content="Ao criar sua conta, você declara ter capacidade jurídica e concorda com as regras de operação financeira, prazos e políticas vigentes."
                            />
                            <LegalSection
                                number="02"
                                title="Serviços Financeiros"
                                content="Todas as transações são efetuadas em Kwanzas (Kz). Depósitos via Multicaixa Express possuem tempo médio de compensação de 5 minutos."
                            />
                            <LegalSection
                                number="03"
                                title="Marketplace e Ganhos"
                                content="A aquisição de dispositivos concede o direito de participar de campanhas de recompensas. Os rendimentos são variáveis."
                            />
                            <LegalSection
                                number="04"
                                title="Segurança"
                                content="O utilizador é responsável pelo sigilo de sua senha. A BP nunca solicitará sua senha por redes sociais."
                            />
                        </div>
                    </section>

                    <div className="h-px bg-gray-100"></div>

                    {/* SECTION: PRIVACY POLICY */}
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-[#00C853]">
                                <span className="material-symbols-outlined">shield</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Privacidade</h2>
                        </div>

                        <div className="flex flex-col gap-8">
                            <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-[#00C853] pl-4">
                                Protegemos seus dados conforme a <span className="text-[#111] font-bold">Lei n.º 22/11</span> de Proteção de Dados de Angola.
                            </p>

                            <LegalSection
                                number="01"
                                title="Recolha de Dados"
                                content="Recolhemos Nome, BI, IBAN e contacto para fins de segurança bancária e validação de operações."
                            />
                            <LegalSection
                                number="02"
                                title="Finalidade"
                                content="Os dados destinam-se à gestão de conta e prevenção contra branqueamento de capitais (AML)."
                            />
                            <LegalSection
                                number="03"
                                title="Criptografia"
                                content="Dados armazenados com criptografia de nível militar. Acesso restrito apenas a pessoal autorizado."
                            />
                            <LegalSection
                                number="04"
                                title="Seus Direitos"
                                content="Você tem o direito de acessar, retificar e solicitar a eliminação dos seus dados a qualquer momento."
                            />
                        </div>
                    </section>

                    <div className="h-px bg-gray-100"></div>

                    {/* SECTION: SYSTEM RULES */}
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Regras Normativas</h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 text-orange-900">
                                <span className="material-symbols-outlined text-[20px] shrink-0">info</span>
                                <p className="text-xs font-bold leading-tight">O descumprimento destas normas resultará em auditoria e possível suspensão da conta.</p>
                            </div>

                            <RuleBlock
                                id="1"
                                title="Operações de Caixa"
                                content="Recargas 24/7. Saques em dias úteis (10h-16h), liquidação em até 24h úteis."
                            />
                            <RuleBlock
                                id="2"
                                title="Limites Operacionais"
                                content="Saque min: 300 Kz. Máximo conforme nível VIP. Sujeito a taxas interbancárias."
                            />
                            <RuleBlock
                                id="3"
                                title="Integridade de Conta"
                                content="Uso de contas de terceiros para saques é estritamente proibido e causará rejeição."
                            />
                            <RuleBlock
                                id="4"
                                title="Sistema de Ganhos"
                                content="Manipulações via software ou automações violam as políticas e causam banimento imediato."
                            />
                        </div>
                    </section>

                    {/* FOOTER */}
                    <section className="mt-8 pt-12 border-t border-gray-100 text-center flex flex-col items-center gap-4 pb-12">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">BP Commerce Services, SA</p>
                        <p className="text-[9px] text-gray-400 leading-relaxed max-w-[200px]">
                            Registo n.º 0284/2024<br />
                            Luanda, República de Angola
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

const LegalSection = ({ number, title, content }: { number: string, title: string, content: string }) => (
    <section className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{number}</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#111]">{title}</h3>
        </div>
        <p className="text-gray-600 text-[13px] leading-relaxed pl-9 border-l border-gray-100">
            {content}
        </p>
    </section>
);

const RuleBlock = ({ id, title, content }: { id: string, title: string, content: string }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-[#111] text-white flex items-center justify-center text-[10px] font-bold">{id}</div>
            <h3 className="font-bold text-sm text-[#111]">{title}</h3>
        </div>
        <p className="text-gray-600 text-[13px] leading-relaxed pl-7">
            {content}
        </p>
    </div>
);

export default Info;
