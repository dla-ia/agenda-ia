'use client';

import Link from 'next/link';
import { useState } from 'react';

/* ── Datos ─────────────────────────────────────────────── */

const profesiones = [
  { icon: '🧠', label: 'Psicólogo/a' },
  { icon: '🦷', label: 'Odontólogo/a' },
  { icon: '🔧', label: 'Mecánico/a' },
  { icon: '🥗', label: 'Nutricionista' },
  { icon: '💪', label: 'Kinesiólogo/a' },
  { icon: '💇', label: 'Estética' },
  { icon: '📋', label: 'Contador/a' },
  { icon: '⚖️', label: 'Abogado/a' },
  { icon: '🐾', label: 'Veterinario/a' },
  { icon: '🌿', label: 'Naturópata' },
  { icon: '👁️', label: 'Oculista' },
  { icon: '✨', label: 'Y muchos más...' },
];

const pasos = [
  {
    num: '01',
    titulo: 'Configurás a tu agente',
    desc: 'Le ponés nombre, horarios de atención, precios y el tono que quierés que use. Tarda menos de 10 minutos.',
  },
  {
    num: '02',
    titulo: 'Aurora atiende por vos',
    desc: 'Responde consultas 24/7, reserva turnos, cobra señas por MercadoPago y manda recordatorios automáticos.',
  },
  {
    num: '03',
    titulo: 'Vos solo aparecés a trabajar',
    desc: 'Tu agenda está llena y organizada. Sin interrupciones. Sin mensajes de madrugada.',
  },
];

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    titulo: 'Responde 24/7',
    desc: 'Tu agente nunca duerme. Responde consultas, aclara dudas y toma turnos a cualquier hora.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    titulo: 'Agenda sincronizada',
    desc: 'Cada turno se escribe directo en tu Google Calendar. Sin solapamientos, sin errores.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    titulo: 'Cobra la seña',
    desc: 'Manda un link de MercadoPago automáticamente. Sin seña, sin turno. Vos definís las reglas.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    titulo: 'Recordatorios automáticos',
    desc: 'Avisa a tus clientes 24hs y 2hs antes. Menos olvidos, menos ausencias.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    titulo: 'Aprende con vos',
    desc: 'Podés ajustar las reglas, el tono y los precios en cualquier momento desde el panel.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    titulo: 'Control total',
    desc: 'Ves todo lo que hace el agente. Si algo requiere tu atención, te avisa al instante.',
  },
];

const planes = [
  {
    nombre: 'Esencial',
    precio: '14.900',
    desc: 'Para profesionales que arrancan',
    features: [
      '1 agente IA (Aurora)',
      'Hasta 150 turnos/mes',
      'Google Calendar sincronizado',
      'Recordatorios automáticos',
      'Panel de control web',
      'Soporte por WhatsApp',
    ],
    cta: 'Empezar gratis',
    destacado: false,
  },
  {
    nombre: 'Pro',
    precio: '24.900',
    desc: 'Para quienes quieren más',
    features: [
      'Todo lo de Esencial',
      'Turnos ilimitados',
      'Cobro de señas (MercadoPago)',
      'Analytics y reportes',
      'Nombre del agente personalizado',
      'Soporte prioritario',
    ],
    cta: 'Empezar gratis',
    destacado: true,
  },
];

/* ── Componentes internos ───────────────────────────────── */

