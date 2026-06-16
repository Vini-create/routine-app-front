import type { Metadata } from "next";
import Script from "next/script";
import { LanguageProvider } from "@/components/app/LanguageProvider";
import { ThemeProvider } from "@/components/app/ThemeProvider";
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
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="winperium-theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=(localStorage.getItem('winperium-theme')||localStorage.getItem('alfred-theme'))==='light'?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark';}",
          }}
        />
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
