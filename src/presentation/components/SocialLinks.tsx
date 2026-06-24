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

    </div>
  );
}
