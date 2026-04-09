import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { InstallBanner } from "@/components/install-banner";
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "VozFactura — Facturas y presupuestos por voz",
    description:
      "Crea facturas y presupuestos hablando al móvil. Para autónomos que quieren cobrar rápido.",
    url: "https://factura.ai-implementer.com",
    siteName: "VozFactura",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VozFactura — Facturas y presupuestos por voz",
    description:
      "Crea facturas y presupuestos hablando al móvil. Para autónomos que quieren cobrar rápido.",
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
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-center" richColors />
        <InstallBanner />
      </body>
    </html>
  );
}
