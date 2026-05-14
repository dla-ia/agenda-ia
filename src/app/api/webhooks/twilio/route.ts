import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateRequest } from 'twilio';
import { sendMessage, ConversationContext, Message } from '@/lib/claude-agent';

const SHARED_NUMBER = (process.env.TWILIO_PHONE_NUMBER ?? 'whatsapp:+14155238886')
  .replace('whatsapp:', '');
// ID del profesional de demo/desarrollo. En producción multi-tenant, si los 3 métodos
// de resolución fallan, se usa este fallback. Puede ser NEXT_PUBLIC_PROFESIONAL_ID
// (dev) o DEMO_PROFESIONAL_ID (env var dedicada en prod).
const FALLBACK_PROFESIONAL_ID =
  process.env.NEXT_PUBLIC_PROFESIONAL_ID ??
  process.env.DEMO_PROFESIONAL_ID ??
  '';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function twimlResponse(message: string): NextResponse {
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

// Detecta el slug del mensaje inicial (ej: "TURNO:garcia-psico Hola!")
// Retorna { slug, bodyLimpio } o null si no hay slug
function extraerSlug(body: string): { slug: string; bodyLimpio: string } | null {
  const match = body.match(/^TURNO:([a-z0-9_\-]+)\s*/i);
  if (!match) return null;
  return { slug: match[1].toLowerCase(), bodyLimpio: body.slice(match[0].length).trim() || 'Hola' };
}

async function resolverProfesionalId(
  supabase: SupabaseClient,
  body: string,
  telefono: string,
  toNumber: string
): Promise<{ profesionalId: string; bodyFinal: string }> {
  const toClean = toNumber.replace('whatsapp:', '');

  // 1. Número individual → buscar profesional por su twilio_number
  if (toClean !== SHARED_NUMBER) {
    const { data } = await supabase
      .from('profesionales')
      .select('id')
      .eq('twilio_number', toClean)
      .maybeSingle();
    if (data?.id) return { profesionalId: data.id, bodyFinal: body };
  }

  // 2. Número compartido con slug en el mensaje
  const slugData = extraerSlug(body);
  if (slugData) {
    const { data } = await supabase
      .from('profesionales')
      .select('id')
      .eq('slug', slugData.slug)
      .maybeSingle();
    if (data?.id) return { profesionalId: data.id, bodyFinal: slugData.bodyLimpio };
  }

  // 3. Conversación previa con ese teléfono (activa o completada)
  const { data: conv } = await supabase
    .from('conversaciones')
    .select('profesional_id')
    .eq('telefono', telefono)
    .order('ultimo_mensaje_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (conv?.profesional_id) return { profesionalId: conv.profesional_id, bodyFinal: body };

  // 4. Fallback env var (desarrollo / demo)
  return { profesionalId: FALLBACK_PROFESIONAL_ID, bodyFinal: body };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // ── Validar firma de Twilio (X-Twilio-Signature) ──────────────────────────
  // Sin esto cualquiera puede POSTear mensajes falsos: gasto en Claude API,
  // escrituras en DB y WhatsApp salientes. Falla cerrado.
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  const signature = request.headers.get('x-twilio-signature') ?? '';
  // Reconstruir la URL pública que Twilio firmó (detrás del proxy de Vercel
  // request.url puede traer host interno).
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host  = request.headers.get('host') ?? '';
  const publicUrl = `${proto}://${host}${new URL(request.url).pathname}`;
  const params: Record<string, string> = {};
  formData.forEach((value, key) => { params[key] = String(value); });

  if (!authToken || !validateRequest(authToken, signature, publicUrl, params)) {
    console.error('[Twilio webhook] Firma inválida', { publicUrl, hasSignature: !!signature, hasToken: !!authToken });
    return new NextResponse('Forbidden', { status: 403, headers: { 'Content-Type': 'text/plain' } });
  }

  const rawBody = (formData.get('Body') as string)?.trim();
  const from    = formData.get('From') as string;   // "whatsapp:+5491123456789"
  const to      = formData.get('To')   as string;   // "whatsapp:+14155238886" o número individual

  // Validación básica de campos requeridos de Twilio
  if (!rawBody || !from || !to) {
    return new NextResponse('Bad Request', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  // Verificar que el número origen tenga formato WhatsApp de Twilio
  if (!from.startsWith('whatsapp:+') && !from.startsWith('+')) {
    return new NextResponse('Bad Request', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  const telefono = from.replace('whatsapp:', '');
  const supabase = getAdminClient();

  try {
    const { profesionalId, bodyFinal: body } = await resolverProfesionalId(
      supabase, rawBody, telefono, to ?? ''
    );

    if (!profesionalId) return twimlResponse('No pude identificar al profesional. Por favor usá el link correcto.');

    // Buscar o crear conversación activa
    let { data: conversacion } = await supabase
      .from('conversaciones')
      .select('id')
      .eq('telefono', telefono)
      .eq('profesional_id', profesionalId)
      .eq('estado', 'activa')
      .maybeSingle();

    if (!conversacion) {
      const { data } = await supabase
        .from('conversaciones')
        .insert({
          profesional_id: profesionalId,
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
      contenido: rawBody,
      direccion: 'entrante',
    });

    // Historial (10 mensajes, evita contaminación)
    const { data: mensajesAnteriores } = await supabase
      .from('mensajes')
      .select('contenido, direccion')
      .eq('conversacion_id', conversacion!.id)
      .order('created_at', { ascending: true })
      .limit(10);

    const historial: Message[] = (mensajesAnteriores || [])
      .slice(0, -1)
      .map(m => ({
        role: m.direccion === 'entrante' ? 'user' : 'assistant',
        content: m.contenido,
      }));

    const context: ConversationContext = {
      profesionalId,
      conversacionId: conversacion!.id,
      telefono,
      historial,
    };
    const respuesta = await sendMessage(body, context);

    await Promise.all([
      supabase.from('mensajes').insert({
        conversacion_id: conversacion!.id,
        contenido: respuesta,
        direccion: 'saliente',
      }),
      supabase
        .from('conversaciones')
        .update({ ultimo_mensaje: respuesta, ultimo_mensaje_at: new Date().toISOString() })
        .eq('id', conversacion!.id),
    ]);

    return twimlResponse(respuesta);
  } catch (error) {
    console.error('[Twilio webhook]', error);
    return twimlResponse('Disculpá, tuve un problema técnico. Intentá de nuevo en un momento.');
  }
}
