import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lessa Petz | Escola de Banho e Tosa & Estética Pet",
  description: "Especialistas em estética pet de alto padrão e cursos profissionalizantes de banho e tosa para quem exige o melhor!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans bg-brand-cream text-stone-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
