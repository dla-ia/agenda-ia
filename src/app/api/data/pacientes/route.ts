import { NextResponse } from 'next/server';
import { supabaseAdmin, PROFESIONAL_ID } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const [{ data: paciente }, { data: turnos }, { data: conversacion }] = await Promise.all([
      supabaseAdmin.from('pacientes').select('*').eq('id', id).single(),
      supabaseAdmin.from('turnos').select('*').eq('paciente_id', id).order('fecha_hora', { ascending: false }).limit(10),
      supabaseAdmin.from('conversaciones').select('*, mensajes(*)').eq('paciente_id', id).order('ultimo_mensaje_at', { ascending: false }).limit(1).single(),
    ]);
    return NextResponse.json({ paciente, turnos: turnos || [], conversacion });
  }

  const { data, error } = await supabaseAdmin
    .from('pacientes')
    .select('*, conversaciones(ultimo_mensaje, ultimo_mensaje_at), turnos(estado, fecha_hora)')
    .eq('profesional_id', PROFESIONAL_ID)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
