import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

function normalizarTelefono(tel: string): string {
  let clean = tel.replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('0')) clean = clean.slice(1);
  if (!clean.startsWith('+')) {
    if (!clean.startsWith('54')) clean = '54' + clean;
    clean = '+' + clean;
  }
  return clean;
}

export async function GET(req: Request) {
  const profesionalId = await getProfesionalId();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const [{ data: paciente }, { data: turnos }, { data: conversacion }] = await Promise.all([
      supabaseAdmin.from('pacientes').select('*').eq('id', id).eq('profesional_id', profesionalId).single(),
      supabaseAdmin.from('turnos').select('*').eq('paciente_id', id).eq('profesional_id', profesionalId).order('fecha_hora', { ascending: false }).limit(20),
      supabaseAdmin.from('conversaciones').select('*, mensajes(*)').eq('paciente_id', id).eq('profesional_id', profesionalId).order('ultimo_mensaje_at', { ascending: false }).limit(1).single(),
    ]);
    if (!paciente) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    return NextResponse.json({ paciente, turnos: turnos || [], conversacion });
  }

  const { data, error } = await supabaseAdmin
    .from('pacientes')
    .select('*, conversaciones(ultimo_mensaje, ultimo_mensaje_at), turnos(estado, fecha_hora)')
    .eq('profesional_id', profesionalId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const profesionalId = await getProfesionalId();
  const { nombre, telefono, email, mensajeInicial } = await req.json();
  if (!nombre || !telefono || !mensajeInicial) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const telefonoNorm = normalizarTelefono(telefono);
  const emailTrim = email?.trim() || null;

  let { data: paciente } = await supabaseAdmin
    .from('pacientes')
    .select('id')
    .eq('profesional_id', profesionalId)
    .eq('telefono', telefonoNorm)
    .maybeSingle();

  if (!paciente) {
    const insertData: Record<string, unknown> = { profesional_id: profesionalId, nombre, telefono: telefonoNorm };
    if (emailTrim) insertData.email = emailTrim;
    const { data, error } = await supabaseAdmin
      .from('pacientes')
      .insert(insertData)
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    paciente = data;
  } else if (emailTrim) {
    // Actualizar email si se proporcionó y el paciente ya existe
    await supabaseAdmin.from('pacientes').update({ email: emailTrim }).eq('id', paciente.id);
  }

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

  const { data: conv } = await supabaseAdmin
    .from('conversaciones')
    .insert({
      profesional_id: profesionalId,
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

export async function DELETE(req: Request) {
  const profesionalId = await getProfesionalId();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  // Cancelar turnos futuros pendientes/confirmados antes de eliminar
  await supabaseAdmin
    .from('turnos')
    .update({ estado: 'cancelado' })
    .eq('paciente_id', id)
    .eq('profesional_id', profesionalId)
    .in('estado', ['pendiente', 'confirmado'])
    .gte('fecha_hora', new Date().toISOString());

  const { error } = await supabaseAdmin
    .from('pacientes')
    .delete()
    .eq('id', id)
    .eq('profesional_id', profesionalId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
