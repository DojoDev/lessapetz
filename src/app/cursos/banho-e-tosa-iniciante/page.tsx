import Link from "next/link";
import Footer from "@/presentation/components/Footer";
import { GetWhatsAppUrl } from "@/usecases/GetWhatsAppUrl";

export const metadata = {
  title: "Curso de Banho e Tosa Iniciante | Lessa Petz",
  description: "Formação profissionalizante completa na Lessa Petz. Aprenda banho, secagem, tosa higiênica e máquina com aulas práticas em modelos reais.",
};

export default function CourseDetailsPage() {
  const getWhatsAppUrl = new GetWhatsAppUrl();
  const whatsAppUrl = getWhatsAppUrl.executeForCourse("Curso de Banho e Tosa Iniciante", "2.400,00");

  const modules = [
    {
      title: "Módulo 1: Introdução & Comportamento Animal",
      duration: "10 horas",
      topics: [
        "Psicologia canina e felina aplicados ao banho e tosa.",
        "Leitura e interpretação da linguagem corporal do pet.",
        "Técnicas de contenção segura e manejo sem estresse.",
        "Saúde e segurança: identificação de lesões e zoonoses básicas.",
        "Uso correto de Equipamentos de Proteção Individual (EPIs)."
      ]
    },
    {
      title: "Módulo 2: Banho, Secagem e Preparação",
      duration: "20 horas",
      topics: [
        "Identificação de tipos de pelagem (curta, longa, dupla face, primitiva).",
        "Seleção e diluição de shampoos, condicionadores e máscaras de alta performance.",
        "Técnicas de lavagem profunda e remoção de odores.",
        "Processo de secagem eficiente utilizando soprador e secador profissional.",
        "Escovação correta, desembarço de nós e técnicas de rasqueamento."
      ]
    },
    {
      title: "Módulo 3: Higiene e Acabamento",
      duration: "20 horas",
      topics: [
        "Limpeza segura do conduto auditivo e técnicas de proteção.",
        "Corte de unhas e lixamento com segurança (anatomia da garra).",
        "Tosa higiênica passo a passo: coxins (patinhas), abdômen e região íntima.",
        "Limpeza de olhos e higienização facial.",
        "Uso de perfumes e finalizadores adequados."
      ]
    },
    {
      title: "Módulo 4: Tosa na Máquina & Introdução à Tesoura",
      duration: "25 horas",
      topics: [
        "Manuseio seguro, ergonomia e manutenção de máquinas de tosa.",
        "Estudo de lâminas (alturas, cuidados, aquecimento) e adaptadores.",
        "Tosa geral na máquina e técnicas de marcação de saia.",
        "Introdução prática ao uso de tesouras (retas e dentadas).",
        "Ajustes de acabamento e transições suaves de pelagem."
      ]
    },
    {
      title: "Módulo 5: Gestão, Empreendedorismo & Atendimento",
      duration: "5 horas",
      topics: [
        "Postura profissional, ética e comunicação com tutores.",
        "Precificação correta de banhos, tosas e tratamentos.",
        "Estrutura básica de um pet shop / centro de estética pet de sucesso.",
        "Gestão de agenda e redução de faltas.",
        "Técnicas de fotografia e marketing digital para divulgar seu trabalho."
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
              Curso de Banho e Tosa Iniciante
            </h1>
            <p className="mt-2 text-stone-200 text-xs sm:text-sm md:text-base font-light leading-relaxed">
              O caminho completo para iniciar na área que mais cresce no Brasil. Aprenda com quem é referência de mercado e conquiste sua independência financeira.
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
                O **Curso de Banho e Tosa Iniciante da Lessa Petz** foi desenhado especificamente para quem deseja começar do absoluto zero. Não é necessário nenhum conhecimento prévio no trato animal. Nossa metodologia prática de ensino garante que você ganhe confiança e habilidade técnica desde as primeiras aulas.
              </p>
              <p className="font-sans text-stone-600 text-sm sm:text-base font-light leading-relaxed">
                Você terá contato direto com todos os equipamentos de estética pet modernos, sob a supervisão constante de instrutores altamente qualificados e com ampla experiência em salão. Ao final do curso, você estará totalmente apto a trabalhar como banhista e auxiliar de tosa em pet shops, clínicas veterinárias, ou montar o seu próprio estúdio.
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
                    R$ 2.400,00
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
                      📅 <strong>Semana:</strong> Terça e Quinta (13h30 às 17h30)<br/>
                      📅 <strong>Sábado:</strong> Intensivo (09h00 às 17h00)
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
