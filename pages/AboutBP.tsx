
import React from 'react';

interface Props {
    onNavigate: (page: any) => void;
}

const AboutBP: React.FC<Props> = ({ onNavigate }) => {
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
                    <h1 className="text-lg font-black text-white tracking-tight text-center flex-1">Quem Somos</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 pb-32 no-scrollbar">
                <div className="flex flex-col gap-10">

                    {/* Intro Section */}
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h2 className="text-2xl font-black text-[#111] mb-4 tracking-tight">Introdução de British Petroleum</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                            <p>
                                A BP, originalmente Anglo-Persian Oil Company e depois British Petroleum, é uma empresa multinacional sediada no Reino Unido que opera no setor de energia, sobretudo de petróleo e gás.
                            </p>
                            <p>
                                Fez parte do cartel conhecido como Sete Irmãs, formado pelas maiores empresas exploradoras, refinadoras e distribuidoras de petróleo e gás do planeta, as quais, após fusões e incorporações, reduziram-se a quatro: ExxonMobil, Chevron, Shell e a própria BP.
                            </p>
                            <p>
                                É a única distribuidora de gasolina sem chumbo 100 octanas.
                            </p>
                            <p>
                                Pesquisas realizadas em 2019 mostram que a BP, com emissões de 34,02 bilhões de toneladas de equivalente CO₂ desde 1965, foi a empresa com a sexta maior emissão mundial durante esse período.
                            </p>
                        </div>
                    </section>

                    {/* Points Section */}
                    <div className="flex flex-col gap-12 mt-4">

                        <ProjectItem
                            id="1"
                            title="Descoberta e Exploração de Recursos"
                            point="Começou com uma grande descoberta de petróleo no Irã (1908), a primeira comercialmente viável no Médio Oriente."
                            application={[
                                "Identificar e desenvolver recursos estratégicos além do petróleo. Angola já é um grande produtor de petróleo, mas pode focar em:",
                                "Gás Natural: Aproveitar as reservas de gás associado e não associado.",
                                "Minerais Críticos: Explorar cobre, lítio, fosfatos e terras raras.",
                                "Potencial Agrícola: Desenvolver a produção em larga escala de commodities como café, cacau e frutas tropicais."
                            ]}
                        />

                        <ProjectItem
                            id="2"
                            title="Parcerias Estratégicas e Joint Ventures"
                            point="Expandiu-se globalmente através de joint ventures (ex.: com Shell na Nigéria, Gulf Oil no Kuwait, AAR na Rússia)."
                            application={[
                                "Criar parcerias com grandes empresas internacionais para investir em Angola.",
                                "Modelo: Oferecer segurança jurídica e incentivos para joint ventures entre a Sonangol (ou outras empresas nacionais) e multinacionais em sectores-chave (energias renováveis, infraestrutura portuária, fertilizantes).",
                                "Objetivo: Transferência de tecnologia, capital externo e acesso a mercados globais."
                            ]}
                        />

                        <ProjectItem
                            id="3"
                            title="Integração Vertical e Controle da Cadeia"
                            point="Controlava desde a exploração até ao refino, transporte e venda em postos de gasolina (estações de serviço)."
                            application={[
                                "Aumentar a captura de valor dentro de Angola.",
                                "Refino e Petroquímicos: Investir em refinarias e complexos petroquímicos para processar o petróleo e o gás localmente, em vez de exportar apenas a matéria-prima.",
                                "Logística e Distribuição: Desenvolver uma rede nacional e regional de distribuição de combustíveis e derivados."
                            ]}
                        />

                        <ProjectItem
                            id="4"
                            title="Diversificação Geográfica e de Portfólio"
                            point="Para reduzir a dependência do Médio Oriente, diversificou operações para o Alasca, Mar do Norte, EUA, etc. Mais tarde, investiu em bioetanol e biobutanol."
                            application={[
                                "Reduzir a dependência do petróleo através de investimentos em outros sectores e regiões.",
                                "Diversificação Interna: Canalizar receitas do petróleo para desenvolver a agricultura, turismo, indústria leve e tecnologia.",
                                "Investimento Externo: Criar um Fundo Soberano de Investimento (como o do Qatar ou Noruega) para aplicar recursos financeiros de Angola em ativos internacionais diversificados (ações, títulos, infraestrutura no exterior), gerando receitas para o país."
                            ]}
                        />

                        <ProjectItem
                            id="5"
                            title="Adaptação a Crises e Pressões Geopolíticas"
                            point="Perdeu acesso direto ao petróleo bruto da OPEP após a crise de 1973 e se adaptou. Foi nacionalizada no Irã em 1951 e recuperou a posição após um golpe."
                            application={[
                                "Criar resiliência económica e política.",
                                "Estabilidade Contractual: Garantir um ambiente contratual estável e transparente para atrair investidores, mesmo em ciclos de baixa do petróleo.",
                                "Gestão de Crise: Ter planos para diversificar rapidamente a economia em caso de choques no preço do petróleo ou pressões geopolíticas globais."
                            ]}
                        />

                        <ProjectItem
                            id="6"
                            title="Marca, Reputação e Reinvenção"
                            point='Tentou mudar sua imagem após desastres ambientais e de segurança, rebrandizando para "Beyond Petroleum" (Além do Petróleo) com foco em energia mais limpa.'
                            application={[
                                "Posicionar Angola como um destino de investimento moderno e responsável.",
                                'Marca "Invest Angola": Promover uma imagem de país aberto, com governança corporativa forte e compromisso com a sustentabilidade ambiental e social.',
                                "Energia do Futuro: Atrair projetos de energia solar, hidroeléctrica e hidrogénio verde, posicionando Angola como um hub de energia renovável na África Austral."
                            ]}
                        />

                        <ProjectItem
                            id="7"
                            title="Plataforma de Atração de Investimento à Distância"
                            point="Operava em múltiplos países com estruturas locais e gestão remota."
                            application={[
                                "Criar um \"Hub de Investimento Digital\" para Angola.",
                                "Plataforma Online: Desenvolver um portal único onde investidores globais possam:",
                                "1. Ver oportunidades de projecto com due diligence prévia.",
                                "2. Processar autorizações e licenças online.",
                                "3. Monitorizar investimentos em tempo real.",
                                "4. Conectar-se com parceiros locais.",
                                "Vantagem: Permite captar capital internacional sem que o investidor precise estar fisicamente presente em Angola, reduzindo a barreira de entrada."
                            ]}
                        />

                    </div>

                    {/* Conclusion Section */}
                    <section className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 mt-6">
                        <h3 className="text-xl font-black text-[#111] mb-4">Conclusão para Angola</h3>
                        <div className="space-y-4">
                            <p className="text-gray-700 text-sm leading-relaxed">
                                O modelo da BP mostra que uma economia baseada em recursos naturais pode evoluir através de parcerias estratégicas, integração vertical, diversificação e uma marca forte. Para Angola, o caminho é:
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Maximizar o valor dos recursos (petróleo, gás, minerais) processando-os localmente.",
                                    "Criar um ambiente atrativo para joint ventures internacionais em sectores diversos.",
                                    "Usar as receitas para construir um portfólio de investimentos nacionais e internacionais.",
                                    "Lançar uma plataforma digital para captar investimento global, facilitando o acesso ao mercado angolano mesmo à distância."
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                                        <span className="text-[#00C853] font-black">{i + 1}.</span>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Strategy Section */}
                    <section className="mt-8">
                        <div className="bg-[#111] text-white p-8 rounded-[40px] shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853] blur-[80px] opacity-20 translate-x-10 -translate-y-10"></div>

                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#00C853] mb-4">Estratégia Nacional</h3>
                            <h2 className="text-3xl font-black leading-tight mb-6">ANGOLA 2030 – EMPREGO, ESTABILIDADE E IGUALDADE</h2>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <h4 className="text-sm font-black uppercase text-[#00C853] mb-2 tracking-widest">Visão</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Transformar Angola numa economia diversificada, digital e inclusiva, capaz de absorver milhares de jovens no mercado de trabalho, reduzir a carência financeira familiar e promover igualdade social através do empreendedorismo, educação e acesso ao capital.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase text-[#00C853] mb-4 tracking-widest">Pilares Estratégicos</h4>

                                    <StrategyPillar
                                        title="1. PLATAFORMA NACIONAL DE EMPREGO JOVEM – “EMPREGA ANGOLA”"
                                        points={[
                                            "Objetivo: Conectar jovens angolanos a oportunidades de trabalho, formação e empreendedorismo.",
                                            "Ações:",
                                            "Cadastro Único Digital: Todos os jovens registam-se com perfil profissional, habilidades e interesses.",
                                            "Parcerias com Empresas: O Estado oferece incentivos fiscais a empresas que contratem jovens pela plataforma.",
                                            "Bolsa-Estágio: Programa de estágios remunerados em empresas privadas e públicas.",
                                            "Formação Técnica Alinhada ao Mercado: Cursos em energia solar, TI, agricultura moderna, logística, turismo."
                                        ]}
                                    />

                                    <StrategyPillar
                                        title="2. BANCO DO JOVEM EMPREENDEDOR"
                                        points={[
                                            "Objetivo: Financiar negócios liderados por jovens e mitigar a carência financeira.",
                                            "Ações:",
                                            "Crédito com Garantia Estatal: Empréstimos a juro zero ou baixo para startups e pequenos negócios.",
                                            "Aceleradoras de Negócios: Apoio a ideias inovadoras em tecnologia verde, agroprocessamento e serviços digitais.",
                                            "Fundos de Venture Capital Público-Privado: Investimento em startups de alto crescimento."
                                        ]}
                                    />

                                    <StrategyPillar
                                        title="3. PROGRAMAS DE EMPREGO MACIÇO EM SETORES ESTRATÉGICOS"
                                        points={[
                                            "Setor 1: Energia Renovável (Solar, Hídrica, Hidrogénio Verde) - Instalação de parques solares. Empregos: Técnicos, engenharia.",
                                            "Setor 2: Agricultura e Agroindústria - Projetos de irrigação e produção em larga escala. Empregos: Agricultores técnicos, operários.",
                                            "Setor 3: Construção Civil e Infraestruturas - Estradas, pontes, habitação social. Empregos: Pedreiros, engenheiros.",
                                            "Setor 4: Digital e Tecnologia - Parques Tecnológicos em Luanda, Huambo, Benguela. Empregos: Programadores, marketing digital."
                                        ]}
                                    />

                                    <StrategyPillar
                                        title="4. ECONOMIA SOCIAL E IGUALDADE DE GÉNERO"
                                        points={[
                                            "Programa “Angola Inclusiva”:",
                                            "Cotas para mulheres e jovens em concursos públicos e licitações.",
                                            "Apoio a cooperativas agrícolas e artesanais lideradas por mulheres.",
                                            "Creches públicas próximas de zonas industriais para facilitar a entrada da mulher no mercado de trabalho."
                                        ]}
                                    />

                                    <StrategyPillar
                                        title="5. ESTABILIDADE ECONÓMICA E ACESSO FINANCEIRO"
                                        points={[
                                            "Conta Jovem Angola: Conta bancária gratuita com cartão de débito (18-35 anos).",
                                            "Moeda Digital Nacional (Kwanza Digital): Para transações e salários transparentes.",
                                            "Bolsa de Estudos com Compromisso de Retorno: Financiamento com compromisso de trabalhar em Angola."
                                        ]}
                                    />

                                    <StrategyPillar
                                        title="6. PLATAFORMA DE INVESTIMENTO REMOTO – “INVEST ANGOLA HUB”"
                                        points={[
                                            "Portal com oportunidades de investimento em setores prioritários.",
                                            "Vistos rápidos para investidores e trabalhadores especializados.",
                                            "Condição: Min. 60% de contratação local com formação."
                                        ]}
                                    />

                                    <StrategyPillar
                                        title="7. GOVERNAÇÃO TRANSPARENTE E ANTI-CORRUPÇÃO"
                                        points={[
                                            "Portal da Transparência: Publicação online de contratos e financiamentos.",
                                            "Conselho Nacional da Juventude: Participação na monitoria das políticas públicas."
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Goals Table Section */}
                    <section className="mt-8">
                        <h3 className="text-xl font-black text-[#111] mb-6">Metas para 2030</h3>
                        <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Área</th>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Meta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { area: "Emprego Jovem", meta: "Absorver 1 milhão de jovens no mercado formal" },
                                        { area: "Empreendedorismo", meta: "Financiar 50.000 startups jovens" },
                                        { area: "Formação Técnica", meta: "Certificar 500.000 jovens em habilidades digitais e verdes" },
                                        { area: "Igualdade de Género", meta: "50% dos cargos de liderança em projetos ocupados por mulheres" },
                                        { area: "Estabilidade Financeira", meta: "Incluir 3 milhões de jovens no sistema financeiro formal" }
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4 text-xs font-bold text-[#111]">{row.area}</td>
                                            <td className="px-4 py-4 text-xs text-gray-600">{row.meta}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Final Section */}
                    <section className="mt-8 pb-20">
                        <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                            <h3 className="font-black text-[#00C853] mb-4">Financiamento</h3>
                            <p className="text-xs text-green-900 leading-relaxed mb-4">
                                Estratégias baseadas no Fundo Soberano de Angola, Parcerias Público-Privadas (PPP) e apoio de organizações internacionais como BAD, FMI e UE.
                            </p>
                            <div className="h-px bg-green-200/50 my-6"></div>
                            <p className="text-sm font-black text-center text-green-900 italic">
                                “De jovens desempregados a construtores da nova Angola.”
                            </p>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

const ProjectItem = ({ id, title, point, application }: { id: string, title: string, point: string, application: string[] }) => (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#00C853] bg-green-50 px-2 py-0.5 rounded border border-green-100">{id}</span>
            <h3 className="text-sm font-black uppercase tracking-widest text-[#111]">{title}</h3>
        </div>
        <div className="flex flex-col gap-4 pl-1">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ponto BP</p>
                <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-[#00C853] uppercase tracking-widest mb-2">Aplicação para Angola</p>
                <div className="space-y-2">
                    {application.map((line, i) => (
                        <p key={i} className={`text-sm text-gray-600 leading-relaxed ${i > 0 && line.startsWith('·') ? 'pl-4' : ''}`}>
                            {line}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const StrategyPillar = ({ title, points }: { title: string, points: string[] }) => (
    <div className="space-y-3">
        <h5 className="text-xs font-black text-white bg-white/5 border border-white/10 px-3 py-2 rounded-lg">{title}</h5>
        <ul className="space-y-2 pl-2">
            {points.map((p, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2 leading-relaxed">
                    <span className="text-[#00C853] shrink-0">•</span>
                    <span>{p}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default AboutBP;
