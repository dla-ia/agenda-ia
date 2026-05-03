/* Dashboard loading skeleton — se muestra mientras se cargan los datos del servidor */

function Skeleton({ w, h, radius = 8 }: { w?: string; h?: number; radius?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w ?? '100%', height: h ?? 16, borderRadius: radius }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton w="120px" h={12} />
          <Skeleton w="220px" h={28} />
          <Skeleton w="280px" h={14} />
        </div>
        <Skeleton w="140px" h={36} radius={10} />
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton w="80%" h={11} />
            <Skeleton w="60%" h={38} radius={4} />
            <Skeleton w="40%" h={11} />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Actividad */}
        <div className="card lg:col-span-3" style={{ overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <Skeleton w="160px" h={17} />
            <Skeleton w="60px" h={20} radius={20} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid var(--line)' }}>
              <Skeleton w="30px" h={30} radius={8} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skeleton w="35%" h={13} />
                <Skeleton w="70%" h={12} />
              </div>
              <Skeleton w="40px" h={11} />
            </div>
          ))}
          <div className="px-5 py-3">
            <Skeleton w="180px" h={13} />
          </div>
        </div>

        {/* Hoy */}
        <div className="card lg:col-span-2" style={{ overflow: 'hidden' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <Skeleton w="60px" h={17} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-3">
                <Skeleton w="38px" h={12} />
                <Skeleton w="32px" h={32} radius={50} />
                <Skeleton w="70px" h={13} />
              </div>
              <Skeleton w="60px" h={20} radius={20} />
            </div>
          ))}
          <div className="px-5 py-3">
            <Skeleton w="140px" h={13} />
          </div>
        </div>

      </div>
    </div>
  );
}
