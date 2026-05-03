import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Conversaciones — Calendaria' };

export default function ConversacionesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
