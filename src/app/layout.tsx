import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NELTAL - Sistema de Diagnósticos Financieros",
  description: "Despertamos la realidad financiera de tu negocio. Sistema de diagnósticos financieros para PyMEs mexicanas.",
  keywords: ["NELTAL", "finanzas", "PyME", "México", "diagnóstico financiero", "consultoría"],
  authors: [{ name: "NELTAL" }],
  openGraph: {
    title: "NELTAL - Diagnósticos Financieros",
    description: "Despertamos la realidad financiera de tu negocio",
    siteName: "NELTAL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
