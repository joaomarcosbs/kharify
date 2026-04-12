import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kharify - Faça Login",
  description: "Plataforma SaaS Kharify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={lora.variable} suppressHydrationWarning>
      <body className="font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