function Navbar() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(246, 241, 234, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #C26A4A 0%, #A95838 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            Calendaria
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ color: 'var(--ink-2)' }}>
            Iniciar sesión
          </Link>
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Empezar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ChatMockup() {
  const mensajes = [
    { from: 'in',  text: 'Hola! Quería pedir un turno 🙏' },
    { from: 'out', text: 'Hola! Soy Aurora, asistente de la Lic. Fernández. ¿Cómo te llamás?', thinking: true },
    { from: 'in',  text: 'Me llamo Mariana' },
    { from: 'out', text: 'Hola Mariana ✨ Tengo disponibilidad el martes 6 a las 10hs o el miércoles 7 a las 14hs. ¿Cuál te queda mejor?' },
    { from: 'in',  text: 'El martes a las 10hs' },
    { from: 'out', text: '¡Perfecto! Te reservo el martes 6 a las 10hs. Te mando el link de la seña ($8.000) para confirmar:' },
    { from: 'out', text: '🔗 mpago.la/sena-mariana', link: true },
  ];

  return (
    <div
      style={{
        width: 300,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--line)',
        background: 'var(--chat-bg)',
        flexShrink: 0,
      }}
    >
      {/* WhatsApp header */}
      <div style={{ background: '#075E54', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontFamily: 'var(--font-serif)', color: 'white', fontWeight: 600 }}>A</div>
        <div>
          <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0 }}>Aurora</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>agente de Lic. Fernández</p>
        </div>
      </div>
      {/* Messages */}
      <div className="chat-area" style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {mensajes.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'in' ? 'flex-start' : 'flex-end' }}>
            {m.thinking && (
              <div className="ai-thinking" style={{ marginBottom: 4, fontSize: 10 }}>
                ✦ Aurora pensando...
              </div>
            )}
            <div
              className={`chat-bubble ${m.from === 'in' ? 'chat-in' : 'chat-out'}`}
              style={m.link ? { background: '#F5F0DC', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--terracotta)' } : {}}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Página principal ───────────────────────────────────── */

export default function LandingPage() {
  const [planAnual, setPlanAnual] = useState(false);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)', background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px' }}>
          <span
            className="badge badge-ai"
            style={{ marginBottom: 20, display: 'inline-flex' }}
          >
            ✦ Para cualquier profesional independiente
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              margin: '0 0 20px',
            }}
          >
            Tu agenda,
            <br />
            <span style={{ color: 'var(--terracotta)' }}>en piloto automático</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 32px', maxWidth: 480 }}>
            Calendaria gestiona tus turnos por WhatsApp de forma autónoma.
            Respondé consultas, cobrá señas y mandá recordatorios — sin levantar el teléfono.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 24px' }}>
              Empezar gratis — 14 días sin cargo
            </Link>
            <a href="#como-funciona" className="btn" style={{ fontSize: 15, padding: '12px 24px' }}>
              Ver cómo funciona
            </a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Sin tarjeta de crédito · Configuración en 10 minutos
          </p>
        </div>

        {/* Mockup WhatsApp */}
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
          <ChatMockup />
        </div>
      </section>

      {/* ── PROFESIONES ─────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 28 }}>
            Funciona para cualquier profesional
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {profesiones.map((p) => (
              <div
                key={p.label}
                className="card"
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)' }}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ───────────────────────────────── */}
      <section id="como-funciona" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Simple como debe ser</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>
            3 pasos y tu agente está listo
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {pasos.map((p, i) => (
            <div key={p.num} className="card" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 64,
                  fontWeight: 700,
                  color: 'var(--bg-3)',
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  userSelect: 'none',
                }}
              >
                {p.num}
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--terracotta)',
                  marginBottom: 16,
                }}
              />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                {p.titulo}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Todo en uno</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>
              Qué hace Aurora por vos
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.titulo} className="card" style={{ padding: '22px 20px', background: 'var(--surface)' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--bg-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--terracotta)',
                    marginBottom: 14,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                  {f.titulo}
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ─────────────────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Precios</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 24px', color: 'var(--ink)' }}>
            Simple y sin sorpresas
          </h2>
          {/* Toggle anual/mensual */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '6px 12px' }}>
            <button
              onClick={() => setPlanAnual(false)}
              style={{ background: !planAnual ? 'var(--surface)' : 'transparent', border: 'none', borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: !planAnual ? 500 : 400, color: !planAnual ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer', boxShadow: !planAnual ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s ease' }}
            >
              Mensual
            </button>
            <button
              onClick={() => setPlanAnual(true)}
              style={{ background: planAnual ? 'var(--surface)' : 'transparent', border: 'none', borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: planAnual ? 500 : 400, color: planAnual ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer', boxShadow: planAnual ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s ease' }}
            >
              Anual <span style={{ color: 'var(--sage)', fontWeight: 600 }}>−20%</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {planes.map((plan) => {
            const precio = planAnual
              ? Math.round(parseInt(plan.precio.replace('.', '')) * 0.8).toLocaleString('es-AR')
              : plan.precio;
            return (
              <div
                key={plan.nombre}
                className="card"
                style={{
                  padding: '28px 24px',
                  background: plan.destacado ? 'var(--ink)' : 'var(--surface)',
                  border: plan.destacado ? '1px solid var(--ink)' : '1px solid var(--line)',
                  position: 'relative',
                }}
              >
                {plan.destacado && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--terracotta)',
                      color: '#FFF8F0',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 12px',
                      borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Más popular
                  </span>
                )}
                <p
                  className="eyebrow"
                  style={{ color: plan.destacado ? 'rgba(255,255,255,0.5)' : undefined, marginBottom: 8 }}
                >
                  {plan.nombre}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: plan.destacado ? 'rgba(255,255,255,0.6)' : 'var(--ink-3)' }}>$</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 40,
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      color: plan.destacado ? 'white' : 'var(--ink)',
                      lineHeight: 1,
                    }}
                  >
                    {precio}
                  </span>
                  <span style={{ fontSize: 13, color: plan.destacado ? 'rgba(255,255,255,0.5)' : 'var(--ink-3)' }}>/mes</span>
                </div>
                <p style={{ fontSize: 13, color: plan.destacado ? 'rgba(255,255,255,0.5)' : 'var(--ink-3)', margin: '0 0 22px' }}>
                  {plan.desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: plan.destacado ? 'rgba(255,255,255,0.8)' : 'var(--ink-2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.destacado ? 'var(--sage)' : 'var(--sage)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={plan.destacado ? 'btn btn-primary' : 'btn'}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    width: '100%',
                    ...(plan.destacado ? {} : { background: 'var(--bg-2)' }),
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', marginTop: 24 }}>
          Todos los planes incluyen 14 días gratis. Sin tarjeta de crédito.
        </p>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #EFE6DA 0%, #E5D7C5 100%)',
          borderTop: '1px solid var(--line)',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #C26A4A 0%, #A95838 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              margin: '0 0 16px',
            }}
          >
            Empezá hoy, gratis
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 32px' }}>
            Configurá a Aurora en 10 minutos y mirá cómo llena tu agenda sola.
            Sin permanencia. Cancelás cuando querés.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
            Crear mi agente gratis
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--line)',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #C26A4A 0%, #A95838 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Calendaria</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
            © 2026 Calendaria · Hecho en Argentina 🇦🇷
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacidad', 'Términos', 'Soporte'].map((l) => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
