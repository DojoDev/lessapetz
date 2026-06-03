import Link from "next/link";
import { Service } from "@/domain/entities/Service";
import { Course } from "@/domain/entities/Course";

interface CardItemProps {
  item: Service | Course;
  type: "service" | "course";
  whatsAppUrl: string;
}

export default function CardItem({ item, type, whatsAppUrl }: CardItemProps) {
  const isCourse = type === "course";
  const courseItem = item as Course;

  return (
    <div className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white border border-brand-gold/15 hover:border-brand-gold/45 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 overflow-hidden">
      {/* Background soft gradient decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      
      <div>
        {/* Category & Metadata Headers */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-burgundy/5 text-brand-burgundy border border-brand-burgundy/10">
            {item.category}
          </span>
          
          {isCourse && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              courseItem.level === "Iniciante" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : courseItem.level === "Intermediário"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              {courseItem.level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-brand-burgundy transition-colors duration-300 mb-2 leading-snug">
          {item.title}
        </h3>

        {/* Description */}
        <p className="font-sans text-stone-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
          {item.description}
        </p>

        {/* Details Row */}
        <div className="flex flex-wrap items-center gap-y-3 gap-x-4 mb-6 border-t border-dashed border-stone-200 pt-4">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-stone-500 text-xs sm:text-sm">
            <svg className="w-4 h-4 text-brand-gold stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Duração: <strong>{item.duration}</strong></span>
          </div>

          {/* Certificate for courses */}
          {isCourse && courseItem.certificate && (
            <div className="w-full flex items-start gap-1.5 text-stone-500 text-xs sm:text-sm">
              <svg className="w-4 h-4 text-brand-gold shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="leading-tight">{courseItem.certificate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price & Action Button Footer */}
      <div className="mt-auto">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {isCourse ? "Investimento" : "Valor do Serviço"}
          </span>
          <div className="text-right">
            <span className={`font-serif font-bold text-brand-burgundy ${
              item.price.toLowerCase().includes("consultar") 
                ? "text-lg sm:text-xl" 
                : "text-2xl"
            }`}>
              {(() => {
                const lowerPrice = item.price.toLowerCase();
                if (lowerPrice.includes("consultar")) {
                  return item.price;
                }
                if (lowerPrice.includes("a partir")) {
                  if (!item.price.includes("R$")) {
                    return item.price.replace(/a partir de\s*/i, "A partir de R$ ");
                  }
                  return item.price;
                }
                if (item.price.includes("R$")) {
                  return item.price;
                }
                return `R$ ${item.price}`;
              })()}
            </span>
          </div>
        </div>

        {/* Dynamic WhatsApp checkout link / Detail page link */}
        {isCourse ? (
          <Link
            href="/cursos/banho-e-tosa-iniciante"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all duration-300 bg-brand-burgundy hover:bg-brand-burgundy-light text-white hover:shadow-brand-burgundy/15 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Ver Detalhes do Curso</span>
          </Link>
        ) : (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all duration-300 bg-brand-gold hover:bg-brand-gold-dark text-white hover:shadow-brand-gold/15 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Agendar via WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
