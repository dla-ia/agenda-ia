'use client';

import { useState, useEffect } from 'react';

/* ── Icons ────────────────────────────────────────────── */
type IconName = 'phone' | 'calendar' | 'wallet' | 'inbox' | 'shield' | 'flag' | 'clock' | 'users' | 'plus' | 'x' | 'check' | 'moreV' | 'sparkles';

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    phone:    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    wallet:   <><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2H5a2 2 0 0 0 0 4h16v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><circle cx="17" cy="13" r="1.2" fill="currentColor" /></>,
    inbox:    <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" /></>,
    shield:   <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />,
    flag:     <path d="M4 21V4M4 4h13l-2 4 2 4H4" />,
    clock:    <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users:    <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.5c2.5.4 4.5 2.4 4.5 5" /></>,
    plus:     <path d="M12 5v14M5 12h14" />,
    x:        <path d="M6 6l12 12M18 6L6 18" />,
    check:    <path d="M5 12l4 4 10-10" />,
    moreV:    <><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

/* ── State shape ──────────────────────────────────────── */
type HorarioDia = { activo: boolean; inicio: string; fin: string };
type HorariosSemana = Record<string, HorarioDia>;
type Tarifa = { id: string; label: string; precio: string; duracion: string };

const DIAS_CONFIG = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sabado',    label: 'Sábado' },
];

const DIA_NUM: Record<string, number> = {
  lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};

function defaultHorarios(inicio = '09:00', fin = '19:00', diasActivos = [1,2,3,4,5]): HorariosSemana {
  return Object.fromEntries(
    DIAS_CONFIG.map(d => [d.key, { activo: diasActivos.includes(DIA_NUM[d.key]), inicio, fin }])
  );
}

const DEFAULT_TARIFAS: Tarifa[] = [
  { id: '1', label: 'Primera consulta', precio: '18000', duracion: '50 min' },
  { id: '2', label: 'Sesión individual', precio: '15000', duracion: '50 min' },
  { id: '3', label: 'Sesión de pareja',  precio: '22000', duracion: '60 min' },
];

interface Config {
  nombre: string;
  tono: 'warm' | 'direct' | 'casual';
  saludo: string;
  cierre: string;
  frases: string[];
  reagendaAutomatica: boolean;
  confirma24h: boolean;
  listaEspera: boolean;
  bufferSesiones: boolean;
  senaMonto: string;
  senaVencimiento: string;
  senaSinPago: boolean;
  horarios: HorariosSemana;
  tarifas: Tarifa[];
}

const DEFAULTS: Config = {
  nombre: 'Aurora',
  tono: 'warm',
  saludo: 'Hola, qué lindo que te animes a dar este paso 🌱 Soy Aurora, la asistente del profesional. ¿Cómo te llamás?',
  cierre: 'Cualquier duda, estoy por acá. ¡Te espero! 🌿',
  frases: ['diagnósticos', 'pronósticos', 'consejos médicos', 'promesas de resultado'],
  reagendaAutomatica: true,
  confirma24h: true,
  listaEspera: false,
  bufferSesiones: true,
  senaMonto: '8000',
  senaVencimiento: '2h',
  senaSinPago: true,
  horarios: defaultHorarios(),
  tarifas: DEFAULT_TARIFAS,
};

function fromApi(data: Record<string, string>): Config {
  let horarios = DEFAULTS.horarios;
  if (data.agente_horarios) {
    try { horarios = JSON.parse(data.agente_horarios); } catch {}
  } else if (data._horario_inicio) {
    const dias = data._dias_laborables ? JSON.parse(data._dias_laborables) : [1,2,3,4,5];
    horarios = defaultHorarios(data._horario_inicio, data._horario_fin ?? '19:00', dias);
  }
  let tarifas = DEFAULTS.tarifas;
  if (data.agente_tarifas) {
    try { tarifas = JSON.parse(data.agente_tarifas); } catch {}
  }
  return {
    nombre:              data.agente_nombre ?? DEFAULTS.nombre,
    tono:                (data.agente_tono as Config['tono']) ?? DEFAULTS.tono,
    saludo:              data.agente_saludo ?? DEFAULTS.saludo,
    cierre:              data.agente_cierre ?? DEFAULTS.cierre,
    frases:              data.agente_frases_prohibidas ? JSON.parse(data.agente_frases_prohibidas) : DEFAULTS.frases,
    reagendaAutomatica:  data.agente_reagenda_automatica !== 'false',
    confirma24h:         data.agente_confirma_24h !== 'false',
    listaEspera:         data.agente_lista_espera === 'true',
    bufferSesiones:      data.agente_buffer_sesiones !== 'false',
    senaMonto:           data.agente_sena_monto ?? DEFAULTS.senaMonto,
    senaVencimiento:     data.agente_sena_vencimiento ?? DEFAULTS.senaVencimiento,
    senaSinPago:         data.agente_sena_sin_pago !== 'false',
    horarios,
    tarifas,
  };
}

