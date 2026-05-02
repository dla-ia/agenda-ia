'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Lockup } from '@/components/brand/Lockup';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

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
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'ok' | 'taken' | 'invalid'>('idle');
  const [slugError, setSlugError] = useState('');
  const [saving, setSaving] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-sugerir slug desde especialidad (solo si el user no lo editó)
  const slugEdited = useRef(false);
  useEffect(() => {
    if (slugEdited.current) return;
    const suggested = slugify(especialidad);
    setSlug(suggested);
    if (suggested) checkSlug(suggested);
  }, [especialidad]);

  function handleSlugChange(val: string) {
    slugEdited.current = true;
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(clean);
    checkSlug(clean);
  }

  function checkSlug(value: string) {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!value || value.length < 3) {
      setSlugStatus(value.length > 0 && value.length < 3 ? 'invalid' : 'idle');
      setSlugError('Mínimo 3 caracteres');
      return;
    }
    if (!/^[a-z0-9-]{3,40}$/.test(value)) {
      setSlugStatus('invalid');
      setSlugError('Solo letras, números y guiones');
      return;
    }
    setSlugStatus('checking');
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/profesional?slug=${encodeURIComponent(value)}`);
        const json = await res.json();
        setSlugStatus(json.available ? 'ok' : 'taken');
        setSlugError(json.available ? '' : 'Ese slug ya está en uso, elegí otro');
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
  }

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (slugStatus === 'taken' || slugStatus === 'invalid') return;
    setSaving(true);
    const res = await fetch('/api/auth/profesional', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        especialidad,
        duracion_sesion_minutos: Number(duracion),
        horario_inicio: horaInicio,
        horario_fin: horaFin,
        slug: slug || null,
      }),
    });
    const json = await res.json();
    if (json.error?.includes('slug')) {
      setSlugStatus('taken');
      setSlugError('Ese slug ya está en uso, elegí otro');
      setSaving(false);
      return;
    }
    onNext({ especialidad, duracion, slug });
    setSaving(false);
  }

  const slugOk = slugStatus === 'ok';
  const slugBad = slugStatus === 'taken' || slugStatus === 'invalid';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calendaria.com.ar';

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

      {/* Slug */}
      <div className="field">
        <span>Tu link de WhatsApp</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 4 }}>
          <span style={{
            padding: '9px 10px', fontSize: 13, color: 'var(--ink-3)',
            background: 'var(--bg-3)', border: '1.5px solid var(--line)',
            borderRight: 'none', borderRadius: '8px 0 0 8px', whiteSpace: 'nowrap',
          }}>
            calendaria.com.ar/w/
          </span>
          <input
            className="input"
            style={{
              borderRadius: '0 8px 8px 0', flex: 1, minWidth: 0,
              borderColor: slugOk ? '#4ade80' : slugBad ? '#f87171' : 'var(--line)',
            }}
            placeholder="mi-nombre"
            value={slug}
            onChange={e => handleSlugChange(e.target.value)}
            maxLength={40}
          />
          <span style={{ marginLeft: 8, fontSize: 16, flexShrink: 0 }}>
            {slugStatus === 'checking' ? '⏳' : slugOk ? '✅' : slugBad ? '❌' : ''}
          </span>
        </div>
        {slugBad && (
          <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{slugError}</p>
        )}
        {slugOk && slug && (
          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '4px 0 0' }}>
            Tus pacientes van a escribirte desde{' '}
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--terracotta)' }}>
              {APP_URL}/w/{slug}
            </span>
          </p>
        )}
      </div>

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

      <button type="submit" className="btn btn-primary" disabled={saving || slugBad || slugStatus === 'checking'} style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '12px 0' }}>
        {saving ? 'Guardando…' : 'Continuar →'}
      </button>
    </form>
  );
}

interface Step1Data { especialidad: string; duracion: string; slug: string; }

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
function Step3({ slug }: { slug: string }) {
  const router = useRouter();
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calendaria.com.ar';
  const waLink = slug ? `${APP_URL}/w/${slug}` : null;

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', margin: '0 0 12px', letterSpacing: '-0.015em' }}>
        ¡Tu agente está listo!
      </h2>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.65 }}>
        Compartí tu link y Aurora empieza a atender a tus pacientes por WhatsApp.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto' }}>
        {[
          { icon: '✅', text: 'Perfil de profesional creado' },
          { icon: '✅', text: 'Agente configurado y activo' },
          { icon: waLink ? '✅' : '⏳', text: waLink ? `Link: ${waLink}` : 'WhatsApp — sin link asignado' },
          { icon: '⏳', text: 'Google Calendar — pendiente' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-2)', textAlign: 'left' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontFamily: item.text.startsWith('Link:') ? 'var(--font-mono)' : 'inherit', color: item.text.startsWith('Link:') ? 'var(--terracotta)' : 'inherit', wordBreak: 'break-all' }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {waLink && (
        <button
          type="button"
          className="btn"
          style={{ marginTop: 20, padding: '9px 20px', fontSize: 13, color: 'var(--terracotta)', border: '1.5px solid var(--terracotta)', background: 'transparent' }}
          onClick={() => navigator.clipboard?.writeText(waLink)}
        >
          Copiar link de WhatsApp
        </button>
      )}

      <button
        className="btn btn-primary"
        onClick={() => router.push('/dashboard')}
        style={{ marginTop: 16, padding: '13px 32px', fontSize: 15, display: 'block', margin: '20px auto 0' }}
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
  const [profesionalSlug, setProfesionalSlug] = useState('');

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
        <div style={{ marginBottom: 40 }}>
          <Lockup size={18} gap={8} />
        </div>

        <StepProgress step={step} />

        <div className="card" style={{ padding: '28px 28px' }}>
          {step === 1 && <Step1 userId={userId} onNext={(data) => { setProfesionalSlug(data.slug); setStep(2); }} />}
          {step === 2 && <Step2 userId={userId} onNext={() => setStep(3)} />}
          {step === 3 && <Step3 slug={profesionalSlug} />}
        </div>
      </div>
    </div>
  );
}
