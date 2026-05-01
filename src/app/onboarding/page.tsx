'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

/* ── Step progress ───────────────────────────────────── */
function StepProgress({ step }: { step: number }) {
  const steps = ['Tu perfil', 'Tu agente', '¡Listo!'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: done ? 'var(--terracotta)' : active ? 'var(--terracotta)' : 'var(--bg-3)',
                color: (done || active) ? '#FFF8F0' : 'var(--ink-3)',
              }}>
                {done ? '✓' : idx}
              </div>
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--ink)' : 'var(--ink-3)' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: done ? 'var(--terracotta)' : 'var(--line)', borderRadius: 2, minWidth: 20 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Tu perfil ───────────────────────────────── */
function Step1({ onNext, userId }: { onNext: (data: Step1Data) => void; userId: string }) {
  const [especialidad, setEspecialidad] = useState('');
  const [duracion, setDuracion] = useState('50');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('20:00');
  const [saving, setSaving] = useState(false);

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/auth/profesional', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        especialidad,
        duracion_sesion_minutos: Number(duracion),
        horario_inicio: horaInicio,
        horario_fin: horaFin,
      }),
    });
    onNext({ especialidad, duracion });
    setSaving(false);
  }

  return (
    <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.015em' }}>
          Contanos de tu práctica
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
          Aurora va a usar estos datos para gestionar tu agenda correctamente.
        </p>
      </div>

      <label className="field">
        <span>Especialidad o descripción</span>
        <input
          className="input" autoFocus required
          placeholder="ej. psicología clínica, odontología general, mecánica automotriz"
          value={especialidad}
          onChange={e => setEspecialidad(e.target.value)}
        />
      </label>

      <label className="field">
        <span>Duración de cada sesión</span>
        <select className="input" value={duracion} onChange={e => setDuracion(e.target.value)}>
          <option value="30">30 minutos</option>
          <option value="45">45 minutos</option>
          <option value="50">50 minutos</option>
          <option value="60">60 minutos</option>
          <option value="90">90 minutos</option>
        </select>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label className="field">
          <span>Horario de inicio</span>
          <input className="input" type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
        </label>
        <label className="field">
          <span>Horario de cierre</span>
          <input className="input" type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '12px 0' }}>
        {saving ? 'Guardando…' : 'Continuar →'}
      </button>
    </form>
  );
}

interface Step1Data { especialidad: string; duracion: string; }

/* ── Step 2: Tu agente ───────────────────────────────── */
function Step2({ onNext, userId }: { onNext: () => void; userId: string }) {
  const [nombre, setNombre] = useState('Aurora');
  const [tono, setTono] = useState('warm');
  const [saludo, setSaludo] = useState('Hola 👋 Soy Aurora, la asistente de reservas. ¿Cómo te llamás y en qué te puedo ayudar?');
  const [saving, setSaving] = useState(false);

  const tonos = [
    { id: 'warm',   emoji: '🌱', label: 'Cálido',   desc: 'Empático y cercano' },
    { id: 'direct', emoji: '⚡', label: 'Directo',  desc: 'Eficiente y claro' },
    { id: 'casual', emoji: '😊', label: 'Casual',   desc: 'Amigable y relajado' },
  ] as const;

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/data/agente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agente_nombre: nombre,
        agente_tono: tono,
        agente_saludo: saludo,
        agente_cierre: `Gracias por contactarme. ¡Hasta pronto! 🙌`,
        agente_frases_prohibidas: JSON.stringify([]),
      }),
    });
    onNext();
    setSaving(false);
  }

  return (
    <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.015em' }}>
          Personalizá tu agente
        </h2>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
          Tu agente va a tener nombre e identidad propia. Lo podés cambiar después.
        </p>
      </div>

      <label className="field">
        <span>Nombre del agente</span>
        <input
          className="input" autoFocus required
          placeholder="Aurora, Luna, Leo..."
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </label>

      <div className="field">
        <span>Tono de conversación</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
          {tonos.map(opt => (
            <button
              key={opt.id} type="button"
              onClick={() => setTono(opt.id)}
              className="card"
              style={{
                padding: '12px 10px', textAlign: 'center', cursor: 'pointer', border: 'none', outline: 'none',
                borderColor: tono === opt.id ? 'var(--terracotta)' : 'var(--line)',
                boxShadow: tono === opt.id ? '0 0 0 3px rgba(194,106,74,0.12)' : 'none',
                background: tono === opt.id ? 'rgba(194,106,74,0.04)' : 'var(--surface-2)',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span>Primer mensaje que manda {nombre || 'tu agente'}</span>
        <textarea
          className="input" rows={3}
          style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
          value={saludo}
          onChange={e => setSaludo(e.target.value)}
        />
      </label>

      {/* Preview */}
      <div className="card" style={{ padding: 14 }}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>Vista previa</p>
        <div className="chat-area" style={{ borderRadius: 8, padding: '10px 8px' }}>
          <div className="chat-bubble chat-out" style={{ maxWidth: '85%', whiteSpace: 'pre-wrap', alignSelf: 'flex-end', fontSize: 13 }}>
            {saludo}
            <div className="chat-meta"><span className="chat-time">14:32</span></div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 4, width: '100%', justifyContent: 'center', padding: '12px 0' }}>
        {saving ? 'Guardando…' : 'Continuar →'}
      </button>
    </form>
  );
}

/* ── Step 3: ¡Listo! ─────────────────────────────────── */
function Step3() {
  const router = useRouter();
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.015em' }}>
        ¡Tu agente está listo!
      </h2>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.65 }}>
        Ya podés explorar tu panel. El siguiente paso es conectar WhatsApp desde la sección <strong>Agente IA → Integraciones</strong>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
        {[
          { icon: '✅', text: 'Perfil de profesional creado' },
          { icon: '✅', text: 'Agente configurado y activo' },
          { icon: '⏳', text: 'WhatsApp — pendiente de conectar' },
          { icon: '⏳', text: 'Google Calendar — pendiente' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={() => router.push('/dashboard')}
        style={{ marginTop: 36, padding: '13px 32px', fontSize: 15 }}
      >
        Ir a mi panel →
      </button>
    </div>
  );
}

/* ── Página principal ────────────────────────────────── */
export default function OnboardingPage() {
  const supabase = createSupabaseBrowser();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');

  // Obtener userId al montar
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setUserId(data.user.id);
    });
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #C26A4A 0%, #A95838 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Calendaria</span>
        </div>

        <StepProgress step={step} />

        <div className="card" style={{ padding: '28px 28px' }}>
          {step === 1 && <Step1 userId={userId} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 userId={userId} onNext={() => setStep(3)} />}
          {step === 3 && <Step3 />}
        </div>
      </div>
    </div>
  );
}
