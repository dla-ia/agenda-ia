'use client';

/* Error boundary para el panel del profesional */

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '48px 24px',
        textAlign: 'center',
        minHeight: 400,
      }}
    >
      {/* Ícono */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(194,106,74,0.08)',
          border: '1px solid rgba(194,106,74,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--terracotta)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--ink)',
          margin: '0 0 8px',
          letterSpacing: '-0.015em',
        }}
      >
        No se pudo cargar esta sección
      </h2>
      <p
        style={{
          fontSize: 14,
          color: 'var(--ink-3)',
          margin: '0 0 28px',
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al dashboard.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          className="btn btn-primary btn-sm"
          style={{ padding: '9px 20px' }}
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => { window.location.href = '/dashboard'; }}
          className="btn btn-sm"
          style={{ padding: '9px 20px' }}
        >
          Volver al dashboard
        </button>
      </div>

      {/* Digest para soporte (solo en dev) */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <p style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', background: 'var(--bg-2)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
          digest: {error.digest}
        </p>
      )}
    </div>
  );
}
