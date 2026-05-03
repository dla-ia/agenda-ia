import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

/* ── Helpers ────────────────────────────────────────────── */

function hoy() {
  return new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function startOf(unit: 'day' | 'week' | 'month', d = new Date()) {
  const dt = new Date(d);
  if (unit === 'day') { dt.setHours(0, 0, 0, 0); return dt; }
  if (unit === 'week') { const dow = dt.getDay(); dt.setDate(dt.getDate() - dow + (dow === 0 ? -6 : 1)); dt.setHours(0,0,0,0); return dt; }
  dt.setDate(1); dt.setHours(0, 0, 0, 0); return dt;
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const estadoBadge: Record<string, string> = {
  confirmado: 'badge-success',
  pendiente: 'badge-warn',
  cancelado: 'badge-error',
  completado: 'badge-info',
  no_asistio: 'badge-error',
};

/* ── Fetch functions (server-side) ─────────────────────── */

async function fetchMetrics(profesionalId: string) {
  const ahora = new Date();
  const inicioSemana = startOf('week', ahora).toISOString();
  const inicioMes = startOf('month', new Date()).toISOString();

  const [{ count: turnosSemana }, { count: totalPacientes }, { data: pagosData }, { count: noShows }, { count: turnosTotalesMes }] = await Promise.all([
    supabaseAdmin.from('turnos').select('*', { count: 'exact', head: true })
      .eq('profesional_id', profesionalId)
      .gte('fecha_hora', inicioSemana)
      .not('estado', 'eq', 'cancelado'),
    supabaseAdmin.from('pacientes').select('*', { count: 'exact', head: true })
      .eq('profesional_id', profesionalId),
    supabaseAdmin.from('pagos').select('monto')
      .gte('created_at', inicioMes),
    supabaseAdmin.from('turnos').select('*', { count: 'exact', head: true })
      .eq('profesional_id', profesionalId)
      .gte('fecha_hora', inicioMes)
      .eq('estado', 'no_asistio'),
    supabaseAdmin.from('turnos').select('*', { count: 'exact', head: true })
      .eq('profesional_id', profesionalId)
      .gte('fecha_hora', inicioMes)
      .not('estado', 'eq', 'cancelado'),
  ]);

  const senas = (pagosData || []).reduce((s, p) => s + (p.monto || 0), 0);
  const noShowRate = turnosTotalesMes ? Math.round(((noShows || 0) / turnosTotalesMes) * 100) : 0;

  return {
    turnosSemana: turnosSemana || 0,
    senas,
    noShowRate,
    totalPacientes: totalPacientes || 0,
  };
}

async function fetchTurnosHoy(profesionalId: string) {
  const inicio = startOf('day').toISOString();
  const fin = new Date(); fin.setHours(23, 59, 59, 999);

  const { data } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, estado, pacientes(nombre)')
    .eq('profesional_id', profesionalId)
    .gte('fecha_hora', inicio)
    .lte('fecha_hora', fin.toISOString())
    .order('fecha_hora', { ascending: true })
    .limit(8);

  return data || [];
}

async function fetchActividad(profesionalId: string) {
  const { data } = await supabaseAdmin
    .from('mensajes')
    .select('id, contenido, direccion, created_at, conversaciones!inner(telefono, paciente_id, profesional_id, pacientes(nombre))')
    .eq('conversaciones.profesional_id', profesionalId)
    .order('created_at', { ascending: false })
    .limit(8);

  return data || [];
}

/* ── Page (Server Component) ───────────────────────────── */

export default async function DashboardPage() {
  const profesionalId = await getProfesionalId();
  const [metrics, turnosHoy, actividad] = await Promise.all([
    fetchMetrics(profesionalId),
    fetchTurnosHoy(profesionalId),
    fetchActividad(profesionalId),
  ]);

  const señasFormateadas = metrics.senas >= 1000
    ? `$${(metrics.senas / 1000).toFixed(0)}k`
    : `$${metrics.senas}`;

  const metricCards = [
    { label: 'Turnos esta semana', value: String(metrics.turnosSemana), delta: null, sub: 'activos' },
    { label: 'Señas cobradas',     value: señasFormateadas,             delta: null, sub: 'este mes' },
    { label: 'Tasa de no-show',    value: `${metrics.noShowRate}%`,     delta: null, sub: 'este mes' },
    { label: 'Total pacientes',    value: String(metrics.totalPacientes), delta: null, sub: 'registrados' },
  ];

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1 capitalize">{hoy()}</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0 }}>
            Panel de control
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Aurora está activa y atendiendo consultas
          </p>
        </div>
        <a href="/agente" className="btn btn-primary">Configurar Aurora</a>
      </div>

      {/* Metric cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((m) => (
          <div key={m.label} className="card" style={{ padding: '18px 20px' }}>
            <p className="eyebrow mb-3">{m.label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
              {m.value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Actividad reciente */}
        <div className="card lg:col-span-3" style={{ overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
              Actividad de Aurora
            </h2>
            <span className="badge badge-ai">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--terracotta)', display: 'inline-block' }} />
              en vivo
            </span>
          </div>

          {actividad.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: 160, color: 'var(--ink-3)', fontSize: 14 }}>
              No hay actividad reciente
            </div>
          ) : (
            <div>
              {actividad.map((msg: any, i: number) => {
                const conv = msg.conversaciones as any;
                const nombre = conv?.pacientes?.nombre ?? conv?.telefono ?? 'Desconocido';
                const esSaliente = msg.direccion === 'saliente';
                const bg = esSaliente ? '#E8EFDC' : '#EFE6DA';
                const symbol = esSaliente ? '↗' : '↙';
                return (
                  <div
                    key={msg.id}
                    className="row-hover flex items-center gap-3 px-5 py-3.5"
                    style={{ borderBottom: i < actividad.length - 1 ? '1px solid var(--line)' : 'none' }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{nombre}</p>
                      <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.contenido}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      {formatRelativo(msg.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--line)' }}>
            <a href="/conversaciones" style={{ fontSize: 13, color: 'var(--terracotta)', fontWeight: 500, textDecoration: 'none' }}>
              Ver todas las conversaciones →
            </a>
          </div>
        </div>

        {/* Agenda de hoy */}
        <div className="card lg:col-span-2" style={{ overflow: 'hidden' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
              Hoy
            </h2>
          </div>

          {turnosHoy.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: 160, color: 'var(--ink-3)', fontSize: 14 }}>
              Sin turnos para hoy
            </div>
          ) : (
            <div>
              {turnosHoy.map((t: any, i: number) => {
                const pac = t.pacientes as any;
                const nombre = pac?.nombre ?? '—';
                const inicial = nombre.charAt(0);
                return (
                  <div
                    key={t.id}
                    className="row-hover flex items-center justify-between px-5 py-3"
                    style={{ borderBottom: i < turnosHoy.length - 1 ? '1px solid var(--line)' : 'none' }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', width: 38, flexShrink: 0 }}>
                        {formatHora(t.fecha_hora)}
                      </span>
                      <div className="avatar avatar-sm" style={{ background: '#C9B89A', flexShrink: 0 }}>
                        {inicial}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                        {nombre.split(' ')[0]}
                      </span>
                    </div>
                    <span className={`badge ${estadoBadge[t.estado] ?? ''}`} style={{ fontSize: 11, flexShrink: 0 }}>
                      {t.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--line)' }}>
            <a href="/agenda" style={{ fontSize: 13, color: 'var(--terracotta)', fontWeight: 500, textDecoration: 'none' }}>
              Ver agenda completa →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
