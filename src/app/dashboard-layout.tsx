'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: 'Conversaciones',
    href: '/conversaciones',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    badge: 3,
  },
  {
    name: 'Agenda',
    href: '/agenda',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    name: 'Pacientes',
    href: '/pacientes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: 'Agente IA',
    href: '/agente',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

function CalendariaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-lg flex-shrink-0"
        style={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #C26A4A 0%, #A95838 100%)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      </div>
      <span
        className="font-serif font-semibold text-[17px] tracking-tight"
        style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)' }}
      >
        Calendaria
      </span>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ===== Sidebar desktop ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: 240,
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--line)',
          padding: '24px 14px',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="mb-7 px-2">
          <CalendariaLogo />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <span style={{ color: active ? 'var(--terracotta)' : 'var(--ink-3)' }}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {item.badge ? (
                  <span className="nav-count" style={{ background: active ? 'var(--bg-2)' : undefined }}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div
          className="mt-auto pt-4"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="avatar avatar-sm" style={{ background: '#C9B89A', fontSize: 12 }}>
              D
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>Dr. Diego</p>
              <p className="text-xs truncate" style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                Psicólogo
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(44, 36, 29, 0.35)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Contenido principal ===== */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top bar mobile */}
        <header
          className="flex items-center justify-between px-4 py-3 lg:hidden"
          style={{
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--line)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-sm"
            aria-label="Abrir menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <CalendariaLogo />
          <div style={{ width: 36 }} />
        </header>

        {/* Página */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
