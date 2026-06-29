import type { Metadata } from "next";
import { LanguageProvider } from "@/components/app/LanguageProvider";
import { ThemeProvider } from "@/components/app/ThemeProvider";
import { defaultLanguage } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Winperium",
  description: "AI-powered personal performance system with Alfred.",
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
      <body className="min-h-full flex flex-col">
        <ThemeProvider initialTheme="dark">
          <LanguageProvider initialLanguage={defaultLanguage}>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
