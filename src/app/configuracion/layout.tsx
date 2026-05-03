import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Configuración — Calendaria' };

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
