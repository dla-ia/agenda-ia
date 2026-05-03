import type { Metadata } from 'next';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

export const metadata: Metadata = { title: 'Pagos — Calendaria' };
export const dynamic = 'force-dynamic';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(monto);
}

const estadoBadge: Record<string, string> = {
  pagado:      'badge-success',
  pendiente:   'badge-warn',
  fallido:     'badge-error',
  reembolsado: 'badge-info',
};

async function fetchPagos(profesionalId: string) {
  const { data } = await supabaseAdmin
    .from('pagos')
    .select('*, turnos!inner(profesional_id, fecha_hora, pacientes(nombre))')
    .eq('turnos.profesional_id', profesionalId)
    .order('created_at', { ascending: false })
    .limit(100);

  return (data ?? []).map((p: any) => ({
    id:          p.id as string,
    monto:       p.monto as number,
    estado:      p.estado as string,
    fecha_pago:  p.fecha_pago as string | null,
    created_at:  p.created_at as string,
    turno_fecha: p.turnos?.fecha_hora as string | null,
    paciente:    p.turnos?.pacientes?.nombre as string | null,
    mp_id:       p.mercado_pago_payment_id as string | null,
  }));
}

export default async function PagosPage() {
  const profesionalId = await getProfesionalId();
  const pagos = await fetchPagos(profesionalId);

  const totalCobrado = pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0);
  const pendientes   = pagos.filter(p => p.estado === 'pendiente').length;

  const hasMercadoPago = !!process.env.MERCADOPAGO_ACCESS_TOKEN;

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1">Facturación</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0 }}>
            Pagos
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, marginTop: 4 }}>
            Historial de señas y cobros vía MercadoPago
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total cobrado', value: formatMonto(totalCobrado), sub: 'señas pagadas' },
          { label: 'Pendientes de pago', value: String(pendientes), sub: 'esperando cobro' },
          { label: 'Registros totales', value: String(pagos.length), sub: 'histórico' },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '18px 20px' }}>
            <p className="eyebrow mb-3">{m.label}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
              {m.value}
            </p>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
            Historial de pagos
          </h2>
          {!hasMercadoPago && (
            <span style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--bg-2)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
              Activar MercadoPago en configuración para cobrar señas
            </span>
          )}
        </div>

        {pagos.length === 0 ? (
          <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-3)', margin: 0 }}>Sin pagos registrados todavía</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
              Cuando se generen señas de turnos, aparecerán acá.
            </p>
          </div>
        ) : (
          <>
            {/* Encabezado tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px 120px', gap: 0, padding: '8px 20px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
              {['Paciente', 'Fecha turno', 'Monto', 'Estado', 'Fecha pago'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{h}</span>
              ))}
            </div>
            {pagos.map((p, i) => (
              <div
                key={p.id}
                className="row-hover"
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px 120px', gap: 0, padding: '12px 20px', borderBottom: i < pagos.length - 1 ? '1px solid var(--line)' : 'none', alignItems: 'center' }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.paciente ?? '—'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                  {p.turno_fecha ? formatFecha(p.turno_fecha) : '—'}
                </span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMonto(p.monto)}
                </span>
                <span className={`badge ${estadoBadge[p.estado] ?? ''}`} style={{ fontSize: 11, width: 'fit-content' }}>
                  {p.estado}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                  {p.fecha_pago ? formatFecha(p.fecha_pago) : '—'}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  );
}
