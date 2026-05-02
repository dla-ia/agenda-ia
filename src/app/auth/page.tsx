'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Lockup } from '@/components/brand/Lockup';

/* ── Tipos de profesional ──────────────────────────── */
const TIPOS = [
  { value: 'psicologo',     label: 'Psicólogo/a' },
  { value: 'odontologo',    label: 'Odontólogo/a' },
  { value: 'medico',        label: 'Médico/a' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'kinesiologo',   label: 'Kinesiólogo/a' },
  { value: 'veterinario',   label: 'Veterinario/a' },
  { value: 'mecanico',      label: 'Mecánico/a' },
  { value: 'otro',          label: 'Otro profesional' },
];

/* ── Logo ───────────────────────────────────────────── */
function Logo() {
  return <Lockup size={22} color="#FBF7F1" markColor="#FBF7F1" gap={10} />;
}

/* ── Alert ──────────────────────────────────────────── */
function Alert({ msg, type }: { msg: string; type: 'error' | 'info' }) {
  const bg = type === 'error' ? 'rgba(184,106,106,0.15)' : 'rgba(138,161,118,0.15)';
  const border = type === 'error' ? '#B86A6A' : '#8AA176';
  const color = type === 'error' ? '#8A3A3A' : '#4E6B3A';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color, lineHeight: 1.5 }}>
      {msg}
    </div>
  );
}

/* ── Página ─────────────────────────────────────────── */
export default function AuthPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: 'error' | 'info' } | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regNombre, setRegNombre] = useState('');
  const [regTipo, setRegTipo] = useState('psicologo');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setAlert({ msg: 'Email o contraseña incorrectos.', type: 'error' });
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (regPassword.length < 8) {
      setAlert({ msg: 'La contraseña debe tener al menos 8 caracteres.', type: 'error' });
      return;
    }
    setLoading(true);
    setAlert(null);

    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (error) {
      setAlert({ msg: error.message, type: 'error' });
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setAlert({ msg: 'Verificá tu email para confirmar la cuenta.', type: 'info' });
      setLoading(false);
      return;
    }

    // Crear registro en profesionales
    const res = await fetch('/api/auth/profesional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, nombre: regNombre, email: regEmail, tipo_profesional: regTipo }),
    });

    if (!res.ok) {
      setAlert({ msg: 'Error al crear tu cuenta. Intentá de nuevo.', type: 'error' });
      setLoading(false);
      return;
    }

    router.push('/onboarding');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Panel izquierdo (branding) ── */}
      <div
        style={{
          flex: '0 0 480px',
          background: 'linear-gradient(160deg, #2C241D 0%, #3D2E24 60%, #C26A4A 150%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
          <svg width="100%" height="100%">
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <Logo />

        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 500, color: '#FBF7F1', letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 20px' }}>
            Tu agenda, en<br />piloto automático.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(251,247,241,0.65)', lineHeight: 1.65, margin: '0 0 32px', maxWidth: 320 }}>
            Cualquier profesional puede tener un agente IA que gestiona turnos, cobra señas y envía recordatorios por WhatsApp — sin hacer nada.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '💬', text: 'Atiende WhatsApp 24/7' },
              { icon: '📅', text: 'Reserva y cancela turnos solo' },
              { icon: '💳', text: 'Cobra señas con MercadoPago' },
              { icon: '🔔', text: 'Recordatorios automáticos' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,248,240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(251,247,241,0.8)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(251,247,241,0.3)', margin: 0 }}>
          © 2026 Calendaria · Para profesionales independientes
        </p>
      </div>

      {/* ── Panel derecho (formulario) ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #C26A4A 0%, #A95838 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Calendaria</span>
            </div>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: 10, padding: 4, marginBottom: 28, border: '1px solid var(--line)' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setAlert(null); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  background: mode === m ? 'var(--surface-2)' : 'transparent',
                  color: mode === m ? 'var(--ink)' : 'var(--ink-3)',
                  boxShadow: mode === m ? '0 1px 3px rgba(44,36,29,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {m === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {/* Alert */}
          {alert && <div style={{ marginBottom: 16 }}><Alert {...alert} /></div>}

          {/* ── Login form ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label className="field">
                <span>Email</span>
                <input
                  className="input" type="email" required autoFocus
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Contraseña</span>
                <input
                  className="input" type="password" required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 4, width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 15 }}
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-3)', margin: 0 }}>
                ¿No tenés cuenta?{' '}
                <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terracotta)', fontWeight: 500, padding: 0, fontSize: 12.5 }}>
                  Creá la tuya gratis
                </button>
              </p>
            </form>
          )}

          {/* ── Register form ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label className="field">
                <span>Tu nombre completo</span>
                <input
                  className="input" type="text" required autoFocus
                  placeholder="Lic. María García"
                  value={regNombre}
                  onChange={e => setRegNombre(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Profesión</span>
                <select className="input" value={regTipo} onChange={e => setRegTipo(e.target.value)}>
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  className="input" type="email" required
                  placeholder="tu@email.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Contraseña</span>
                <input
                  className="input" type="password" required minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 4, width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 15 }}
              >
                {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
                Al registrarte aceptás los términos del servicio.<br />
                ¿Ya tenés cuenta?{' '}
                <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terracotta)', fontWeight: 500, padding: 0, fontSize: 11.5 }}>
                  Ingresá acá
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
