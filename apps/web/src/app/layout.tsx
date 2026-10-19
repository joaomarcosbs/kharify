import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalLoadingOverlay } from "@/components/global-loading-overlay";
import { AuthTokenMigration } from "@/components/auth-token-migration";
import { Toaster } from "sonner";
import "./globals.css";

const lora = localFont({
  variable: "--font-lora",
  display: "swap",
  src: [
    { path: "./fonts/lora-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/lora-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/lora-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/lora-700.ttf", weight: "700", style: "normal" },
  ],
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
          <AuthTokenMigration />
          <GlobalLoadingOverlay />
          <Toaster richColors position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
