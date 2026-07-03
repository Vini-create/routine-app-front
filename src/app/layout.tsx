import type { Metadata } from "next";
import {
  Antonio,
  Cormorant_Garamond,
  Manrope,
  Roboto_Condensed,
  Special_Elite,
} from "next/font/google";
import { LanguageProvider } from "@/components/app/LanguageProvider";
import { ThemeProvider } from "@/components/app/ThemeProvider";
import { AppProviders } from "@/components/app/AppProviders";
import { permanentMarker } from "@/lib/fonts";
import { defaultLanguage } from "@/lib/i18n";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

const antonio = Antonio({
  subsets: ["latin"],
  variable: "--font-antonio",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-special-elite",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Winperium — Transforme seus sonhos em metas",
    template: "%s | Winperium",
  },
  description: "Organize sua rotina, estruture hábitos e transforme metas em progresso com o Winperium.",
  openGraph: {
    title: "Winperium — Transforme seus sonhos em metas",
    description: "Um sistema completo para organizar sua rotina, estruturar hábitos e transformar metas em progresso.",
    type: "website",
    locale: "pt_BR",
    siteName: "Winperium",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLanguage}
      data-theme="dark"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className={`${robotoCondensed.variable} ${antonio.variable} ${manrope.variable} ${cormorant.variable} ${specialElite.variable} ${permanentMarker.variable} min-h-full flex flex-col`}>
        <ThemeProvider initialTheme="dark">
          <LanguageProvider initialLanguage={defaultLanguage}>
            <AppProviders>{children}</AppProviders>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
