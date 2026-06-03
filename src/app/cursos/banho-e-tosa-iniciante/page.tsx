import Link from "next/link";
import Footer from "@/presentation/components/Footer";
import { GetWhatsAppUrl } from "@/usecases/GetWhatsAppUrl";

export const metadata = {
  title: "Curso Profissional de Banho e Tosa | Lessa Petz",
  description: "Aprenda na prática as principais técnicas de banho e tosa para cuidar dos pets com segurança, carinho e profissionalismo. Um curso completo ministrado por uma Médica Veterinária.",
};

export default function CourseDetailsPage() {
  const getWhatsAppUrl = new GetWhatsAppUrl();
  const whatsAppUrl = getWhatsAppUrl.executeForCourse("Curso Profissional de Banho e Tosa", "1.500,00");

  const modules = [
    {
      title: "Módulo 1: Técnicas de Banho e Preparação",
      duration: "30 horas",
      topics: [
        "Organização do ambiente, higiene e segurança no atendimento.",
        "Manejo correto dos animais e comportamento pet.",
        "Técnicas profissionais de banho para diferentes raças e tipos de pelagem.",
        "Escolha correta de shampoos, condicionadores e produtos específicos.",
        "Cuidados com animais com pele sensível, problemas dermatológicos, pulgas e carrapatos.",
        "Secagem, escovação e desembolo da pelagem."
      ]
    },
    {
      title: "Módulo 2: Módulo Completo de Tosas",
      duration: "40 horas",
      topics: [
        "Introdução às principais técnicas de tosa profissional.",
        "Tosa higiênica e sua importância para a saúde do pet.",
        "Tosa na máquina e acabamento com tesoura.",
        "Tosa bebê e estilos mais procurados pelos tutores.",
        "Tosas específicas conforme raça e tipo de pelagem.",
        "Uso correto das máquinas de tosa com fio e sem fio.",
        "Conhecimento sobre lâminas, numerações, alturas de corte e adaptadores.",
        "Como escolher a lâmina ideal para cada procedimento.",
        "Cuidados para evitar falhas, irritações e acidentes durante a tosa.",
        "Finalização e acabamento profissional."
      ]
    },
    {
      title: "Módulo 3: Procedimentos de Higiene e Cuidados Especiais",
      duration: "10 horas",
      topics: [
        "Corte correto das unhas, identificando a área sensível e evitando sangramentos.",
        "Higienização dos ouvidos.",
        "Cuidados essenciais para oferecer conforto e segurança aos pets."
      ]
    }
  ];

  const differentials = [
    {
      title: "Prática em Modelos Reais",
      description: "Aulas dinâmicas onde você realiza os procedimentos em cães reais sob supervisão, simulando a rotina real de trabalho."
    },
    {
      title: "Material Incluso",
      description: "A escola fornece todo o material consumível (shampoos, toalhas) e maquinários para uso durante as aulas, sem necessidade de compra prévia."
    },
    {
      title: "Metodologia Exclusiva",
      description: "Foco no respeito animal e bem-estar, com técnicas modernas de estética pet que garantem segurança e qualidade na entrega."
    },
    {
      title: "Indicação ao Mercado",
      description: "Alunos com excelente desempenho são recomendados diretamente para a rede de pet shops parceiros da região."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-stone-800">
      {/* Top Navbar / Navigation */}
      <nav className="w-full bg-white border-b border-brand-gold/15 py-4 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-stone-600 hover:text-brand-burgundy transition-colors">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold tracking-wide font-sans">Voltar para o Início</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-brand-gold/30">
              <img
                src="/assets/logo.jpg?v=3"
                alt="Lessa Petz Logo"
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-serif font-bold text-sm tracking-wider text-brand-burgundy uppercase">Lessa Petz</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 animate-fade-in select-none">
        
        {/* Banner Section with overlay info */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl mb-10 h-64 sm:h-80 md:h-96 w-full bg-brand-burgundy-dark">
          <img
            src="/assets/spa_dog.png"
            alt="Curso de Banho e Tosa"
            className="absolute inset-0 w-full h-full object-cover opacity-50 select-none scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy-dark via-brand-burgundy/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white max-w-3xl">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-brand-gold text-brand-burgundy-dark shadow-md mb-3 border border-brand-gold-light/20">
              Formação Profissionalizante
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide uppercase leading-tight">
              Curso Profissional de Banho e Tosa
            </h1>
            <p className="mt-2 text-stone-200 text-xs sm:text-sm md:text-base font-light leading-relaxed">
              Aprenda na prática as principais técnicas de banho e tosa para cuidar dos pets com segurança, carinho e profissionalismo. Um curso completo ministrado por uma Médica Veterinária.
            </p>
          </div>
        </div>

        {/* Dynamic Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          
          {/* Left Column: Course details and modules */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Overview / Introduction Section */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-gold/15 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy mb-4 border-b border-brand-gold/15 pb-3">
                Sobre o Curso
              </h2>
              <p className="font-sans text-stone-600 text-sm sm:text-base font-light leading-relaxed mb-4">
                O **Curso Profissional de Banho e Tosa – Lessa Petz** é ideal para quem deseja começar na área pet, aperfeiçoar seus conhecimentos ou transformar o amor pelos animais em uma nova profissão. Aprenda na prática as principais técnicas de banho e tosa para cuidar dos pets com segurança, carinho e profissionalismo.
              </p>
              <p className="font-sans text-stone-600 text-sm sm:text-base font-light leading-relaxed mb-4">
                O curso será ministrado por uma **Médica Veterinária**, trazendo uma visão diferenciada que une estética, saúde, bem-estar animal e cuidados profissionais no dia a dia do banho e tosa.
              </p>
              <p className="font-sans text-stone-600 text-sm sm:text-base font-light leading-relaxed">
                Mais do que deixar o pet bonito, você aprenderá a trabalhar respeitando a saúde, o comportamento e o bem-estar de cada animal. Aprenda com uma Médica Veterinária e dê o primeiro passo para entrar no mercado pet com confiança!
              </p>
            </div>

            {/* Curriculum Accordion Modules */}
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy mb-6 border-b border-brand-gold/15 pb-3">
                Conteúdo Programático
              </h2>
              
              <div className="flex flex-col gap-4">
                {modules.map((mod, index) => (
                  <details
                    key={index}
                    className="group glass-panel rounded-2xl border border-brand-gold/15 shadow-sm overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-5 cursor-pointer font-serif font-bold text-sm sm:text-base text-stone-900 hover:text-brand-burgundy transition-colors list-none select-none">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-brand-burgundy/10 text-brand-burgundy font-sans text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="leading-tight">{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-500 rounded-lg font-sans">
                          {mod.duration}
                        </span>
                        <svg className="w-5 h-5 text-brand-gold transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>
                    <div className="px-5 pb-5 pt-1 border-t border-dashed border-stone-200 bg-brand-cream/30">
                      <ul className="flex flex-col gap-2.5 mt-2">
                        {mod.topics.map((topic, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600 font-sans font-light">
                            <span className="text-brand-gold mt-1 text-sm">🐾</span>
                            <span className="leading-relaxed">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Differentials / Why Choose Us */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-gold/15 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy mb-6 border-b border-brand-gold/15 pb-3">
                Diferenciais Lessa Petz
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {differentials.map((diff, index) => (
                  <div key={index} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-brand-cream-dark/30 border border-brand-gold/10">
                    <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      <span className="text-brand-gold">⭐</span> {diff.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                      {diff.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Pricing & Action Details Card */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-gold/20 shadow-lg sticky top-24 flex flex-col gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Investimento Completo
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-burgundy">
                    R$ 1.500,00
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-sans mt-1">
                  💳 Em até 10x sem juros no cartão de crédito
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold font-sans mt-0.5">
                  💵 Desconto de 10% para pagamento à vista (Pix/Dinheiro)
                </p>
              </div>

              <div className="border-t border-dashed border-stone-200 pt-5 flex flex-col gap-4">
                {/* Hours */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-stone-900 uppercase tracking-wide">Carga Horária</span>
                    <span className="text-xs sm:text-sm text-stone-600 font-light">80 horas-aula práticas</span>
                  </div>
                </div>

                {/* Certificate */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-stone-900 uppercase tracking-wide">Certificação</span>
                    <span className="text-xs sm:text-sm text-stone-600 font-light leading-snug">Certificado com Selo de Excelência Lessa Petz</span>
                  </div>
                </div>

                {/* Schedule Options */}
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-stone-900 uppercase tracking-wide">Opções de Turmas</span>
                    <span className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                      📅 <strong>Aula noturna:</strong> Segunda a sexta das 18h30 às 21h00
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Booking CTA */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-sm shadow-md transition-all duration-300 bg-brand-burgundy hover:bg-brand-burgundy-light text-white hover:shadow-brand-burgundy/15 hover:scale-[1.02] active:scale-[0.98] mt-2 animate-pulse"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>Garantir Vaga via WhatsApp</span>
              </a>
              
              <p className="text-[10px] text-stone-400 font-light font-sans text-center leading-normal">
                Vagas limitadas por turma para garantir a qualidade do aprendizado prático de cada aluno. 🐾
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