function toApi(c: Config): Record<string, string> {
  return {
    agente_nombre:              c.nombre,
    agente_tono:                c.tono,
    agente_saludo:              c.saludo,
    agente_cierre:              c.cierre,
    agente_frases_prohibidas:   JSON.stringify(c.frases),
    agente_reagenda_automatica: String(c.reagendaAutomatica),
    agente_confirma_24h:        String(c.confirma24h),
    agente_lista_espera:        String(c.listaEspera),
    agente_buffer_sesiones:     String(c.bufferSesiones),
    agente_sena_monto:          c.senaMonto,
    agente_sena_vencimiento:    c.senaVencimiento,
    agente_sena_sin_pago:       String(c.senaSinPago),
    agente_horarios:            JSON.stringify(c.horarios),
    agente_tarifas:             JSON.stringify(c.tarifas),
  };
}

/* ── Toggle ──────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 36, height: 20, borderRadius: 999,
        background: on ? 'var(--terracotta)' : 'var(--bg-3)',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: '#FFF8F0',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }} />
    </div>
  );
}

function ToggleCard({ title, desc, on, onChange }: { title: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>{desc}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

/* ── Tab: Personalidad ───────────────────────────────── */
function TabPersonalidad({ config, set }: { config: Config; set: (f: (c: Config) => Config) => void }) {
  const tonos = [
    { id: 'warm',   label: 'Cálido',   desc: 'Empático, suave' },
    { id: 'direct', label: 'Directo',  desc: 'Eficiente, claro' },
    { id: 'casual', label: 'Casual',   desc: 'Cercano, amable' },
  ] as const;

  const [nuevaFrase, setNuevaFrase] = useState('');

  function addFrase(e: React.KeyboardEvent) {
    if (e.key !== 'Enter' || !nuevaFrase.trim()) return;
    e.preventDefault();
    const f = nuevaFrase.trim();
    set(c => ({ ...c, frases: c.frases.includes(f) ? c.frases : [...c.frases, f] }));
    setNuevaFrase('');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 22 }}>
      {/* Formulario */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Cómo se presenta tu agente
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>Pequeños ajustes cambian mucho el tono.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label className="field">
            <span>Nombre del asistente</span>
            <input className="input" value={config.nombre} onChange={e => set(c => ({ ...c, nombre: e.target.value }))} />
          </label>

          <div className="field">
            <span>Tono de conversación</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
              {tonos.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => set(c => ({ ...c, tono: opt.id }))}
                  className="card"
                  style={{
                    padding: 12, textAlign: 'left', cursor: 'pointer', border: 'none',
                    borderColor: config.tono === opt.id ? 'var(--terracotta)' : 'var(--line)',
                    boxShadow: config.tono === opt.id ? '0 0 0 3px rgba(194,106,74,0.12)' : 'none',
                    background: config.tono === opt.id ? 'rgba(194,106,74,0.04)' : 'var(--surface-2)',
                    outline: 'none',
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Saludo inicial</span>
            <textarea
              className="input"
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
              value={config.saludo}
              onChange={e => set(c => ({ ...c, saludo: e.target.value }))}
            />
          </label>

          <label className="field">
            <span>Frase de cierre</span>
            <input className="input" value={config.cierre} onChange={e => set(c => ({ ...c, cierre: e.target.value }))} />
          </label>
        </div>
      </div>

      {/* Preview + frases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Cómo te ven tus clientes</p>
          <div className="chat-area" style={{ borderRadius: 10, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="chat-bubble chat-out" style={{ maxWidth: '100%', whiteSpace: 'pre-wrap', alignSelf: 'flex-end' }}>
              {config.saludo}
              <div className="chat-meta"><span className="chat-time">14:32</span></div>
            </div>
            <div className="chat-bubble chat-out" style={{ maxWidth: '100%', alignSelf: 'flex-end' }}>
              {'Tengo estos espacios:\n\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30'}
              <div className="chat-meta"><span className="chat-time">14:35</span></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: 'var(--ink)', margin: '0 0 10px' }}>
            Frases que evita
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {config.frases.map(f => (
              <span key={f} className="tag" style={{ cursor: 'default' }}>
                {f}
                <button
                  onClick={() => set(c => ({ ...c, frases: c.frases.filter(x => x !== f) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-3)', display: 'flex', alignItems: 'center' }}
                >
                  <Icon name="x" size={10} />
                </button>
              </span>
            ))}
          </div>
          <input
            className="input"
            placeholder="Agregar frase... (Enter)"
            value={nuevaFrase}
            onChange={e => setNuevaFrase(e.target.value)}
            onKeyDown={addFrase}
            style={{ fontSize: 12 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Reglas de agenda ───────────────────────────── */
function TabReglasAgenda({ config, set }: { config: Config; set: (f: (c: Config) => Config) => void }) {
  function setHorario(key: string, patch: Partial<HorarioDia>) {
    set(c => ({ ...c, horarios: { ...c.horarios, [key]: { ...c.horarios[key], ...patch } } }));
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink)', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Disponibilidad
        </h3>
        {DIAS_CONFIG.map((d, i) => {
          const h = config.horarios[d.key] ?? { activo: false, inicio: '09:00', fin: '19:00' };
          return (
            <div
              key={d.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderBottom: i < DIAS_CONFIG.length - 1 ? '1px solid var(--line)' : 'none',
                opacity: h.activo ? 1 : 0.45,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Toggle on={h.activo} onChange={v => setHorario(d.key, { activo: v })} />
              <span style={{ fontSize: 13.5, fontWeight: 450, color: 'var(--ink)', minWidth: 80 }}>{d.label}</span>
              <input
                type="time"
                className="input"
                value={h.inicio}
                onChange={e => setHorario(d.key, { inicio: e.target.value })}
                disabled={!h.activo}
                style={{ width: 90, fontSize: 12.5, padding: '4px 6px', fontFamily: 'var(--font-mono)', cursor: h.activo ? 'default' : 'not-allowed' }}
              />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>–</span>
              <input
                type="time"
                className="input"
                value={h.fin}
                onChange={e => setHorario(d.key, { fin: e.target.value })}
                disabled={!h.activo}
                style={{ width: 90, fontSize: 12.5, padding: '4px 6px', fontFamily: 'var(--font-mono)', cursor: h.activo ? 'default' : 'not-allowed' }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ToggleCard
          title="Reagenda automática"
          desc="Mueve turnos sin preguntar si hay disponibilidad la misma semana"
          on={config.reagendaAutomatica}
          onChange={v => set(c => ({ ...c, reagendaAutomatica: v }))}
        />
        <ToggleCard
          title="Confirma 24h antes"
          desc="Manda recordatorio y libera el turno si no responden"
          on={config.confirma24h}
          onChange={v => set(c => ({ ...c, confirma24h: v }))}
        />
        <ToggleCard
          title="Lista de espera"
          desc="Si liberás un turno, lo ofrece a quienes esperan"
          on={config.listaEspera}
          onChange={v => set(c => ({ ...c, listaEspera: v }))}
        />
        <ToggleCard
          title="Buffer entre sesiones"
          desc="Deja 10 minutos automáticamente entre turnos"
          on={config.bufferSesiones}
          onChange={v => set(c => ({ ...c, bufferSesiones: v }))}
        />
      </div>
    </div>
  );
}

/* ── Tab: Precios y pagos ────────────────────────────── */
function TarifaRow({
  tarifa, onChange, onRemove,
}: {
  tarifa: Tarifa;
  onChange: (patch: Partial<Tarifa>) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px auto', gap: 8, alignItems: 'center', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-2)' }}>
      <input
        className="input"
        placeholder="Nombre del servicio"
        value={tarifa.label}
        onChange={e => onChange({ label: e.target.value })}
        style={{ fontSize: 13, padding: '5px 8px' }}
      />
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink-3)', pointerEvents: 'none' }}>$</span>
        <input
          className="input"
          placeholder="15000"
          value={tarifa.precio}
          onChange={e => onChange({ precio: e.target.value.replace(/[^\d]/g, '') })}
          style={{ fontSize: 13, padding: '5px 8px 5px 18px', fontFamily: 'var(--font-mono)', width: '100%' }}
        />
      </div>
      <input
        className="input"
        placeholder="50 min"
        value={tarifa.duracion}
        onChange={e => onChange({ duracion: e.target.value })}
        style={{ fontSize: 12, padding: '5px 8px', color: 'var(--ink-3)' }}
      />
      <button
        type="button"
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: 6, transition: 'color 0.12s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#B86A6A')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

function TabPrecios({ config, set }: { config: Config; set: (f: (c: Config) => Config) => void }) {
  function updateTarifa(id: string, patch: Partial<Tarifa>) {
    set(c => ({ ...c, tarifas: c.tarifas.map(t => t.id === id ? { ...t, ...patch } : t) }));
  }
  function removeTarifa(id: string) {
    set(c => ({ ...c, tarifas: c.tarifas.filter(t => t.id !== id) }));
  }
  function addTarifa() {
    const newId = String(Date.now());
    set(c => ({ ...c, tarifas: [...c.tarifas, { id: newId, label: '', precio: '', duracion: '50 min' }] }));
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Tarifas
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.45 }}>
          Aurora menciona estos precios cuando los pacientes preguntan. Guardá para aplicar cambios.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Column labels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 30px', gap: 8, paddingInline: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>Servicio</span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>Precio</span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>Duración</span>
          </div>
          {config.tarifas.map(t => (
            <TarifaRow
              key={t.id}
              tarifa={t}
              onChange={patch => updateTarifa(t.id, patch)}
              onRemove={() => removeTarifa(t.id)}
            />
          ))}
          {config.tarifas.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ink-3)', padding: '12px 10px', fontStyle: 'italic' }}>
              Sin tarifas configuradas. Agregá al menos una para que Aurora pueda responder precios.
            </p>
          )}
          <button type="button" className="btn btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={addTarifa}>
            <Icon name="plus" size={12} /> Agregar tarifa
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink)', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Cobro de seña
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="field">
            <span>Monto de seña</span>
            <input
              className="input"
              value={`$ ${config.senaMonto}`}
              onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, '');
                set(c => ({ ...c, senaMonto: raw }));
              }}
            />
          </label>
          <label className="field">
            <span>Vencimiento del link</span>
            <select
              className="input"
              value={config.senaVencimiento}
              onChange={e => set(c => ({ ...c, senaVencimiento: e.target.value }))}
            >
              <option value="1h">1 hora</option>
              <option value="2h">2 horas</option>
              <option value="24h">24 horas</option>
              <option value="48h">48 horas</option>
            </select>
          </label>
          <ToggleCard
            title="Sin pago, sin reserva"
            desc="Libera el turno si no se pagó la seña antes del vencimiento"
            on={config.senaSinPago}
            onChange={v => set(c => ({ ...c, senaSinPago: v }))}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Integraciones ──────────────────────────────── */
function IntegCard({ name, desc, icon, estado }: { name: string; desc: string; icon: IconName; estado: 'conectado' | 'desconectado' | 'pendiente' }) {
  return (
    <div className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', flexShrink: 0 }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{name}</span>
          <span className={`badge ${estado === 'conectado' ? 'badge-success' : estado === 'pendiente' ? 'badge-warn' : 'badge-error'}`} style={{ fontSize: 10.5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 3 }} />
            {estado}
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.45, margin: 0 }}>{desc}</p>
      </div>
      <button className="btn btn-ghost btn-sm">Configurar</button>
    </div>
  );
}

