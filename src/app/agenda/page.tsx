'use client';

import { useState, useEffect, useRef } from 'react';

/* ── Constants ───────────────────────────────────────── */
const HOUR_PX   = 72;   // pixels per hour
const START_H   = 8;
const END_H     = 20;
const HOURS     = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const AR_OFFSET = 3 * 60 * 60 * 1000; // UTC-3

/* ── Timezone helpers (Argentina UTC-3, no DST) ──────── */
function toAR(utcIso: string): Date {
  return new Date(new Date(utcIso).getTime() - AR_OFFSET);
}

function arDayStr(utcIso: string): string {
  const d = toAR(utcIso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function localDayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toTop(utcIso: string): number {
  const ar = toAR(utcIso);
  return (ar.getUTCHours() - START_H) * HOUR_PX + (ar.getUTCMinutes() / 60) * HOUR_PX;
}

function toHeight(minutos: number): number {
  return Math.max((minutos / 60) * HOUR_PX, 26);
}

function formatHora(utcIso: string): string {
  return toAR(utcIso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

function formatFechaLarga(utcIso: string): string {
  return toAR(utcIso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/* ── Week helpers ────────────────────────────────────── */
function getWeekStart(d = new Date()): Date {
  const date = new Date(d);
  const day  = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/* ── Types ───────────────────────────────────────────── */
interface Turno {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  estado: string;
  paciente_nombre: string;
}

/* ── Status colors ───────────────────────────────────── */
const STATUS: Record<string, { bg: string; border: string; text: string }> = {
  confirmado: { bg: 'rgba(138,161,118,0.18)', border: '#8AA176', text: '#4E6B3A' },
  pendiente:  { bg: 'rgba(201,154,63,0.15)',  border: '#C99A3F', text: '#7A5C10' },
  cancelado:  { bg: 'rgba(184,106,106,0.12)', border: '#B86A6A', text: '#8A3A3A' },
  completado: { bg: 'rgba(90,78,66,0.08)',    border: 'var(--ink-3)', text: 'var(--ink-2)' },
  no_asistio: { bg: 'rgba(184,106,106,0.12)', border: '#B86A6A', text: '#8A3A3A' },
};
const fallbackStatus = STATUS.pendiente;

/* ── Detail modal ────────────────────────────────────── */
function TurnoModal({
  turno, onClose, onUpdate,
}: {
  turno: Turno;
  onClose: () => void;
  onUpdate: (id: string, estado: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState<string | null>(null);
  const color = STATUS[turno.estado] ?? fallbackStatus;
  const yaCompletado = turno.estado === 'completado';
  const yaCancelado  = turno.estado === 'cancelado';

  async function handleUpdate(estado: string) {
    setUpdating(estado);
    await onUpdate(turno.id, estado);
    setUpdating(null);
    onClose();
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,29,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div className="card" style={{ width: 360, padding: 26, background: 'var(--surface)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {turno.paciente_nombre}
            </h3>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: color.text, background: color.bg, border: `1px solid ${color.border}`, borderRadius: 6, padding: '2px 8px', display: 'inline-block' }}>
              {turno.estado.replace('_', ' ')}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18, padding: 2, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Fecha',    value: formatFechaLarga(turno.fecha_hora) },
            { label: 'Hora',     value: formatHora(turno.fecha_hora) },
            { label: 'Duración', value: `${turno.duracion_minutos} min` },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--ink-3)' }}>{r.label}</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textTransform: 'capitalize' }}>{r.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-sm" style={{ flex: 1, opacity: yaCancelado ? 0.4 : 1 }}
            disabled={yaCancelado || updating !== null}
            onClick={() => handleUpdate('cancelado')}
          >
            {updating === 'cancelado' ? 'Cancelando…' : yaCancelado ? '✗ Cancelado' : 'Cancelar turno'}
          </button>
          <button
            className="btn btn-primary btn-sm" style={{ flex: 1, opacity: yaCompletado ? 0.6 : 1 }}
            disabled={yaCompletado || updating !== null}
            onClick={() => handleUpdate('completado')}
          >
            {updating === 'completado' ? 'Guardando…' : yaCompletado ? '✓ Completado' : 'Marcar completado'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Nuevo turno modal ───────────────────────────────── */
function NuevoTurnoModal({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (turno: Turno) => void;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [nombre, setNombre]       = useState('');
  const [fecha, setFecha]         = useState(hoy);
  const [hora, setHora]           = useState('09:00');
  const [duracion, setDuracion]   = useState('50');
  const [notas, setNotas]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [pacientes, setPacientes] = useState<{ id: string; nombre: string }[]>([]);
  const [sugerencias, setSugerencias] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    fetch('/api/data/pacientes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPacientes(data); })
      .catch(() => {});
  }, []);

  function handleNombre(val: string) {
    setNombre(val);
    setSugerencias(val.length >= 2
      ? pacientes.filter(p => p.nombre.toLowerCase().includes(val.toLowerCase())).slice(0, 5)
      : []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setErrorMsg('Ingresá el nombre del paciente'); return; }
    setSaving(true);
    setErrorMsg('');
    const fecha_hora = new Date(`${fecha}T${hora}:00-03:00`).toISOString();
    const res = await fetch('/api/data/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_paciente: nombre, fecha_hora, duracion_minutos: Number(duracion), notas }),
    });
    const json = await res.json();
    if (!res.ok) { setErrorMsg(json.error ?? 'Error al crear turno'); setSaving(false); return; }
    onCreate(json.turno);
    onClose();
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,29,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div className="card" style={{ width: 400, padding: 26, background: 'var(--surface)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
            Nuevo turno
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18, padding: 2, lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <label className="field">
              <span>Paciente</span>
              <input
                className="input" autoFocus required
                placeholder="Nombre del paciente"
                value={nombre}
                onChange={e => handleNombre(e.target.value)}
                onBlur={() => setTimeout(() => setSugerencias([]), 150)}
              />
            </label>
            {sugerencias.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, zIndex: 10, overflow: 'hidden', marginTop: 2 }}>
                {sugerencias.map(p => (
                  <button
                    key={p.id} type="button"
                    style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink)' }}
                    onMouseDown={() => { setNombre(p.nombre); setSugerencias([]); }}
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="field">
              <span>Fecha</span>
              <input className="input" type="date" required value={fecha} onChange={e => setFecha(e.target.value)} />
            </label>
            <label className="field">
              <span>Hora</span>
              <input className="input" type="time" required value={hora} onChange={e => setHora(e.target.value)} />
            </label>
          </div>

          <label className="field">
            <span>Duración</span>
            <select className="input" value={duracion} onChange={e => setDuracion(e.target.value)}>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="50">50 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </label>

          <label className="field">
            <span>Notas <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(opcional)</span></span>
            <textarea className="input" rows={2} style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }} value={notas} onChange={e => setNotas(e.target.value)} />
          </label>

          {errorMsg && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{errorMsg}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '11px 0', marginTop: 4 }}>
            {saving ? 'Creando turno…' : 'Crear turno'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function AgendaPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [selected, setSelected] = useState<Turno | null>(null);
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function updateTurno(id: string, estado: string) {
    await fetch('/api/data/agenda', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado }),
    });
    setTurnos(prev => prev.map(t => t.id === id ? { ...t, estado } : t));
  }

  function addTurno(turno: Turno) {
    setTurnos(prev => [...prev, turno].sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora)));
  }

  // Scroll to 8am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // 8am is the start
    }
  }, []);

  useEffect(() => {
    setCargando(true);
    const from = localDayStr(weekStart);
    const to   = localDayStr(addDays(weekStart, 4));
    fetch(`/api/data/agenda?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(data => { setTurnos(Array.isArray(data) ? data : []); setCargando(false); })
      .catch(() => setCargando(false));
  }, [weekStart]);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const turnosByDay = (idx: number): Turno[] => {
    const ds = localDayStr(weekDays[idx]);
    return turnos.filter(t => arDayStr(t.fecha_hora) === ds);
  };

  const mesLabel = weekStart.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const today    = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 2, textTransform: 'capitalize' }}>{mesLabel}</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0 }}>
              Agenda
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {cargando && (
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Cargando…</span>
            )}
            <button
              className="btn btn-sm"
              onClick={() => setWeekStart(getWeekStart())}
            >
              Hoy
            </button>
            <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: 0, borderRight: '1px solid var(--line)', paddingInline: 12 }}
                onClick={() => setWeekStart(d => addDays(d, -7))}
              >
                ←
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: 0, paddingInline: 12 }}
                onClick={() => setWeekStart(d => addDays(d, 7))}
              >
                →
              </button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setNuevoOpen(true)}>+ Turno</button>
          </div>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)', background: 'var(--surface)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ borderRight: '1px solid var(--line)' }} />
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
              <div key={i} style={{ padding: '10px 0 8px', textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--line)' : undefined }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {DAY_NAMES[i]}
                </div>
                <div style={{
                  width: 34, height: 34, margin: '0 auto',
                  borderRadius: '50%',
                  background: isToday ? 'var(--terracotta)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
                  color: isToday ? '#FFF8F0' : 'var(--ink)',
                }}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div ref={scrollRef} className="scroll-styled" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(5, 1fr)' }}>

            {/* Time gutter */}
            <div style={{ borderRight: '1px solid var(--line)' }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: HOUR_PX, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 5 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => {
              const colTurnos = turnosByDay(dayIdx);
              const isToday   = day.toDateString() === today.toDateString();
              return (
                <div
                  key={dayIdx}
                  style={{
                    borderLeft: '1px solid var(--line)',
                    position: 'relative',
                    height: HOUR_PX * HOURS.length,
                    background: isToday ? 'rgba(194,106,74,0.025)' : 'transparent',
                  }}
                >
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div key={h} style={{ position: 'absolute', top: (h - START_H) * HOUR_PX, left: 0, right: 0, borderTop: '1px solid var(--line)', opacity: 0.45 }} />
                  ))}
                  {/* Half-hour lines */}
                  {HOURS.map(h => (
                    <div key={`${h}.5`} style={{ position: 'absolute', top: (h - START_H) * HOUR_PX + HOUR_PX / 2, left: 0, right: 0, borderTop: '1px dashed var(--line)', opacity: 0.25 }} />
                  ))}

                  {/* Current time line */}
                  {isToday && (() => {
                    const now = new Date();
                    const nowTop = (now.getHours() - START_H) * HOUR_PX + (now.getMinutes() / 60) * HOUR_PX;
                    if (nowTop < 0 || nowTop > HOUR_PX * HOURS.length) return null;
                    return (
                      <div style={{ position: 'absolute', top: nowTop, left: 0, right: 0, display: 'flex', alignItems: 'center', zIndex: 2, pointerEvents: 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--terracotta)', marginLeft: -4, flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 1.5, background: 'var(--terracotta)', opacity: 0.6 }} />
                      </div>
                    );
                  })()}

                  {/* Appointments */}
                  {colTurnos.map(t => {
                    const top    = toTop(t.fecha_hora);
                    const height = toHeight(t.duracion_minutos);
                    const color  = STATUS[t.estado] ?? fallbackStatus;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelected(t)}
                        style={{
                          position: 'absolute',
                          top: top + 1,
                          left: 4, right: 4,
                          height: height - 2,
                          background: color.bg,
                          borderLeft: `3px solid ${color.border}`,
                          borderRadius: 6,
                          padding: '3px 7px',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textAlign: 'left',
                          border: 'none',
                          outline: 'none',
                          zIndex: 1,
                          transition: 'filter 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.93)')}
                        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                          {t.paciente_nombre}
                        </div>
                        {height > 38 && (
                          <div style={{ fontSize: 10, color: color.text, opacity: 0.7, fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                            {formatHora(t.fecha_hora)} · {t.duracion_minutos}′
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <TurnoModal
          turno={selected}
          onClose={() => setSelected(null)}
          onUpdate={async (id, estado) => {
            await updateTurno(id, estado);
            setSelected(prev => prev ? { ...prev, estado } : null);
          }}
        />
      )}
      {nuevoOpen && (
        <NuevoTurnoModal onClose={() => setNuevoOpen(false)} onCreate={addTurno} />
      )}
    </div>
  );
}
