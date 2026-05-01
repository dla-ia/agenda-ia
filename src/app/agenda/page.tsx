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
function TurnoModal({ turno, onClose }: { turno: Turno; onClose: () => void }) {
  const color = STATUS[turno.estado] ?? fallbackStatus;
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,29,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 360, padding: 26, background: 'var(--surface)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              {turno.paciente_nombre}
            </h3>
            <span
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: color.text, background: color.bg, border: `1px solid ${color.border}`, borderRadius: 6, padding: '2px 8px', display: 'inline-block' }}
            >
              {turno.estado.replace('_', ' ')}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18, padding: 2, lineHeight: 1 }}>
            ×
          </button>
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
          <button className="btn btn-sm" style={{ flex: 1 }}>Cancelar turno</button>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            {turno.estado === 'completado' ? '✓ Completado' : 'Marcar completado'}
          </button>
        </div>
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
            <button className="btn btn-primary btn-sm">+ Turno</button>
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

      {/* ── Detail modal ── */}
      {selected && <TurnoModal turno={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
