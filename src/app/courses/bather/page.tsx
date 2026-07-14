import Header from "@/presentation/components/Header";
import Footer from "@/presentation/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Curso Banhista 499 - Lessa Petz",
  description: "Transforme sua paixão por pets em uma profissão altamente lucrativa com o Curso Banhista 499.",
};

export default function Banhista499Page() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans text-stone-800">
      <Header hideBookingButton={true} />
      
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-500 to-orange-400 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-orange-800/40 text-orange-50 font-semibold text-sm backdrop-blur-sm border border-orange-300/30 mb-2">
                🚀 Vagas Abertas - Nova Turma
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Transforme sua Paixão por Pets em uma <span className="text-stone-900 bg-amber-300 px-2 rounded-md inline-block mt-2 md:mt-0 shadow-sm">Profissão Lucrativa</span>
              </h1>
              <p className="text-lg md:text-xl text-orange-50 font-medium max-w-2xl leading-relaxed">
                O método definitivo e prático para você começar do zero, dominar as técnicas de banho e faturar alto no mercado pet que não para de crescer.
              </p>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  href="#oferta" 
                  className="bg-stone-900 text-white hover:bg-stone-800 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-stone-900/20 text-center flex items-center justify-center gap-2 group"
                >
                  Quero Garantir Minha Vaga
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <div className="flex items-center justify-center gap-2 text-sm text-orange-100 font-medium">
                  <svg className="w-5 h-5 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Garantia de 7 dias
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-orange-100 rounded-3xl rotate-3 scale-105 opacity-80 shadow-2xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl text-stone-800 border border-stone-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full -z-10"></div>
                <h3 className="text-2xl font-bold mb-2">Oferta Especial</h3>
                <div className="text-stone-500 mb-6 font-medium">Acesso completo ao curso prático</div>
                
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-orange-600">R$499</span>
                  <span className="text-stone-400 font-semibold mb-1 line-through">R$997</span>
                </div>
                <p className="text-sm text-stone-500 font-medium mb-8">ou em até 12x no cartão de crédito</p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Aulas 100% práticas e diretas",
                    "Certificado de Conclusão",
                    "Material de apoio exclusivo",
                    "Suporte direto com professores"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 font-medium text-stone-700">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="#oferta" 
                  className="block w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1"
                >
                  Inscreva-se Agora
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PAIN POINTS SECTION */}
        <section className="py-20 bg-stone-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-stone-800">
              Você ama animais, mas a sua realidade atual é esta?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Trabalho Exaustivo",
                  desc: "Está preso em um emprego que não valoriza você e não te traz felicidade."
                },
                {
                  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Falta de Dinheiro",
                  desc: "Quer uma nova fonte de renda rápida, sem precisar passar 4 anos em uma faculdade."
                },
                {
                  icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Insegurança",
                  desc: "Tem medo de investir alto em um curso longo e demorar para ter o retorno do seu dinheiro."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-stone-800">{item.title}</h4>
                  <p className="text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 bg-white p-8 rounded-2xl border-l-4 border-orange-500 shadow-sm text-left max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">A boa notícia? O Mercado Pet é a Solução.</h3>
                <p className="text-stone-600 font-medium">
                  Enquanto outros setores sofrem crises, o mercado pet cresce a cada ano. E a demanda por <strong className="text-orange-600">Banhistas Profissionais Qualificados</strong> é enorme. Faltam profissionais no mercado!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COURSE MODULES */}
        <section className="py-24 bg-white relative">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-orange-500 font-bold uppercase tracking-wider text-sm">O que você vai aprender</span>
              <h2 className="text-3xl md:text-5xl font-bold mt-2 text-stone-800">
                O Passo a Passo Para a Excelência
              </h2>
              <p className="text-stone-500 mt-4 max-w-2xl mx-auto text-lg">
                Esquecemos a teoria chata. Nosso foco é a prática real do dia a dia do banho e tosa para você sair pronto para o mercado.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Módulo 1: A Base do Sucesso",
                  desc: "Aprenda a receber o pet, contenção segura, comportamento animal e biossegurança. O que diferencia um amador de um profissional.",
                  color: "bg-blue-50 text-blue-600 border-blue-200"
                },
                {
                  title: "Módulo 2: Preparação Perfeita",
                  desc: "Técnicas de escovação sem dor, desembolo eficiente e identificação dos diferentes tipos de pelagem.",
                  color: "bg-purple-50 text-purple-600 border-purple-200"
                },
                {
                  title: "Módulo 3: O Banho Especialista",
                  desc: "Temperatura ideal, escolha dos cosméticos certos, técnicas de lavagem profunda e proteção dos ouvidos.",
                  color: "bg-emerald-50 text-emerald-600 border-emerald-200"
                },
                {
                  title: "Módulo 4: Finalização Impecável",
                  desc: "Secagem rápida e segura, limpeza técnica de ouvidos, corte de unhas com segurança e a entrega que encanta o cliente.",
                  color: "bg-pink-50 text-pink-600 border-pink-200"
                }
              ].map((mod, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl border border-stone-100 hover:border-orange-200 hover:shadow-lg transition-all group bg-white">
                  <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-black text-2xl border ${mod.color}`}>
                    0{i+1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">{mod.title}</h3>
                    <p className="text-stone-500 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / PRICING SECTION */}
        <section id="oferta" className="py-24 bg-stone-900 text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-600/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-600/20 blur-3xl"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Chegou a Sua Hora de Começar
            </h2>
            <p className="text-xl text-stone-300 mb-12 max-w-2xl mx-auto">
              Garanta sua vaga hoje e dê o primeiro passo para a sua nova e lucrativa profissão no mercado pet.
            </p>
            
            <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-3xl p-8 md:p-12 border border-stone-700 max-w-2xl mx-auto shadow-2xl relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg">
                Melhor Custo-Benefício
              </div>
              
              <h3 className="text-3xl font-bold mb-2">Curso Banhista 499</h3>
              <p className="text-stone-400 mb-8">Formação Completa em Banhista Pet</p>
              
              <div className="flex flex-col items-center justify-center mb-10">
                <span className="text-stone-400 line-through text-xl font-semibold mb-1">De R$ 997,00</span>
                <div className="flex items-start gap-2">
                  <span className="text-2xl font-bold text-orange-400 mt-2">R$</span>
                  <span className="text-7xl font-black text-white">499</span>
                  <span className="text-xl font-bold text-stone-400 mt-8">,00</span>
                </div>
                <span className="text-orange-400 font-medium mt-2">à vista ou em até 12x no cartão</span>
              </div>
              
              <button className="w-full bg-orange-500 hover:bg-orange-400 text-stone-900 font-black text-xl py-5 rounded-xl shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all transform hover:scale-105 active:scale-95 mb-6">
                QUERO ME INSCREVER AGORA
              </button>
              
              <div className="flex items-center justify-center gap-3 text-stone-400">
                <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium text-sm">Pagamento 100% Seguro</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* GUARANTEE SECTION */}
        <section className="py-20 bg-amber-50">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-amber-200">
              <svg className="w-16 h-16 md:w-24 md:h-24 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4 text-stone-800">Garantia Incondicional de 7 Dias</h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                Temos tanta confiança na qualidade do nosso curso que oferecemos risco zero para você. Se em até 7 dias você achar que o Curso Banhista 499 não é para você, devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
