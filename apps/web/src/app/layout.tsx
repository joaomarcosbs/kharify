import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalLoadingOverlay } from "@/components/global-loading-overlay";
import { Toaster } from "sonner";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kharify",
  description: "Plataforma SaaS Kharify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={lora.variable} suppressHydrationWarning>
      <body className="font-sans antialiased transition-colors duration-200 bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <GlobalLoadingOverlay />
          <Toaster richColors position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

