/* Conversaciones loading skeleton */

function Skeleton({ w, h, radius = 8 }: { w?: string; h?: number; radius?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w ?? '100%', height: h ?? 16, borderRadius: radius }}
    />
  );
}

export default function ConversacionesLoading() {
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── Lista de conversaciones (panel izquierdo) ── */}
      <div
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header búsqueda */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton w="120px" h={18} />
          <Skeleton w="100%" h={34} radius={10} />
        </div>

        {/* Lista de conversaciones */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <Skeleton w="36px" h={36} radius={50} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton w="100px" h={13} />
                <Skeleton w="36px" h={11} />
              </div>
              <Skeleton w="80%" h={12} />
              <Skeleton w="50%" h={11} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Panel de chat (panel derecho) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header del chat */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton w="40px" h={40} radius={50} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Skeleton w="120px" h={14} />
            <Skeleton w="80px" h={11} />
          </div>
        </div>

        {/* Área de mensajes */}
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--chat-bg)' }}>
          {/* Mensajes entrantes / salientes alternados */}
          {[
            { dir: 'in',  wPct: '52%' },
            { dir: 'out', wPct: '44%' },
            { dir: 'in',  wPct: '60%' },
            { dir: 'out', wPct: '38%' },
            { dir: 'in',  wPct: '56%' },
            { dir: 'out', wPct: '48%' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.dir === 'in' ? 'flex-start' : 'flex-end' }}>
              <Skeleton w={m.wPct} h={38} radius={10} />
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Skeleton w="100%" h={38} radius={10} />
          <Skeleton w="38px" h={38} radius={10} />
        </div>
      </div>
    </div>
  );
}
