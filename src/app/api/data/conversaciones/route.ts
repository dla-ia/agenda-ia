import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const profesionalId = await getProfesionalId();
  const { conversacion_id, mensaje } = await req.json();

  if (!conversacion_id || !mensaje?.trim()) {
    return NextResponse.json({ error: 'conversacion_id y mensaje son requeridos' }, { status: 400 });
  }

  // Verificar que la conversación pertenece al profesional
  const { data: conv } = await supabaseAdmin
    .from('conversaciones')
    .select('id, telefono')
    .eq('id', conversacion_id)
    .eq('profesional_id', profesionalId)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });

  // Guardar mensaje como saliente (enviado por el profesional)
  const { data: msgData, error: msgError } = await supabaseAdmin
    .from('mensajes')
    .insert({
      conversacion_id,
      contenido: mensaje.trim(),
      direccion: 'saliente',
    })
    .select('id, contenido, direccion, created_at')
    .single();

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  // Actualizar último mensaje en conversación
  await supabaseAdmin
    .from('conversaciones')
    .update({ ultimo_mensaje: mensaje.trim(), ultimo_mensaje_at: new Date().toISOString() })
    .eq('id', conversacion_id);

  // Enviar por Twilio WhatsApp (best-effort)
  const twilioSid   = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const rawFrom     = process.env.TWILIO_PHONE_NUMBER ?? 'whatsapp:+14155238886';
  const fromNumber  = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;

  if (twilioSid && twilioToken) {
    const phoneClean = conv.telefono.replace(/\D/g, '');
    const phoneE164  = phoneClean.startsWith('54') ? `+${phoneClean}` : `+54${phoneClean}`;
    try {
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
            Body: mensaje.trim(),
          }),
        }
      );
      if (!twilioRes.ok) {
        const err = await twilioRes.json();
        console.error('[conversaciones POST] Twilio error:', err);
      }
    } catch (e) {
      console.error('[conversaciones POST] Twilio exception:', e);
    }
  }

  return NextResponse.json({ ok: true, mensaje: msgData });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // si viene id, devuelve mensajes de esa conversación

  if (id) {
    const profesionalId = await getProfesionalId();
    // Verificar que la conversación pertenece al profesional antes de devolver mensajes
    const { data: conv } = await supabaseAdmin
      .from('conversaciones')
      .select('id')
      .eq('id', id)
      .eq('profesional_id', profesionalId)
      .maybeSingle();
    if (!conv) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });

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
