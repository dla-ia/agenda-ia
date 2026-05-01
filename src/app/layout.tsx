import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "./conditional-layout";

export const metadata: Metadata = {
  title: "Calendaria — Tu agente IA de agenda",
  description: "Calendaria gestiona tu agenda por WhatsApp de forma autónoma. Turnos, cobros y recordatorios automáticos para cualquier profesional.",
  keywords: ["agenda IA", "turnos automáticos", "WhatsApp agente", "psicólogo", "odontólogo", "Argentina"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
