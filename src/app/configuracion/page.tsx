'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

/* ── helpers ──────────────────────────────────────────── */
function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
      padding: '3px 9px', borderRadius: 99,
      background: ok ? 'rgba(138,161,118,0.15)' : 'rgba(180,140,90,0.12)',
      color: ok ? '#4E6B3A' : '#7A5A28',
      border: `1px solid ${ok ? 'rgba(138,161,118,0.4)' : 'rgba(180,140,90,0.3)'}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? '#6EA053' : '#B08040', flexShrink: 0 }} />
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{label}</span>
      {children}
    </label>
  );
}

function SaveFeedback({ state }: { state: 'idle' | 'saving' | 'ok' | 'error' }) {
  if (state === 'idle') return null;
  const map = {
    saving: { text: 'Guardando…',       color: 'var(--ink-3)' },
    ok:     { text: '✓ Guardado',        color: '#4E6B3A' },
    error:  { text: '✗ Error al guardar', color: '#B86A6A' },
  } as const;
  const { text, color } = map[state as keyof typeof map] ?? map.saving;
  return <span style={{ fontSize: 13, color }}>{text}</span>;
}

/* ── Card perfil ──────────────────────────────────────── */
function PerfilCard() {
  const [nombre, setNombre]           = useState('');
  const [especialidad, setEsp]        = useState('');
  const [telefono, setTelefono]       = useState('');
  const [slug, setSlug]               = useState('');
  const [originalSlug, setOrigSlug]   = useState('');
  const [slugStatus, setSlugStatus]   = useState<'idle'|'checking'|'ok'|'taken'|'invalid'>('idle');
  const [saveState, setSaveState]     = useState<'idle'|'saving'|'ok'|'error'>('idle');
  const slugTimer                     = useRef<ReturnType<typeof setTimeout>>();
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calendaria.com.ar';

  useEffect(() => {
    fetch('/api/data/configuracion')
      .then(r => r.json())
      .then(d => {
        setNombre(d.nombre ?? '');
        setEsp(d.especialidad ?? '');
        setTelefono(d.telefono ?? '');
        setSlug(d.slug ?? '');
        setOrigSlug(d.slug ?? '');
      });
  }, []);

  function handleSlugChange(val: string) {
    const v = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(v);
    if (v === originalSlug) { setSlugStatus('idle'); return; }
    if (v.length < 3 || v.length > 40) { setSlugStatus('invalid'); return; }
    clearTimeout(slugTimer.current);
    setSlugStatus('checking');
    slugTimer.current = setTimeout(async () => {
      const r = await fetch(`/api/auth/profesional?slug=${encodeURIComponent(v)}`);
      const j = await r.json();
      setSlugStatus(j.available ? 'ok' : 'taken');
    }, 400);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (slugStatus === 'taken' || slugStatus === 'invalid') return;
    setSaveState('saving');
    const normalizedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : '';
    const res = await fetch('/api/data/configuracion', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, especialidad, telefono, slug: normalizedSlug }),
    });
    const json = await res.json();
    if (json.error) {
      setSaveState('error');
      if (json.error.includes('slug')) setSlugStatus('taken');
    } else {
      setSaveState('ok');
      setOrigSlug(slug);
      setTimeout(() => setSaveState('idle'), 2500);
    }
  }

  const slugHint: Record<string, React.ReactNode> = {
    checking: <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Verificando…</span>,
    ok:       <span style={{ fontSize: 12, color: '#4E6B3A' }}>✓ Disponible</span>,
    taken:    <span style={{ fontSize: 12, color: '#B86A6A' }}>✗ Ya está en uso</span>,
    invalid:  <span style={{ fontSize: 12, color: '#B86A6A' }}>Mínimo 3 caracteres, solo letras, números y -</span>,
  };

  return (
    <div className="card" style={{ padding: '24px 28px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
        Mi perfil
      </h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre completo">
            <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Lic. María García" />
          </Field>
          <Field label="Especialidad">
            <input className="input" value={especialidad} onChange={e => setEsp(e.target.value)} placeholder="Psicología clínica" />
          </Field>
        </div>
        <Field label="Teléfono (opcional)">
          <input className="input" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+54 11 1234-5678" style={{ maxWidth: 240 }} />
        </Field>
        <div>
          <Field label="Tu link de WhatsApp (slug)">
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: 420 }}>
              <span style={{ padding: '9px 10px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap', userSelect: 'none' }}>
                {APP_URL}/w/
              </span>
              <input
                className="input"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="tu-nombre"
                style={{ borderRadius: '0 8px 8px 0', flex: 1, borderLeft: 'none' }}
              />
            </div>
          </Field>
          {slugStatus !== 'idle' && <div style={{ marginTop: 4 }}>{slugHint[slugStatus]}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saveState === 'saving' || slugStatus === 'taken' || slugStatus === 'invalid'}>
            Guardar cambios
          </button>
          <SaveFeedback state={saveState} />
        </div>
      </form>
    </div>
  );
}

/* ── Card cuenta ──────────────────────────────────────── */
function CuentaCard() {
  const supabase                  = createSupabaseBrowser();
  const [email, setEmail]         = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [saveState, setSaveState] = useState<'idle'|'saving'|'ok'|'error'>('idle');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleChangePass(e: React.FormEvent) {
    e.preventDefault();
    setPassError('');
    if (newPass.length < 8)      { setPassError('Mínimo 8 caracteres.'); return; }
    if (newPass !== confirmPass)  { setPassError('Las contraseñas no coinciden.'); return; }
    setSaveState('saving');
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      setSaveState('error');
      setPassError(error.message);
    } else {
      setSaveState('ok');
      setNewPass('');
      setConfirm('');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  }

  return (
    <div className="card" style={{ padding: '24px 28px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
        Mi cuenta
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Email">
          <input className="input" value={email} readOnly style={{ maxWidth: 320, background: 'var(--bg-2)', color: 'var(--ink-3)', cursor: 'default' }} />
        </Field>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: '0 0 14px' }}>Cambiar contraseña</p>
          <form onSubmit={handleChangePass} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
            <Field label="Nueva contraseña">
              <input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} required />
            </Field>
            <Field label="Confirmar contraseña">
              <input className="input" type="password" value={confirmPass} onChange={e => setConfirm(e.target.value)} placeholder="Repetí la contraseña" required />
            </Field>
            {passError && <span style={{ fontSize: 13, color: '#B86A6A' }}>{passError}</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saveState === 'saving'}>
                Cambiar contraseña
              </button>
              <SaveFeedback state={saveState} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── Card integraciones ───────────────────────────────── */
function IntegracionesCardInner({ profesionalId }: { profesionalId: string }) {
  const searchParams = useSearchParams();
  const [gcal, setGcal] = useState(false);
  const [googleMsg, setGoogleMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const g = searchParams.get('google');
    if (g === 'success') setGoogleMsg({ text: '✓ Google Calendar conectado correctamente', ok: true });
    if (g === 'error')   setGoogleMsg({ text: '✗ No se pudo conectar Google Calendar. Intentá de nuevo.', ok: false });
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/data/configuracion')
      .then(r => r.json())
      .then(d => setGcal(!!d.google_calendar_conectado));
  }, []);

  return (
    <div className="card" style={{ padding: '24px 28px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
        Integraciones
      </h2>
      {googleMsg && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: googleMsg.ok ? 'rgba(138,161,118,0.12)' : 'rgba(184,106,106,0.12)', color: googleMsg.ok ? '#4E6B3A' : '#8A3A3A', border: `1px solid ${googleMsg.ok ? 'rgba(138,161,118,0.4)' : 'rgba(184,106,106,0.4)'}` }}>
          {googleMsg.text}
        </div>
      )}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>Google Calendar</p>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>Los turnos se sincronizan automáticamente</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge ok={gcal} label={gcal ? 'Conectado' : 'No conectado'} />
            <a href={`/api/auth/google?profesionalId=${profesionalId}`} className="btn btn-ghost btn-sm" style={{ fontSize: 13 }}>
              {gcal ? 'Reconectar' : 'Conectar'}
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E7F8EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.918-1.419A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.31-1.268l-.31-.183-3.187.919.893-3.096-.201-.318A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>WhatsApp Business</p>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>Número compartido Twilio (+14155238886)</p>
            </div>
          </div>
          <Badge ok={true} label="Activo" />
        </div>
      </div>
    </div>
  );
}

function IntegracionesCard({ profesionalId }: { profesionalId: string }) {
  return (
    <Suspense fallback={null}>
      <IntegracionesCardInner profesionalId={profesionalId} />
    </Suspense>
  );
}

/* ── Página ───────────────────────────────────────────── */
export default function ConfiguracionPage() {
  const supabase = createSupabaseBrowser();
  const [profesionalId, setProfesionalId] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setProfesionalId(data.user.id);
    });
  }, []);

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Configuración
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>Gestioná tu perfil, cuenta e integraciones.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PerfilCard />
        <CuentaCard />
        <IntegracionesCard profesionalId={profesionalId} />
      </div>
    </div>
  );
}
