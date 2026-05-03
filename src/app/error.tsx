'use client';

/* Error boundary global — Next.js App Router */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      {/* Número grande decorativo */}
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(80px, 18vw, 120px)',
          fontWeight: 600,
          color: 'var(--terracotta)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: 8,
          opacity: 0.15,
          userSelect: 'none',
        }}
      >
        500
      </div>

      {/* Ícono */}
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
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
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
        Algo salió mal
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--ink-3)',
          margin: '0 0 32px',
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        Ocurrió un error inesperado. Podés intentar recargar la página o volver al inicio.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          className="btn btn-primary"
          style={{ padding: '11px 24px', fontSize: 14 }}
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => { window.location.href = '/'; }}
          className="btn"
          style={{ padding: '11px 24px', fontSize: 14 }}
        >
          Ir al inicio
        </button>
      </div>

      {/* Digest para soporte (solo en dev) */}
      {process.env.NODE_ENV === 'development' && error.digest && (
        <p style={{ marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', background: 'var(--bg-2)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
          digest: {error.digest}
        </p>
      )}
    </div>
  );
}
