import type { Metadata } from "next";
import { LanguageProvider } from "@/components/app/LanguageProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rotina AI",
  description: "Intelligent personal routine copilot.",
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
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
