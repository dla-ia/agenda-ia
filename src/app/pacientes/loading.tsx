/* Pacientes loading skeleton */

function Skeleton({ w, h, radius = 8 }: { w?: string; h?: number; radius?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w ?? '100%', height: h ?? 16, borderRadius: radius }}
    />
  );
}

export default function PacientesLoading() {
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── Tabla de pacientes (panel izquierdo) ── */}
      <div
        style={{
          width: 360,
          flexShrink: 0,
          borderRight: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header con búsqueda y botón */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton w="100px" h={18} />
            <Skeleton w="120px" h={32} radius={8} />
          </div>
          <Skeleton w="100%" h={34} radius={10} />
        </div>

        {/* Filas de pacientes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Skeleton w="36px" h={36} radius={50} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Skeleton w="70%" h={13} />
              <Skeleton w="50%" h={11} />
            </div>
            <Skeleton w="48px" h={20} radius={20} />
          </div>
        ))}
      </div>

      {/* ── Ficha del paciente (panel derecho) ── */}
      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header ficha */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Skeleton w="56px" h={56} radius={50} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton w="40%" h={22} />
            <Skeleton w="25%" h={13} />
          </div>
          <Skeleton w="100px" h={32} radius={8} />
        </div>

        {/* Datos del paciente */}
        <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton w="80px" h={14} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skeleton w="60%" h={11} />
                <Skeleton w="80%" h={14} />
              </div>
            ))}
          </div>
        </div>

        {/* Historial de turnos */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <Skeleton w="140px" h={15} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skeleton w="120px" h={13} />
                <Skeleton w="80px" h={11} />
              </div>
              <Skeleton w="64px" h={20} radius={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
