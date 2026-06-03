import { GetWhatsAppUrl } from "@/usecases/GetWhatsAppUrl";

export default function SocialLinks() {
  const getWhatsAppUrl = new GetWhatsAppUrl();
  const whatsAppUrl = getWhatsAppUrl.executeGeneralContact();
  
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/lessapetz";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/lessapetz";
  const mapsUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || "https://maps.google.com";

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-12 flex flex-col items-center gap-6 animate-slide-up">
      {/* Social Media Link Icons Row */}
      <div className="flex justify-center items-center gap-4">
        {/* Instagram Link */}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Acessar Instagram da Lessa Petz"
          className="w-12 h-12 rounded-full border border-brand-gold/30 bg-white flex items-center justify-center text-brand-burgundy hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-red-500 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
        </a>

        {/* Facebook Link */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Acessar Facebook da Lessa Petz"
          className="w-12 h-12 rounded-full border border-brand-gold/30 bg-white flex items-center justify-center text-brand-burgundy hover:text-white hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        {/* Google Maps Link */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Localização da Lessa Petz no Google Maps"
          className="w-12 h-12 rounded-full border border-brand-gold/30 bg-white flex items-center justify-center text-brand-burgundy hover:text-white hover:bg-brand-burgundy transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
        >
          <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25gC4.5 6.358 7.858 3 12 3c4.142 0 7.5 3.358 7.5 7.5z" />
          </svg>
        </a>
      </div>

      {/* Prominent Call to Action WhatsApp Link */}
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-sans font-semibold text-base shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-emerald-400/20 group"
      >
        <svg className="w-6 h-6 fill-current animate-pulse group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.99C16.656 1.876 14.179.845 11.54.845 6.105.845 1.68 5.265 1.677 10.702c-.001 1.758.463 3.475 1.343 5.02L2.016 22.04l6.4-1.68c1.51.823 3.1 1.258 4.63 1.258zm12.386-8.236c-.328-.164-1.94-.959-2.241-1.07-.301-.11-.52-.164-.739.164-.219.328-.847 1.07-1.038 1.29-.19.219-.38.246-.708.082-.328-.164-1.386-.51-2.64-1.627-.977-.872-1.636-1.949-1.828-2.277-.193-.328-.02-.505.143-.668.147-.147.328-.383.493-.575.164-.19.219-.328.328-.547.11-.219.055-.411-.027-.575-.082-.164-.739-1.78-.101-2.267.301-.301.629-.328.959-.328.328 0 .656.027.903.082.328.164.847.466.959.847.11.381.11.712.055.875-.055.164-.219.274-.547.438-1.56 1.03-2.642 2.37-3.036 2.918-.394.547-1.448 2.056-.411 3.51.493.685 1.068 1.123 1.642 1.396.574.274 1.12.355 1.532.296.463-.067 1.42-.58 1.619-1.14.2-.56.2-1.04.14-1.14-.06-.1-.219-.164-.547-.328z" />
        </svg>
        <span>Fale Conosco no WhatsApp</span>
      </a>
    </div>
  );
}
