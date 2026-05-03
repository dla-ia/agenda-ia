import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // si viene id, devuelve mensajes de esa conversación

  if (id) {
    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', id)
      .order('created_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const profesionalId = await getProfesionalId();
  const { data, error } = await supabaseAdmin
    .from('conversaciones')
    .select('*, pacientes(nombre)')
    .eq('profesional_id', profesionalId)
    .order('ultimo_mensaje_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