function TabIntegraciones() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      <IntegCard name="WhatsApp Business" desc="Sandbox Twilio activo · pendiente activación de número real para producción" icon="phone" estado="pendiente" />
      <IntegCard name="Google Calendar"   desc="Sincronización de turnos · OAuth conectado" icon="calendar" estado="conectado" />
      <IntegCard name="MercadoPago"       desc="Cobro de señas · configuración pendiente" icon="wallet" estado="pendiente" />
      <IntegCard name="Resend"            desc="Confirmaciones y recordatorios por email" icon="inbox" estado="pendiente" />
    </div>
  );
}

/* ── Tab: Límites y crisis ───────────────────────────── */
function LimitRow({ icon, label, desc, required }: { icon: IconName; label: string; desc: string; required?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg-2)', borderRadius: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--terracotta)', flexShrink: 0 }}>
        <Icon name={icon} size={14} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', flexWrap: 'wrap' }}>
          {label}
          {required && <span className="badge badge-warn" style={{ fontSize: 10 }}>obligatorio</span>}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function TabLimites() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Cuándo te paso la conversación
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.5 }}>
          Tu agente es prudente. Ante estas señales deja de responder y te avisa para que tomes la posta.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <LimitRow icon="shield" label="Mención de crisis o autolesión"       desc="Comparte línea de ayuda y te notifica de inmediato" required />
          <LimitRow icon="flag"   label="Pedidos de descuento o tarifa social"  desc="Te consulta antes de aceptar" />
          <LimitRow icon="clock"  label="Horarios fuera de lo configurado"      desc="Te pregunta antes de bloquear o comprometerse" />
          <LimitRow icon="users"  label="Consultas clínicas específicas"        desc="Te deriva la pregunta sin responder" required />
        </div>
      </div>

      <div className="card" style={{ padding: 22, background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg-2) 100%)' }}>
        <div style={{ color: 'var(--terracotta)', marginBottom: 10 }}>
          <Icon name="shield" size={20} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          Protocolo de crisis
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 16 }}>
          Si Aurora detecta riesgo de autolesión, envía automáticamente las líneas de ayuda, detiene la conversación y te notifica por SMS y email.
        </p>
        <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Líneas de ayuda configuradas</p>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', margin: '0 0 4px' }}>
            📞 135 — Centro de Asistencia CABA
          </p>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', margin: 0 }}>
            📞 0800-345-1435 — INECO
          </p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 14px', fontStyle: 'italic' }}>
          Este protocolo es obligatorio y no puede desactivarse.
        </p>
        <button className="btn btn-sm">Editar protocolo</button>
      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────── */
