import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./conditional-layout";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Calendaria — Tu agente IA para turnos por WhatsApp",
  description: "El agente de IA que gestiona tu agenda mientras vos atendés. Turnos por WhatsApp, recordatorios automáticos y cobro de señas.",
  keywords: ["agenda IA", "turnos automáticos", "WhatsApp agente", "psicólogo", "odontólogo", "Argentina"],
  metadataBase: new URL("https://calendaria.com.ar"),
  openGraph: {
    title: "Calendaria — Tu agente IA para turnos por WhatsApp",
    description: "Turnos por WhatsApp, recordatorios automáticos y cobro de señas.",
    url: "https://calendaria.com.ar",
    siteName: "Calendaria",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendaria — Tu agente IA para turnos por WhatsApp",
    description: "Turnos por WhatsApp, recordatorios automáticos y cobro de señas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
