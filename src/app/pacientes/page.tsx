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

const MSG_DEFAULT = `¡Hola {nombre}! Te escribo de parte de tu profesional. A partir de ahora podés gestionar tus turnos directamente por acá con Aurora, mi asistente virtual 😊 ¿Querés sacar un turno?`;

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [detalle, setDetalle] = useState<PacienteDetalle | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  async function eliminarPaciente() {
    if (!seleccionado) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      const res = await fetch(`/api/data/pacientes?id=${seleccionado}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorEliminar(data.error ?? 'No se pudo eliminar. Intentá de nuevo.');
        setEliminando(false);
        return;
      }
      setPacientes(prev => prev.filter(p => p.id !== seleccionado));
      setSeleccionado(null);
      setDetalle(null);
      setConfirmarEliminar(false);
    } catch {
      setErrorEliminar('Error de conexión. Intentá de nuevo.');
    }
    setEliminando(false);
  }

  // Modal agregar paciente
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMensaje, setFormMensaje] = useState(MSG_DEFAULT);
  const [enviando, setEnviando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  function abrirModal() {
    setFormNombre(''); setFormTelefono(''); setFormEmail(''); setFormMensaje(MSG_DEFAULT); setErrorModal('');
    setModalAbierto(true);
  }

  function exportarCSV() {
    if (!pacientes.length) return;
    const encabezado = ['Nombre', 'Teléfono', 'Email', 'Fecha alta', 'Turnos totales'].join(',');
    const filas = pacientes.map(p => {
      const turnos = Array.isArray(p.turnos) ? p.turnos.length : 0;
      return [
        `"${(p.nombre ?? '').replace(/"/g, '""')}"`,
        `"${p.telefono ?? ''}"`,
        `"${p.email ?? ''}"`,
        `"${p.created_at ? new Date(p.created_at).toLocaleDateString('es-AR') : ''}"`,
        turnos,
      ].join(',');
    });
    const csv = [encabezado, ...filas].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pacientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function agregarPaciente(e: React.FormEvent) {
    e.preventDefault();
    if (!formNombre.trim() || !formTelefono.trim()) return;
    setEnviando(true); setErrorModal('');
    const mensajeFinal = formMensaje.replace('{nombre}', formNombre.trim());
    const res = await fetch('/api/data/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: formNombre.trim(), telefono: formTelefono.trim(), email: formEmail.trim() || undefined, mensajeInicial: mensajeFinal }),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) { setErrorModal(data.error ?? 'Error al agregar'); return; }
    setModalAbierto(false);
    fetch('/api/data/pacientes').then(r => r.json()).then(d => setPacientes(Array.isArray(d) ? d : []));
  }

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                {pacientes.length}
              </span>
              {pacientes.length > 0 && (
                <button onClick={exportarCSV} className="btn btn-sm" style={{ fontSize: 12, padding: '4px 10px' }} title="Exportar CSV">
                  ↓ CSV
                </button>
              )}
              <button onClick={abrirModal} className="btn btn-primary btn-sm" style={{ fontSize: 12, padding: '4px 10px' }}>
                + Paciente
              </button>
            </div>
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
            <div style={{ padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              {busqueda ? (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Sin resultados para "{busqueda}"</p>
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', margin: 0 }}>Todavía no hay pacientes</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
                    Agregá uno manualmente con "+ Paciente" o esperá a que Aurora registre los primeros contactos por WhatsApp.
                  </p>
                </>
              )}
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
                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`https://wa.me/${detalle.paciente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      WhatsApp
                    </a>
                    {confirmarEliminar ? (
                      <>
                        <button className="btn btn-sm" style={{ fontSize: 12 }} onClick={() => { setConfirmarEliminar(false); setErrorEliminar(''); }} disabled={eliminando}>
                          Cancelar
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: 12, background: '#B86A6A', color: '#fff', borderColor: '#B86A6A' }}
                          onClick={eliminarPaciente}
                          disabled={eliminando}
                        >
                          {eliminando ? 'Eliminando…' : '¿Eliminar?'}
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm"
                        style={{ fontSize: 12, color: '#B86A6A', borderColor: 'rgba(184,106,106,0.35)' }}
                        onClick={() => setConfirmarEliminar(true)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  {errorEliminar && (
                    <span style={{ fontSize: 12, color: '#B86A6A' }}>{errorEliminar}</span>
                  )}
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

      {/* ── Modal agregar paciente ── */}
      {modalAbierto && (
        <div
          onClick={() => setModalAbierto(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={agregarPaciente}
            style={{ background: 'var(--surface)', borderRadius: 14, padding: 28, width: 440, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
              Agregar paciente
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>Nombre</label>
              <input
                className="input"
                placeholder="María González"
                value={formNombre}
                onChange={e => setFormNombre(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>Teléfono WhatsApp</label>
              <input
                className="input"
                placeholder="1159530792 o +5491159530792"
                value={formTelefono}
                onChange={e => setFormTelefono(e.target.value)}
                required
                type="tel"
              />
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Argentina: podés escribir el número sin código de país</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>
                Email <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(opcional — para confirmaciones)</span>
              </label>
              <input
                className="input"
                placeholder="paciente@email.com"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                type="email"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>
                Mensaje inicial <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>— {'{nombre}'} se reemplaza con el nombre</span>
              </label>
              <textarea
                className="input"
                rows={4}
                value={formMensaje}
                onChange={e => setFormMensaje(e.target.value)}
                required
                style={{ resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {errorModal && (
              <p style={{ fontSize: 12, color: 'var(--error, #c0392b)', margin: 0 }}>{errorModal}</p>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Agregar y enviar WhatsApp'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
