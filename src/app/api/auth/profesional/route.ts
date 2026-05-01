import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET — verifica disponibilidad de slug
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.toLowerCase().trim();
  if (!slug || !/^[a-z0-9-]{3,40}$/.test(slug)) {
    return NextResponse.json({ available: false, reason: 'formato inválido' });
  }
  const { data } = await supabaseAdmin.from('profesionales').select('id').eq('slug', slug).maybeSingle();
  return NextResponse.json({ available: !data });
}

// POST — crea el registro en `profesionales` después del signUp en el cliente.
// El id debe coincidir con auth.uid() para que RLS funcione.
export async function POST(req: Request) {
  const { id, nombre, email, tipo_profesional } = await req.json();

  if (!id || !nombre || !email) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  // Mapear tipo_profesional a especialidad por defecto
  const especialidadMap: Record<string, string> = {
    psicologo:     'psicología clínica',
    odontologo:    'odontología general',
    medico:        'medicina general',
    nutricionista: 'nutrición clínica',
    kinesiologo:   'kinesiología',
    veterinario:   'veterinaria',
    mecanico:      'mecánica automotriz',
    otro:          'profesional independiente',
  };

  // Auto-confirmar el email via Admin API (service role bypasa la verificación)
  await supabaseAdmin.auth.admin.updateUserById(id, { email_confirm: true });

  const { error } = await supabaseAdmin.from('profesionales').insert({
    id,
    nombre,
    email,
    especialidad: especialidadMap[tipo_profesional] ?? especialidadMap.otro,
  });

  if (error) {
    // Si ya existe (re-registro), no es error fatal
    if (error.code === '23505') return NextResponse.json({ ok: true });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// PATCH — actualiza datos del profesional en el onboarding
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('profesionales')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
