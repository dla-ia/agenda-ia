import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ingresá a tu cuenta — Calendaria' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
