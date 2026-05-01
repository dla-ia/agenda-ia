'use client';

import { usePathname } from 'next/navigation';
import DashboardLayout from './dashboard-layout';

const PUBLIC_ROUTES = ['/'];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  if (isPublic) return <>{children}</>;
  return <DashboardLayout>{children}</DashboardLayout>;
}
