'use client';

import { useState, useEffect, useRef } from 'react';

interface Conversacion {
  id: string;
  telefono: string;
  ultimo_mensaje?: string;
  ultimo_mensaje_at: string;
  estado: string;
  pacientes?: { nombre: string } | null;
}

interface Mensaje {
  id: string;
  contenido: string;
  direccion: 'entrante' | 'saliente';
  created_at: string;
}

function formatRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
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

export default function ConversacionesPage() {
  const [convs, setConvs] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [seleccionada, setSeleccionada] = useState<Conversacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoMsgs, setCargandoMsgs] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'activa' | 'archivada'>('todas');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/data/conversaciones')
      .then(r => r.json())
      .then(data => { setConvs(Array.isArray(data) ? data : []); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!seleccionada) return;
    setCargandoMsgs(true);
    fetch(`/api/data/conversaciones?id=${seleccionada.id}`)
      .then(r => r.json())
      .then(data => { setMensajes(Array.isArray(data) ? data : []); setCargandoMsgs(false); })
      .catch(() => setCargandoMsgs(false));
  }, [seleccionada]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [mensajes]);

  const convsFiltradas = convs.filter(c => filtro === 'todas' || c.estado === filtro);
  const nombreConv = (c: Conversacion) => c.pacientes?.nombre ?? c.telefono;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>

      {/* ── Lista lateral ── */}
      <div style={{ width: 300, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'var(--surface)' }}>
        {/* Header lista */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            Conversaciones
          </h1>
          {/* Filtro segmentado */}
          <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: 10, padding: 3, gap: 2 }}>
            {(['todas', 'activa', 'archivada'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: filtro === f ? 500 : 400,
                  background: filtro === f ? 'var(--surface-2)' : 'transparent',
                  color: filtro === f ? 'var(--ink)' : 'var(--ink-3)',
                  boxShadow: filtro === f ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {f === 'todas' ? 'Todo' : f === 'activa' ? 'Activas' : 'Archivadas'}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="scroll-styled" style={{ flex: 1, overflowY: 'auto' }}>
          {cargando ? (
            <div style={{ padding: 20, color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>Cargando...</div>
          ) : convsFiltradas.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>Sin conversaciones</div>
          ) : (
            convsFiltradas.map(c => {
              const activa = seleccionada?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSeleccionada(c)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    border: 'none',
                    borderLeft: activa ? '3px solid var(--terracotta)' : '3px solid transparent',
                    background: activa ? 'var(--bg-2)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <Avatar nombre={nombreConv(c)} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nombreConv(c)}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 8 }}>
                        {formatRelativo(c.ultimo_mensaje_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.ultimo_mensaje ?? '—'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Panel de chat ── */}
      {seleccionada ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header chat */}
          <div style={{ padding: '14px 20px', background: '#F0EAE0', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar nombre={nombreConv(seleccionada)} size={36} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{nombreConv(seleccionada)}</p>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, fontFamily: 'var(--font-mono)' }}>{seleccionada.telefono}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <span className={`badge ${seleccionada.estado === 'activa' ? 'badge-success' : ''}`}>
                {seleccionada.estado}
              </span>
              <button className="btn btn-sm">Tomar control</button>
            </div>
          </div>

          {/* Mensajes */}
          <div ref={chatRef} className="chat-area scroll-styled" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cargandoMsgs ? (
              <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, marginTop: 40 }}>Cargando mensajes...</div>
            ) : mensajes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, marginTop: 40 }}>Sin mensajes</div>
            ) : (
              mensajes.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.direccion === 'entrante' ? 'flex-start' : 'flex-end' }}>
                  <div className={`chat-bubble ${m.direccion === 'entrante' ? 'chat-in' : 'chat-out'}`}>
                    {m.contenido}
                    <div className="chat-meta">
                      <span className="chat-time">{formatHora(m.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer — nota del agente */}
          <div style={{ padding: '12px 20px', background: 'var(--bg-2)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              ✦ Aurora está manejando esta conversación automáticamente
            </span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Seleccioná una conversación</p>
        </div>
      )}
    </div>
  );
}
