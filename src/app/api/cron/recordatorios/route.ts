import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const CRON_SECRET = process.env.CRON_SECRET ?? '';

function formatArgentineDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

async function sendWhatsApp(telefono: string, mensaje: string) {
  const phoneClean = telefono.replace(/\D/g, '');
  const phoneE164 = phoneClean.startsWith('54') ? `+${phoneClean}` : `+54${phoneClean}`;

  const twilioSid   = process.env.TWILIO_ACCOUNT_SID!;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN!;
  const rawFrom     = process.env.TWILIO_PHONE_NUMBER ?? 'whatsapp:+14155238886';
  const fromNumber  = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To:   `whatsapp:${phoneE164}`,
        Body: mensaje,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Twilio error: ${JSON.stringify(err)}`);
  }

  return phoneE164;
}

export async function GET(req: Request) {
  // Validate secret — GitHub Actions sends it as query param
  const { searchParams } = new URL(req.url);
  const secret = req.headers.get('x-cron-secret') ?? searchParams.get('secret') ?? '';

  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results = { enviados_24h: 0, enviados_2h: 0, errores: 0 };

  // --- Recordatorio 24h ---
  const ventana24h_desde = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const ventana24h_hasta = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const { data: turnos24h } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, pacientes(nombre, telefono), profesionales(nombre)')
    .gte('fecha_hora', ventana24h_desde.toISOString())
    .lte('fecha_hora', ventana24h_hasta.toISOString())
    .in('estado', ['pendiente', 'confirmado'])
    .eq('recordatorio_24h_enviado', false);

  for (const turno of turnos24h ?? []) {
    const paciente = (turno as any).pacientes;
    const profesional = (turno as any).profesionales;
    const telefono: string = paciente?.telefono ?? '';

    if (!telefono || telefono.startsWith('manual-')) continue;

    try {
      const mensaje = `Hola ${paciente?.nombre ?? ''}! 👋 Te recuerdo que mañana tenés tu turno con ${profesional?.nombre ?? 'el profesional'}.\n\n📅 ${formatArgentineDate(turno.fecha_hora)}\n\nSi necesitás cancelar o reprogramar, avisame por acá. 🌿`;
      await sendWhatsApp(telefono, mensaje);
      await supabaseAdmin.from('turnos').update({ recordatorio_24h_enviado: true }).eq('id', turno.id);
      results.enviados_24h++;
    } catch (err) {
      console.error(`[cron] Error recordatorio 24h turno ${turno.id}:`, err);
      results.errores++;
    }
  }

  // --- Recordatorio 2h ---
  const ventana2h_desde = new Date(now.getTime() + 90 * 60 * 1000);
  const ventana2h_hasta = new Date(now.getTime() + 150 * 60 * 1000);

  const { data: turnos2h } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, pacientes(nombre, telefono), profesionales(nombre)')
    .gte('fecha_hora', ventana2h_desde.toISOString())
    .lte('fecha_hora', ventana2h_hasta.toISOString())
    .in('estado', ['pendiente', 'confirmado'])
    .eq('recordatorio_2h_enviado', false);

  for (const turno of turnos2h ?? []) {
    const paciente = (turno as any).pacientes;
    const profesional = (turno as any).profesionales;
    const telefono: string = paciente?.telefono ?? '';

    if (!telefono || telefono.startsWith('manual-')) continue;

    try {
      const mensaje = `Hola ${paciente?.nombre ?? ''}! ⏰ En 2 horas tenés tu turno con ${profesional?.nombre ?? 'el profesional'}.\n\n📅 ${formatArgentineDate(turno.fecha_hora)}\n\n¡Te esperamos!`;
      await sendWhatsApp(telefono, mensaje);
      await supabaseAdmin.from('turnos').update({ recordatorio_2h_enviado: true }).eq('id', turno.id);
      results.enviados_2h++;
    } catch (err) {
      console.error(`[cron] Error recordatorio 2h turno ${turno.id}:`, err);
      results.errores++;
    }
  }

  console.log(`[cron/recordatorios] ${now.toISOString()}`, results);
  return NextResponse.json({ ok: true, ...results });
}
