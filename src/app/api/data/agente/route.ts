import { NextResponse } from 'next/server';
import { supabaseAdmin, PROFESIONAL_ID } from '@/lib/supabase-admin';

const DEFAULTS: Record<string, string> = {
  agente_nombre: 'Aurora',
  agente_tono: 'warm',
  agente_saludo: 'Hola, qué lindo que te animes a dar este paso 🌱 Soy Aurora, la asistente del profesional. ¿Cómo te llamás?',
  agente_cierre: 'Cualquier duda, estoy por acá. ¡Te espero! 🌿',
  agente_frases_prohibidas: JSON.stringify(['diagnósticos', 'pronósticos', 'consejos médicos', 'promesas de resultado']),
  agente_reagenda_automatica: 'true',
  agente_confirma_24h: 'true',
  agente_lista_espera: 'false',
  agente_buffer_sesiones: 'true',
  agente_sena_monto: '8000',
  agente_sena_vencimiento: '2h',
  agente_sena_sin_pago: 'true',
};

export async function GET() {
  const { data } = await supabaseAdmin
    .from('configuraciones')
    .select('clave, valor')
    .eq('profesional_id', PROFESIONAL_ID);

  const config = { ...DEFAULTS };
  for (const row of (data ?? [])) {
    if (row.valor !== null) config[row.clave] = row.valor;
  }

  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const body: Record<string, string> = await req.json();

  const rows = Object.entries(body).map(([clave, valor]) => ({
    profesional_id: PROFESIONAL_ID,
    clave,
    valor: String(valor),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from('configuraciones')
    .upsert(rows, { onConflict: 'profesional_id,clave' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
