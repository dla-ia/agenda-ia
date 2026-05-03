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
  const [modoControl, setModoControl] = useState(false);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    // Salir de modo control al cambiar de conversación
    setModoControl(false);
    setMensajeTexto('');
    setErrorEnvio('');
  }, [seleccionada]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [mensajes]);

  useEffect(() => {
    if (modoControl && inputRef.current) inputRef.current.focus();
  }, [modoControl]);

  const convsFiltradas = convs.filter(c => filtro === 'todas' || c.estado === filtro);
  const nombreConv = (c: Conversacion) => c.pacientes?.nombre ?? c.telefono;

  async function handleEnviar() {
    if (!seleccionada || !mensajeTexto.trim() || enviando) return;
    setEnviando(true);
    setErrorEnvio('');
    try {
      const res = await fetch('/api/data/conversaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacion_id: seleccionada.id, mensaje: mensajeTexto.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorEnvio(json.error ?? 'Error al enviar');
        setEnviando(false);
        return;
      }
      // Agregar el mensaje nuevo a la lista local
      if (json.mensaje) {
        setMensajes(prev => [...prev, json.mensaje as Mensaje]);
      }
      setMensajeTexto('');
      setConvs(prev => prev.map(c =>
        c.id === seleccionada.id
          ? { ...c, ultimo_mensaje: mensajeTexto.trim(), ultimo_mensaje_at: new Date().toISOString() }
          : c
      ));
    } catch {
      setErrorEnvio('Error de red. Intentá de nuevo.');
    }
    setEnviando(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  }

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
            <div style={{ padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--line-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {filtro === 'todas' ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', margin: 0 }}>Sin conversaciones todavía</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
                    Aurora va a empezar a chatear con tus pacientes cuando reciban mensajes por WhatsApp.
                  </p>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Sin conversaciones {filtro === 'activa' ? 'activas' : 'archivadas'}</p>
              )}
            </div>
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
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge ${seleccionada.estado === 'activa' ? 'badge-success' : ''}`}>
                {seleccionada.estado}
              </span>
              {modoControl ? (
                <button
                  className="btn btn-sm"
                  onClick={() => { setModoControl(false); setMensajeTexto(''); setErrorEnvio(''); }}
                  style={{ background: 'rgba(184,106,106,0.12)', borderColor: '#B86A6A', color: '#8A3A3A' }}
                >
                  Cancelar
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setModoControl(true)}
                >
                  Tomar control
                </button>
              )}
            </div>
          </div>

          {/* Banner modo control */}
          {modoControl && (
            <div style={{ padding: '8px 20px', background: 'rgba(194,106,74,0.08)', borderBottom: '1px solid rgba(194,106,74,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ fontSize: 12, color: 'var(--terracotta)', fontWeight: 500 }}>
                Modo manual activo — los mensajes se envían directamente al paciente por WhatsApp
              </span>
            </div>
          )}

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

          {/* Footer */}
          {modoControl ? (
            <div style={{ padding: '12px 20px', background: 'var(--surface)', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {errorEnvio && (
                <p style={{ fontSize: 12, color: '#B86A6A', margin: 0 }}>{errorEnvio}</p>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={mensajeTexto}
                  onChange={e => setMensajeTexto(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribí tu mensaje... (Enter para enviar, Shift+Enter para salto de línea)"
                  rows={2}
                  style={{
                    flex: 1,
                    resize: 'none',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    fontSize: 13,
                    color: 'var(--ink)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    lineHeight: 1.45,
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleEnviar}
                  disabled={enviando || !mensajeTexto.trim()}
                  style={{ flexShrink: 0, padding: '10px 18px' }}
                >
                  {enviando ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '12px 20px', background: 'var(--bg-2)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                ✦ Aurora está manejando esta conversación automáticamente
              </span>
            </div>
          )}
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
