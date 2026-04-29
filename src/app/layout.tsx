import type { Metadata } from "next";
import "./globals.css";
import DashboardLayout from "./dashboard-layout";

export const metadata: Metadata = {
  title: "AgendaIA - Gestión de Turnos",
  description: "Agente de IA para gestión de agenda de psicólogos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}