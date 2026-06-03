import Image from "next/image";

export default function Footer() {
  const addressText = process.env.NEXT_PUBLIC_ADDRESS_TEXT || "Av. Exemplo de Teste, 1000 - Centro, Paulínia - SP";
  const mapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || "https://maps.google.com";
  const openingHours = process.env.NEXT_PUBLIC_OPENING_HOURS || "Segunda a Sábado - 08:00 às 18:00";
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5519999999999";
  
  // Format WhatsApp number for display: +55 (19) 99999-9999 (assuming standard BR phone pattern)
  const formattedPhone = rawNumber.length === 13 
    ? `+${rawNumber.slice(0, 2)} (${rawNumber.slice(2, 4)}) ${rawNumber.slice(4, 9)}-${rawNumber.slice(9)}`
    : rawNumber;

  return (
    <footer className="w-full bg-brand-burgundy-dark text-white border-t-2 border-brand-gold mt-auto select-none font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left Column: Brand & Logo */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1">
              <img
                src="/assets/logo.jpg?v=3"
                alt="Lessa Petz Logo"
                className="object-contain p-1 w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-wider text-brand-gold-light uppercase">Lessa Petz</span>
              <span className="text-[10px] text-stone-300 font-semibold uppercase tracking-widest">Escola &amp; Estética Pet</span>
            </div>
          </div>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-xs">
            Formando profissionais de excelência e oferecendo serviços de estética pet com padrões de qualidade internacionais.
          </p>
        </div>

        {/* Middle Column: Hours of Operation */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <h4 className="font-serif font-bold text-base tracking-wide text-brand-gold-light">
            Horário de Funcionamento
          </h4>
          <div className="w-8 h-0.5 bg-brand-gold" />
          <div className="flex items-start gap-2.5 mt-2">
            <svg className="w-5 h-5 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-stone-200">{openingHours}</span>
              <span className="text-[11px] text-stone-400 font-light">Atendimento presencial e suporte online</span>
            </div>
          </div>
        </div>

        {/* Right Column: Location & Contact */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <h4 className="font-serif font-bold text-base tracking-wide text-brand-gold-light">
            Contato &amp; Localização
          </h4>
          <div className="w-8 h-0.5 bg-brand-gold" />
          
          <div className="flex flex-col gap-3 mt-2">
            {/* Address Link */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 group text-stone-200 hover:text-brand-gold-light transition-colors text-left"
            >
              <svg className="w-5 h-5 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-xs sm:text-sm font-light leading-snug group-hover:underline">
                {addressText}
              </span>
            </a>

            {/* Phone */}
            <div className="flex items-center gap-2.5 text-stone-200">
              <svg className="w-5 h-5 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-xs sm:text-sm font-light">
                {formattedPhone}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright bar */}
      <div className="w-full bg-brand-burgundy-dark/50 border-t border-brand-gold/10 py-6 text-center text-[11px] sm:text-xs text-stone-400 font-light px-4">
        <p>&copy; {new Date().getFullYear()} Lessa Petz. Todos os direitos reservados. Escola de Banho e Tosa e Estética Animal de Alto Padrão.</p>
      </div>
    </footer>
  );
}
