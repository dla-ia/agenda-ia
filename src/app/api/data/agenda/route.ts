import { NextResponse } from 'next/server';
import { supabaseAdmin, PROFESIONAL_ID } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to required' }, { status: 400 });
  }

  // Convert Argentina date strings to UTC range (UTC-3, no DST)
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
    id:                t.id,
    fecha_hora:        t.fecha_hora,
    duracion_minutos:  t.duracion_minutos ?? 50,
    estado:            t.estado,
    paciente_nombre:   t.pacientes?.nombre ?? 'Sin nombre',
  }));

  return NextResponse.json(turnos);
}
