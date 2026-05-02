import { NextResponse } from 'next/server';
import { supabaseAdmin, PROFESIONAL_ID } from '@/lib/supabase-admin';

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistio'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  const fromUTC = new Date(`${from}T00:00:00-03:00`).toISOString();
  const toUTC   = new Date(`${to}T23:59:59-03:00`).toISOString();

  const { data, error } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, estado, pacientes(nombre)')
    .eq('profesional_id', PROFESIONAL_ID)
    .gte('fecha_hora', fromUTC)
    .lte('fecha_hora', toUTC)
    .order('fecha_hora', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const turnos = (data ?? []).map((t: any) => ({
    id:               t.id,
    fecha_hora:       t.fecha_hora,
    duracion_minutos: t.duracion_minutos ?? 50,
    estado:           t.estado,
    paciente_nombre:  t.pacientes?.nombre ?? 'Sin nombre',
  }));

  return NextResponse.json(turnos);
}

export async function POST(req: Request) {
  const { nombre_paciente, fecha_hora, duracion_minutos, notas } = await req.json();

  if (!nombre_paciente?.trim() || !fecha_hora) {
    return NextResponse.json({ error: 'nombre_paciente y fecha_hora son requeridos' }, { status: 400 });
  }

  // Buscar paciente existente por nombre (case-insensitive)
  const { data: existente } = await supabaseAdmin
    .from('pacientes')
    .select('id')
    .eq('profesional_id', PROFESIONAL_ID)
    .ilike('nombre', nombre_paciente.trim())
    .maybeSingle();

  let pacienteId = existente?.id;

  if (!pacienteId) {
    const { data: nuevo } = await supabaseAdmin
      .from('pacientes')
      .insert({
        profesional_id: PROFESIONAL_ID,
        nombre: nombre_paciente.trim(),
        telefono: `manual-${Date.now()}`,
      })
      .select('id')
      .single();
    pacienteId = nuevo?.id;
  }

  const { data, error } = await supabaseAdmin
    .from('turnos')
    .insert({
      profesional_id:   PROFESIONAL_ID,
      paciente_id:      pacienteId,
      fecha_hora,
      duracion_minutos: Number(duracion_minutos) || 50,
      estado:           'confirmado',
      notas:            notas?.trim() || null,
    })
    .select('id, fecha_hora, duracion_minutos, estado')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    turno: {
      ...data,
      paciente_nombre: nombre_paciente.trim(),
    },
  });
}

export async function PATCH(req: Request) {
  const { id, estado } = await req.json();

  if (!id || !estado) {
    return NextResponse.json({ error: 'id y estado requeridos' }, { status: 400 });
  }
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: 'estado inválido' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('turnos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
