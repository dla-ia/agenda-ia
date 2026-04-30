import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMessage, ConversationContext, Message } from '@/lib/claude-agent';

const PROFESIONAL_ID = process.env.NEXT_PUBLIC_PROFESIONAL_ID!;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function twimlResponse(message: string): NextResponse {
  // Escapar caracteres especiales XML
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body = (formData.get('Body') as string)?.trim();
  const from = formData.get('From') as string; // "whatsapp:+5491123456789"

  if (!body || !from) {
    return twimlResponse('Mensaje vacío.');
  }

  const telefono = from.replace('whatsapp:', '');
  const supabase = getAdminClient();

  try {
    // Buscar o crear conversación
    let { data: conversacion } = await supabase
      .from('conversaciones')
      .select('id')
      .eq('telefono', telefono)
      .eq('profesional_id', PROFESIONAL_ID)
      .eq('estado', 'activa')
      .maybeSingle();

    if (!conversacion) {
      const { data } = await supabase
        .from('conversaciones')
        .insert({
          profesional_id: PROFESIONAL_ID,
          telefono,
          estado: 'activa',
          ultimo_mensaje: body,
          ultimo_mensaje_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      conversacion = data;
    }

    // Guardar mensaje entrante
    await supabase.from('mensajes').insert({
      conversacion_id: conversacion!.id,
      contenido: body,
      direccion: 'entrante',
    });

    // Obtener historial previo (sin el mensaje actual)
    const { data: mensajesAnteriores } = await supabase
      .from('mensajes')
      .select('contenido, direccion')
      .eq('conversacion_id', conversacion!.id)
      .order('created_at', { ascending: true })
      .limit(21);

    const historial: Message[] = (mensajesAnteriores || [])
      .slice(0, -1) // excluir el último (recién guardado)
      .map(m => ({
        role: m.direccion === 'entrante' ? 'user' : 'assistant',
        content: m.contenido,
      }));

    // Procesar con Claude
    const context: ConversationContext = {
      profesionalId: PROFESIONAL_ID,
      telefono,
      historial,
    };
    const respuesta = await sendMessage(body, context);

    // Guardar respuesta y actualizar conversación
    await Promise.all([
      supabase.from('mensajes').insert({
        conversacion_id: conversacion!.id,
        contenido: respuesta,
        direccion: 'saliente',
      }),
      supabase
        .from('conversaciones')
        .update({
          ultimo_mensaje: respuesta,
          ultimo_mensaje_at: new Date().toISOString(),
        })
        .eq('id', conversacion!.id),
    ]);

    return twimlResponse(respuesta);
  } catch (error) {
    console.error('[Twilio webhook]', error);
    return twimlResponse('Disculpá, tuve un problema técnico. Intentá de nuevo en un momento.');
  }
}
