import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

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

  // Verificar sesión: el `id` enviado debe ser el del usuario autenticado.
  // Sin esto, un request anónimo podría confirmar emails ajenos (updateUserById)
  // o insertar filas en `profesionales` con una PK arbitraria.
  const sessionId = await getProfesionalId();
  if (!sessionId || sessionId !== id) {
    return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });
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

// PATCH — actualiza datos del profesional en el onboarding.
// Columnas con whitelist explícita — nunca spread del body: el spread permitía
// mass-assignment a `slug`, `twilio_*`, `mercado_pago_access_token`, etc.
export async function PATCH(req: Request) {
  const id = await getProfesionalId();
  if (!id) return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });

  const body = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.nombre !== undefined) updates.nombre = body.nombre;
  if (body.especialidad !== undefined) updates.especialidad = body.especialidad;
  if (body.telefono !== undefined) updates.telefono = body.telefono || null;
  if (body.duracion_sesion_minutos !== undefined) {
    updates.duracion_sesion_minutos = Number(body.duracion_sesion_minutos) || null;
  }
  if (body.horario_inicio !== undefined) updates.horario_inicio = body.horario_inicio;
  if (body.horario_fin !== undefined) updates.horario_fin = body.horario_fin;
  if (body.slug !== undefined) {
    updates.slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || null
      : null;
  }

  const { error } = await supabaseAdmin
    .from('profesionales')
    .update(updates)
    .eq('id', id);

  if (error) {
    if (error.message.toLowerCase().includes('slug')) {
      return NextResponse.json({ error: 'Ese slug ya está en uso, elegí otro.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
