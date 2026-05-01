'use client';

import { useState, useEffect } from 'react';

interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  notas?: string;
  created_at: string;
  turnos?: Array<{ estado: string; fecha_hora: string }>;
  conversaciones?: Array<{ ultimo_mensaje: string; ultimo_mensaje_at: string }>;
}

interface PacienteDetalle {
  paciente: Paciente;
  turnos: Array<{ id: string; fecha_hora: string; estado: string; duracion_minutos: number }>;
  conversacion?: { ultimo_mensaje: string; ultimo_mensaje_at: string } | null;
}

function Avatar({ nombre, size = 36 }: { nombre: string; size?: number }) {
  const colors = ['#D6BFA6', '#C4A586', '#B5A188', '#A8957A', '#C9B89A', '#D4B5A0'];
  const color = colors[nombre.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: size * 0.38, color: 'var(--ink-2)', border: '1px solid var(--line)', flexShrink: 0 }}>
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}

function formatFecha(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const estadoBadge: Record<string, string> = {
  confirmado: 'badge-success',
  pendiente:  'badge-warn',
  cancelado:  'badge-error',
  completado: 'badge-info',
  no_asistio: 'badge-error',
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [detalle, setDetalle] = useState<PacienteDetalle | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    fetch('/api/data/pacientes')
      .then(r => r.json())
      .then(data => { setPacientes(Array.isArray(data) ? data : []); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!seleccionado) return;
    setCargandoDetalle(true);
    fetch(`/api/data/pacientes?id=${seleccionado}`)
      .then(r => r.json())
      .then(data => { setDetalle(data); setCargandoDetalle(false); })
      .catch(() => setCargandoDetalle(false));
  }, [seleccionado]);

  const filtrados = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.telefono.includes(busqueda)
  );

  const proximoTurno = detalle?.turnos?.find(t => new Date(t.fecha_hora) > new Date() && t.estado !== 'cancelado');
  const ultimoTurno = detalle?.turnos?.find(t => new Date(t.fecha_hora) <= new Date());
  const totalTurnos = detalle?.turnos?.length ?? 0;
  const completados = detalle?.turnos?.filter(t => t.estado === 'completado').length ?? 0;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh)', overflow: 'hidden' }}>

      {/* ── Lista lateral ── */}
      <div style={{ width: 300, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
              Pacientes
            </h1>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              {pacientes.length}
            </span>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input"
            style={{ fontSize: 13 }}
          />
        </div>

        <div className="scroll-styled" style={{ flex: 1, overflowY: 'auto' }}>
          {cargando ? (
            <div style={{ padding: 20, color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>Cargando...</div>
          ) : filtrados.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>
              {busqueda ? 'Sin resultados' : 'Sin pacientes'}
            </div>
          ) : (
            filtrados.map(p => {
              const activo = seleccionado === p.id;
              const convs = p.conversaciones as any;
              const ultimoMsg = Array.isArray(convs) && convs[0] ? convs[0].ultimo_mensaje : null;
              return (
                <button
                  key={p.id}
                  onClick={() => setSeleccionado(p.id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    border: 'none',
                    borderLeft: activo ? '3px solid var(--terracotta)' : '3px solid transparent',
                    background: activo ? 'var(--bg-2)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <Avatar nombre={p.nombre} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nombre}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                      {ultimoMsg ?? p.telefono}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Detalle ── */}
      {seleccionado && detalle?.paciente ? (
        <div className="scroll-styled" style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
          {cargandoDetalle ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Cargando...</div>
          ) : (
            <>
              {/* Header paciente */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <Avatar nombre={detalle.paciente.nombre} size={56} />
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    {detalle.paciente.nombre}
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                    {detalle.paciente.telefono}
                    {detalle.paciente.email ? ` · ${detalle.paciente.email}` : ''}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '2px 0 0', fontFamily: 'var(--font-mono)' }}>
                    desde {formatFecha(detalle.paciente.created_at)}
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <a href={`https://wa.me/${detalle.paciente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                    WhatsApp
                  </a>
                  <button className="btn btn-primary btn-sm">Reservar turno</button>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                {[
                  { label: 'Total sesiones', value: String(totalTurnos) },
                  { label: 'Completadas', value: String(completados) },
                  { label: 'Próximo turno', value: proximoTurno ? formatFecha(proximoTurno.fecha_hora) : '—' },
                  { label: 'Último turno',  value: ultimoTurno  ? formatFecha(ultimoTurno.fecha_hora)  : '—' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
                    <p className="eyebrow" style={{ marginBottom: 6 }}>{s.label}</p>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Historial de turnos */}
              <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
                    Historial de turnos
                  </h3>
                </div>
                {detalle.turnos.length === 0 ? (
                  <div style={{ padding: '20px 18px', color: 'var(--ink-3)', fontSize: 13 }}>Sin turnos registrados</div>
                ) : (
                  detalle.turnos.map((t, i) => (
                    <div
                      key={t.id}
                      className="row-hover flex items-center justify-between"
                      style={{ padding: '12px 18px', borderBottom: i < detalle.turnos.length - 1 ? '1px solid var(--line)' : 'none' }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', margin: '0 0 2px' }}>
                          {formatFecha(t.fecha_hora)}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                          {formatHora(t.fecha_hora)} · {t.duracion_minutos} min
                        </p>
                      </div>
                      <span className={`badge ${estadoBadge[t.estado] ?? ''}`} style={{ fontSize: 11 }}>
                        {t.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Notas */}
              {detalle.paciente.notas && (
                <div className="card" style={{ padding: '16px 18px' }}>
                  <p className="eyebrow" style={{ marginBottom: 8 }}>Notas privadas</p>
                  <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-2)', margin: 0, lineHeight: 1.55, fontFamily: 'var(--font-serif)' }}>
                    {detalle.paciente.notas}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Seleccioná un paciente</p>
        </div>
      )}
    </div>
  );
}
