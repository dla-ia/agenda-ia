'use client';

/* global-error.tsx — captura errores en el root layout mismo */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: '32px 24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
          background: '#F6F1EA',
          color: '#2C241D',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          gap: 0,
        }}
      >
        {/* Número decorativo */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(80px, 18vw, 120px)',
            fontWeight: 600,
            color: '#C26A4A',
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
          stroke="#C9BBA6"
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
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 500,
            color: '#2C241D',
            margin: '0 0 10px',
            letterSpacing: '-0.015em',
          }}
        >
          Error crítico
        </h1>
        <p
          style={{
            fontSize: 15,
            color: '#8C7E6F',
            margin: '0 0 32px',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          Ocurrió un problema grave en la aplicación. Podés intentar recargar la página.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid #A95838',
              background: '#C26A4A',
              color: '#FFF8F0',
              cursor: 'pointer',
            }}
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid #DDD1C0',
              background: '#FFFFFF',
              color: '#2C241D',
              cursor: 'pointer',
            }}
          >
            Ir al inicio
          </button>
        </div>

        {/* Digest para soporte (solo en dev) */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <p style={{ marginTop: 24, fontFamily: 'monospace', fontSize: 11, color: '#8C7E6F', background: '#EFE6DA', padding: '4px 10px', borderRadius: 6, border: '1px solid #DDD1C0' }}>
            digest: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
