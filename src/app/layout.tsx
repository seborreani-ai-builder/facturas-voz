import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VozFactura — Facturas y presupuestos por voz",
  description:
    "Crea facturas y presupuestos hablando al móvil. Para autónomos que quieren cobrar rápido.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "theme-color": "#2563EB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
