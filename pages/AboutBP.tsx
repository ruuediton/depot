
import React from 'react';

interface Props {
    onNavigate: (page: any) => void;
}

const CompanyProfile: React.FC<Props> = ({ onNavigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-[#FF6B00] text-black font-sans antialiased">
            {/* Header */}
            <header className="bg-[#FF6B00] sticky top-0 z-30">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('profile')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors active:scale-95"
                    >
                        <span className="material-symbols-outlined text-white text-[24px]">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-white tracking-tight text-center flex-1 lowercase">perfil de companhia</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 no-scrollbar">
                <div className="bg-[#FFF5EE] rounded-[32px] p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-[#111] mb-6 tracking-tight">perfil de companhia</h2>

                    <div className="text-[14px] text-gray-800 leading-relaxed space-y-6 font-medium">
                        <p>
                            A Home Depot é a maior varejista de materiais de construção e reforma residencial do mundo, com sede em Atlanta, Geórgia, EUA. Fundada em 1978, fornece materiais de construção, artigos de decoração, produtos para gramados e jardins, e atende clientes DIY (faça você mesmo), contratação de terceiros (DIFM) e profissionais. Seus negócios abrangem os Estados Unidos, Canadá e México. É uma ação componente do Índice Dow Jones. Com o slogan "Você consegue, nós podemos ajudar", é um dos gigantes do varejo global. A empresa lançará oficialmente vários projetos específicos no USDT em 2024. A plataforma foi lançada oficialmente hoje, 20 de dezembro de 2025.
                        </p>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[#111] border-l-4 border-[#FF6B00] pl-3">Perfil da empresa</h3>
                            <ul className="space-y-2">
                                <li><strong className="text-black font-bold">Nome:</strong> The Home Depot, Inc. (Home Depot).</li>
                                <li><strong className="text-black font-bold">Sede:</strong> Atlanta, Geórgia, EUA.</li>
                                <li><strong className="text-black font-bold">Fundada:</strong> 1978.</li>
                                <li><strong className="text-black font-bold">Negócio principal:</strong> venda de uma variedade de materiais de construção, produtos de reforma residencial, ferramentas, suprimentos para gramados e jardins e fornecimento de serviços de instalação e aluguel.</li>
                                <li><strong className="text-black font-bold">Grupos de clientes:</strong> consumidores de bricolagem, proprietários de casas que precisam contratar profissionais (DIFM), empreiteiros profissionais e empresários.</li>
                                <li><strong className="text-black font-bold">Mercado:</strong> O maior varejista de construção do mundo, com negócios abrangendo os Estados Unidos, Canadá e México, e uma forte plataforma de comércio eletrônico.</li>
                                <li><strong className="text-black font-bold">Escala:</strong> Milhares de grandes shopping centers, centenas de milhares de funcionários.</li>
                                <li><strong className="text-black font-bold">Listagem:</strong> O código de ações HD, listado na Bolsa de Valores de Nova York, é um componente do Índice Dow Jones e do Índice S&P 500.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[#111] border-l-4 border-[#FF6B00] pl-3">Características principais</h3>
                            <div className="space-y-4">
                                <div>
                                    <strong className="text-black font-bold block mb-1 uppercase text-xs tracking-widest text-[#FF6B00]">Compra completa</strong>
                                    <p>Comprometida em fornecer produtos abrangentes e diversificados para atender a todas as necessidades dos clientes em projetos de reforma residencial.</p>
                                </div>
                                <div>
                                    <strong className="text-black font-bold block mb-1 uppercase text-xs tracking-widest text-[#FF6B00]">Serviços diversificados</strong>
                                    <p>Além de produtos, também fornece serviços de valor agregado, como serviços de instalação, aluguel de ferramentas e seminários de habilidades.</p>
                                </div>
                                <div>
                                    <strong className="text-black font-bold block mb-1 uppercase text-xs tracking-widest text-[#FF6B00]">Forte influência da marca</strong>
                                    <p>Com sua extensa rede de lojas, produtos e serviços profissionais, tornou-se líder no campo global de decoração de casa.</p>
                                </div>
                            </div>
                        </div>

                        <p className="bg-white/50 p-4 rounded-2xl border border-[#FF6B00]/10 italic text-gray-700">
                            A Home Depot usa laranja claro (PMS 165, CMYK 60M100Y) como cor corporativa e a utiliza em sinalização, equipamentos e roupas de funcionários.
                            Desde 2003, a Home Depot usa o slogan publicitário "Você consegue. Nós podemos ajudar". Nos últimos 25 anos, a Home Depot adotou "The Home Depot, os preços baixos são apenas o começo" (início da década de 1990), "Quando você estiver na Home Depot, você se sentirá em casa" (final da década de 1990) e "The Home Depot: First In Home! Melhoria!, 1999-2003) para atrair clientes.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompanyProfile;
