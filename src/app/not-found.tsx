'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export default function NotFound() {
  const [href, setHref] = useState('/');

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setHref('/dashboard');
    });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 0,
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      {/* Número grande */}
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(80px, 18vw, 140px)',
          fontWeight: 600,
          color: 'var(--terracotta)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: 12,
          opacity: 0.18,
          userSelect: 'none',
        }}
      >
        404
      </div>

      {/* Icono */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--line-2)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: 16 }}
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(22px, 4vw, 28px)',
          fontWeight: 500,
          color: 'var(--ink)',
          margin: '0 0 10px',
          letterSpacing: '-0.015em',
        }}
      >
        Esta página no existe
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--ink-3)',
          margin: '0 0 32px',
          maxWidth: 360,
          lineHeight: 1.6,
        }}
      >
        El link puede haber cambiado o haber sido eliminado. Volvé al inicio y seguí desde ahí.
      </p>

      <a
        href={href}
        className="btn btn-primary"
        style={{ padding: '11px 28px', fontSize: 14 }}
      >
        {href === '/dashboard' ? 'Ir al panel' : 'Volver al inicio'}
      </a>
    </div>
  );
}
