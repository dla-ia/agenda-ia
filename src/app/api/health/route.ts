import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Health check + keepalive de Supabase.
// El free-tier de Supabase pausa el proyecto tras ~1 semana sin actividad en
// la DB → el dominio deja de resolver y la app entera cae. Este endpoint hace
// un SELECT trivial; el workflow `keepalive.yml` lo pega un par de veces por
// día para que el timer de inactividad nunca llegue al límite.
export async function GET() {
  const { error } = await supabaseAdmin
    .from('profesionales')
    .select('id')
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
