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
  const [configResult, profResult] = await Promise.all([
    supabaseAdmin
      .from('configuraciones')
      .select('clave, valor')
      .eq('profesional_id', PROFESIONAL_ID),
    supabaseAdmin
      .from('profesionales')
      .select('horario_inicio, horario_fin, dias_laborables')
      .eq('id', PROFESIONAL_ID)
      .single(),
  ]);

  const config = { ...DEFAULTS };
  for (const row of (configResult.data ?? [])) {
    if (row.valor !== null) config[row.clave] = row.valor;
  }

  // Expose profesionales schedule fields for UI initialization
  if (profResult.data) {
    config._horario_inicio   = profResult.data.horario_inicio ?? '09:00';
    config._horario_fin      = profResult.data.horario_fin    ?? '19:00';
    config._dias_laborables  = JSON.stringify(profResult.data.dias_laborables ?? [1, 2, 3, 4, 5]);
  }

  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const body: Record<string, string> = await req.json();

  // Sync horarios to profesionales table so the agent uses updated schedule
  if (body.agente_horarios) {
    try {
      const horarios: Record<string, { activo: boolean; inicio: string; fin: string }> = JSON.parse(body.agente_horarios);
      const DIA_NUM: Record<string, number> = {
        lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0,
      };
      const diasActivos = Object.entries(horarios)
        .filter(([, v]) => v.activo)
        .map(([k]) => DIA_NUM[k])
        .filter(n => n !== undefined);

      // Use first active day's hours as the uniform schedule for the agent
      const primerActivo = Object.values(horarios).find(h => h.activo);
      if (primerActivo) {
        await supabaseAdmin
          .from('profesionales')
          .update({
            horario_inicio:   primerActivo.inicio,
            horario_fin:      primerActivo.fin,
            dias_laborables:  diasActivos,
            updated_at:       new Date().toISOString(),
          })
          .eq('id', PROFESIONAL_ID);
      }
    } catch {}
  }

  const rows = Object.entries(body)
    .filter(([k]) => !k.startsWith('_'))
    .map(([clave, valor]) => ({
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
