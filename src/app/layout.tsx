import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="pt-BR" className={`${plusJakartaSans.variable} ${outfit.variable} scroll-smooth`}>
      <body className="font-sans bg-brand-cream text-stone-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
