import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistio'];

export async function GET(req: Request) {
  const profesionalId = await getProfesionalId();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  if (!from || !to) return NextResponse.json({ error: 'from and to required' }, { status: 400 });

  const fromUTC = new Date(`${from}T00:00:00-03:00`).toISOString();
  const toUTC   = new Date(`${to}T23:59:59-03:00`).toISOString();

  const { data, error } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, estado, pacientes(nombre)')
    .eq('profesional_id', profesionalId)
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
  const profesionalId = await getProfesionalId();
  const { nombre_paciente, fecha_hora, duracion_minutos, notas } = await req.json();

  if (!nombre_paciente?.trim() || !fecha_hora) {
    return NextResponse.json({ error: 'nombre_paciente y fecha_hora son requeridos' }, { status: 400 });
  }

  const durMin = Number(duracion_minutos) || 50;

  // Verificar solapamiento
  const newStart = new Date(fecha_hora).getTime();
  const newEnd   = newStart + durMin * 60 * 1000;
  const dayStart = new Date(newStart); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(newStart); dayEnd.setHours(23, 59, 59, 999);

  const { data: turnosDelDia } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, pacientes(nombre)')
    .eq('profesional_id', profesionalId)
    .in('estado', ['pendiente', 'confirmado'])
    .gte('fecha_hora', dayStart.toISOString())
    .lte('fecha_hora', dayEnd.toISOString());

  const solapado = (turnosDelDia ?? []).find((t: any) => {
    const tStart = new Date(t.fecha_hora).getTime();
    const tEnd   = tStart + (t.duracion_minutos ?? 50) * 60 * 1000;
    return newStart < tEnd && newEnd > tStart;
  });

  if (solapado) {
    const nombre = (solapado as any).pacientes?.nombre ?? 'otro paciente';
    return NextResponse.json(
      { error: `Horario ocupado — ya hay un turno de ${nombre} en ese momento` },
      { status: 409 }
    );
  }

  // Buscar o crear paciente
  const { data: existente } = await supabaseAdmin
    .from('pacientes')
    .select('id')
    .eq('profesional_id', profesionalId)
    .ilike('nombre', nombre_paciente.trim())
    .maybeSingle();

  let pacienteId = existente?.id;

  if (!pacienteId) {
    const { data: nuevo } = await supabaseAdmin
      .from('pacientes')
      .insert({ profesional_id: profesionalId, nombre: nombre_paciente.trim(), telefono: `manual-${Date.now()}` })
      .select('id')
      .single();
    pacienteId = nuevo?.id;
  }

  const { data, error } = await supabaseAdmin
    .from('turnos')
    .insert({
      profesional_id:   profesionalId,
      paciente_id:      pacienteId,
      fecha_hora,
      duracion_minutos: durMin,
      estado:           'confirmado',
      notas:            notas?.trim() || null,
    })
    .select('id, fecha_hora, duracion_minutos, estado')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, turno: { ...data, paciente_nombre: nombre_paciente.trim() } });
}

export async function PATCH(req: Request) {
  const profesionalId = await getProfesionalId();
  const { id, estado } = await req.json();
  if (!id || !estado) return NextResponse.json({ error: 'id y estado requeridos' }, { status: 400 });
  if (!ESTADOS_VALIDOS.includes(estado)) return NextResponse.json({ error: 'estado inválido' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('turnos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profesional_id', profesionalId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
