import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Agente IA — Calendaria' };

export default function AgenteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
