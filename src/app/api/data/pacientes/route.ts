import { NextResponse } from 'next/server';
import { supabaseAdmin, PROFESIONAL_ID } from '@/lib/supabase-admin';

function normalizarTelefono(tel: string): string {
  let clean = tel.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('0')) clean = clean.slice(1);
  if (!clean.startsWith('+')) {
    if (!clean.startsWith('54')) clean = '54' + clean;
    clean = '+' + clean;
  }
  return clean;
}

export async function POST(req: Request) {
  const { nombre, telefono, mensajeInicial } = await req.json();
  if (!nombre || !telefono || !mensajeInicial) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const telefonoNorm = normalizarTelefono(telefono);

  // Buscar o crear paciente
  let { data: paciente } = await supabaseAdmin
    .from('pacientes')
    .select('id')
    .eq('profesional_id', PROFESIONAL_ID)
    .eq('telefono', telefonoNorm)
    .maybeSingle();

  if (!paciente) {
    const { data, error } = await supabaseAdmin
      .from('pacientes')
      .insert({ profesional_id: PROFESIONAL_ID, nombre, telefono: telefonoNorm })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    paciente = data;
  }

  // Enviar WhatsApp via Twilio REST
  const sid   = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from  = process.env.TWILIO_PHONE_NUMBER ?? 'whatsapp:+14155238886';

  const twilioRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
        To:   `whatsapp:${telefonoNorm}`,
        Body: mensajeInicial,
      }).toString(),
    }
  );

  if (!twilioRes.ok) {
    const err = await twilioRes.text();
    console.error('[Twilio outbound]', err);
    return NextResponse.json({ error: 'No se pudo enviar el WhatsApp', detalle: err }, { status: 502 });
  }

  // Crear conversación y guardar mensaje saliente
  const { data: conv } = await supabaseAdmin
    .from('conversaciones')
    .insert({
      profesional_id: PROFESIONAL_ID,
      paciente_id: paciente!.id,
      telefono: telefonoNorm,
      estado: 'activa',
      ultimo_mensaje: mensajeInicial,
      ultimo_mensaje_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (conv) {
    await supabaseAdmin.from('mensajes').insert({
      conversacion_id: conv.id,
      contenido: mensajeInicial,
      direccion: 'saliente',
    });
  }

  return NextResponse.json({ ok: true, paciente });
}

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
