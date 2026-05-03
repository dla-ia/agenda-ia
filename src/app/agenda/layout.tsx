import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Agenda — Calendaria' };

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
