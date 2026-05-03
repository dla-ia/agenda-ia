/* Agenda loading skeleton — calendario semanal */

function Skeleton({ w, h, radius = 8 }: { w?: string; h?: number; radius?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w ?? '100%', height: h ?? 16, borderRadius: radius }}
    />
  );
}

const DAYS = 7;
const HOUR_ROWS = 9; /* filas visibles antes de scroll */

export default function AgendaLoading() {
  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header: título + navegación semana */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Skeleton w="80px" h={12} />
          <Skeleton w="200px" h={26} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Skeleton w="32px" h={32} radius={8} />
          <Skeleton w="80px" h={32} radius={8} />
          <Skeleton w="32px" h={32} radius={8} />
          <Skeleton w="110px" h={32} radius={8} />
        </div>
      </div>

      {/* Grilla del calendario */}
      <div className="card" style={{ overflow: 'hidden' }}>

        {/* Cabecera de días */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px repeat(7, 1fr)',
            borderBottom: '1px solid var(--line)',
            padding: '10px 0',
          }}
        >
          <div /> {/* columna horas */}
          {Array.from({ length: DAYS }).map((_, d) => (
            <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '0 4px' }}>
              <Skeleton w="28px" h={11} />
              <Skeleton w="32px" h={32} radius={50} />
            </div>
          ))}
        </div>

        {/* Filas de horas */}
        {Array.from({ length: HOUR_ROWS }).map((_, row) => (
          <div
            key={row}
            style={{
              display: 'grid',
              gridTemplateColumns: '52px repeat(7, 1fr)',
              borderBottom: '1px solid var(--line)',
              minHeight: 56,
            }}
          >
            {/* Etiqueta hora */}
            <div style={{ padding: '6px 8px 0', display: 'flex', justifyContent: 'flex-end' }}>
              <Skeleton w="32px" h={11} />
            </div>

            {/* Celdas de días */}
            {Array.from({ length: DAYS }).map((_, d) => (
              <div
                key={d}
                style={{ borderLeft: '1px solid var(--line)', padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                {/* Aleatoriamente mostrar un evento skeleton en algunas celdas */}
                {(row * DAYS + d) % 7 === 2 && (
                  <Skeleton w="100%" h={36} radius={6} />
                )}
                {(row * DAYS + d) % 11 === 5 && (
                  <Skeleton w="90%" h={28} radius={6} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
