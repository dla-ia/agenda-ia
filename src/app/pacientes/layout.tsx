import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pacientes — Calendaria' };

export default function PacientesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