const TABS = [
  { id: 'personalidad',  label: 'Personalidad' },
  { id: 'agenda',        label: 'Reglas de agenda' },
  { id: 'precios',       label: 'Precios y pagos' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'limites',       label: 'Cuándo derivarme' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AgentePage() {
  const [tab, setTab] = useState<TabId>('personalidad');
  const [config, setConfig] = useState<Config>(DEFAULTS);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/data/agente')
      .then(r => r.json())
      .then(data => { setConfig(fromApi(data)); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  async function handleGuardar() {
    setGuardando('saving');
    try {
      const res = await fetch('/api/data/agente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toApi(config)),
      });
      if (!res.ok) throw new Error();
      setGuardando('saved');
      setTimeout(() => setGuardando('idle'), 1800);
    } catch {
      setGuardando('error');
      setTimeout(() => setGuardando('idle'), 2500);
    }
  }

  function set(updater: (c: Config) => Config) {
    setConfig(prev => updater(prev));
  }

  const tabProps = { config, set };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ padding: '20px 28px 0', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
              Agente IA
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
              Configurá cómo conversa, qué puede hacer solo y cuándo te avisa
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="badge badge-warn">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              Sandbox activo
            </span>
            <button className="btn btn-sm">
              <Icon name="sparkles" size={13} /> Vista previa
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleGuardar}
              disabled={guardando === 'saving' || cargando}
              style={{ minWidth: 90 }}
            >
              {guardando === 'saving' && 'Guardando…'}
              {guardando === 'saved'  && <><Icon name="check" size={13} /> Guardado</>}
              {guardando === 'error'  && 'Error al guardar'}
              {guardando === 'idle'   && 'Guardar'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', gap: 2, marginLeft: -4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                borderBottom: tab === t.id ? '2px solid var(--terracotta)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.12s ease',
                outline: 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="scroll-styled" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 32px' }}>
        {cargando ? (
          <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Cargando configuración…</div>
        ) : (
          <>
            {tab === 'personalidad'  && <TabPersonalidad  {...tabProps} />}
            {tab === 'agenda'        && <TabReglasAgenda  {...tabProps} />}
            {tab === 'precios'       && <TabPrecios        {...tabProps} />}
            {tab === 'integraciones' && <TabIntegraciones />}
            {tab === 'limites'       && <TabLimites />}
          </>
        )}
      </div>
    </div>
  );
}
