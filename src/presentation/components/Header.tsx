import Image from "next/image";

interface HeaderProps {
  hideBookingButton?: boolean;
}

export default function Header({ hideBookingButton = false }: HeaderProps) {
  return (
    <header className="relative w-full">
      {/* Hero Banner Section */}
      <div className="relative h-64 sm:h-80 md:h-[400px] w-full overflow-hidden bg-brand-burgundy-dark">
        {/* Parallax-style background image */}
        <div className="absolute inset-0 select-none">
          <Image
            src="/assets/spa_dog.png"
            alt="Pet Grooming Spa Background"
            fill
            priority
            className="object-cover opacity-60 scale-105 transition-transform duration-[10s] hover:scale-100"
          />
        </div>
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-burgundy-dark via-brand-burgundy/40 to-transparent" />
      </div>

      {/* Brand Profile Details Card (Overlapping Banner) */}
      <div className="relative max-w-4xl mx-auto px-4 -mt-20 sm:-mt-24 pb-8 text-center">
        <div className="inline-block relative">
          {/* Circular Brand Badge */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-brand-cream border-4 border-brand-gold shadow-xl overflow-hidden inline-flex items-center justify-center">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img
                src="/assets/logo.jpg?v=3"
                alt="Lessa Petz Logo"
                className="object-contain p-2 w-full h-full"
              />
            </div>
          </div>
          {/* Subtle micro-animation paw-print floating badge */}
          <span className="absolute bottom-2 right-2 bg-brand-gold text-brand-burgundy w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-brand-cream animate-bounce">
            🐾
          </span>
        </div>

        {/* Brand Information */}
        <div className="mt-4 animate-fade-in">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-burgundy tracking-wide uppercase">
            Lessa Petz
          </h1>
          <p className="font-sans text-xs sm:text-sm md:text-base font-semibold tracking-widest text-brand-gold-dark uppercase mt-1">
            Escola de Banho e Tosa &amp; Estética Pet
          </p>
          
          <div className="w-16 h-0.5 bg-brand-gold mx-auto my-4" />
          
          <p className="max-w-2xl mx-auto font-sans text-stone-600 text-sm sm:text-base leading-relaxed font-light">
            Especialistas em estética pet de alto padrão para quem exige o melhor, e formação profissionalizantes de profissionais líderes de mercado. 💎
          </p>

          {!hideBookingButton && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/agendamento"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-brand-burgundy hover:bg-brand-burgundy-light rounded-full shadow-lg shadow-brand-burgundy/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Agendar Horário / Cadastrar
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
