import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

export async function GET() {
  const id = await getProfesionalId();
  const { data, error } = await supabaseAdmin
    .from('profesionales')
    .select('nombre, email, especialidad, telefono, slug, google_calendar_token, google_calendar_id')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ...data,
    google_calendar_conectado: !!data.google_calendar_token,
  });
}

export async function PATCH(req: Request) {
  const id = await getProfesionalId();
  const body = await req.json();
  const { nombre, especialidad, telefono, slug } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nombre     !== undefined) updates.nombre     = nombre;
  if (especialidad !== undefined) updates.especialidad = especialidad;
  if (telefono   !== undefined) updates.telefono   = telefono || null;
  if (slug !== undefined) {
    const normalizedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : null;
    updates.slug = normalizedSlug || null;
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
