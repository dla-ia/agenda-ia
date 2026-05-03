import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET ?? '';

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

export async function POST(req: Request) {
  // Validate secret header
  const authHeader = req.headers.get('x-webhook-secret') ?? '';
  if (WEBHOOK_SECRET && authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { turno_id, tipo } = body as { turno_id: string; tipo: '24h' | '2h' };

  if (!turno_id || !['24h', '2h'].includes(tipo)) {
    return NextResponse.json({ error: 'turno_id y tipo (24h|2h) requeridos' }, { status: 400 });
  }

  // Fetch turno + paciente + profesional
  const { data: turno, error } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, estado, pacientes(nombre, telefono), profesionales(nombre_profesional, slug)')
    .eq('id', turno_id)
    .single();

  if (error || !turno) {
    return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
  }

  if (turno.estado === 'cancelado' || turno.estado === 'completado') {
    return NextResponse.json({ ok: true, skipped: true, reason: `turno ${turno.estado}` });
  }

  const paciente = (turno as any).pacientes;
  const profesional = (turno as any).profesionales;
  const telefono: string = paciente?.telefono ?? '';

  // Don't send to manual placeholder phones
  if (!telefono || telefono.startsWith('manual-')) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'sin teléfono real' });
  }

  const fechaFormateada = formatArgentineDate(turno.fecha_hora);
  const nombreProf = profesional?.nombre_profesional ?? 'el profesional';

  const mensaje =
    tipo === '24h'
      ? `Hola ${paciente?.nombre ?? ''}! 👋 Te recuerdo que mañana tenés tu turno con ${nombreProf}.\n\n📅 ${fechaFormateada}\n\nSi necesitás cancelar o reprogramar, avisame por acá. 🌿`
      : `Hola ${paciente?.nombre ?? ''}! ⏰ En 2 horas tenés tu turno con ${nombreProf}.\n\n📅 ${fechaFormateada}\n\n¡Te esperamos!`;

  // Format phone for Twilio: add country code if needed
  const phoneClean = telefono.replace(/\D/g, '');
  const phoneE164 =
    phoneClean.startsWith('54') ? `+${phoneClean}` : `+54${phoneClean}`;

  const twilioSid   = process.env.TWILIO_ACCOUNT_SID!;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN!;
  const fromNumber  = process.env.TWILIO_PHONE_NUMBER!;

  const twilioRes = await fetch(
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

  if (!twilioRes.ok) {
    const err = await twilioRes.json();
    console.error('[n8n webhook] Twilio error:', err);
    return NextResponse.json({ error: 'Error enviando WhatsApp', detail: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true, tipo, paciente: paciente?.nombre, telefono: phoneE164 });
}
