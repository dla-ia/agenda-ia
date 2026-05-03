import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Webhook de MercadoPago
 * MP envía POST con { topic: 'payment', id: '...' } cuando ocurre un pago.
 * Siempre retorna 200 — si devuelve otro código, MP reintenta.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};

  try {
    body = await req.json();
  } catch {
    // MP a veces envía query params en lugar de JSON (notificaciones IPN legacy)
    const url = new URL(req.url);
    body = {
      topic: url.searchParams.get('topic') ?? '',
      id:    url.searchParams.get('id') ?? '',
    };
  }

  const { topic, id } = body;

  // Solo procesar notificaciones de pago
  if (topic !== 'payment' || !id) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'topic no es payment' });
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  // Sin token: no podemos verificar el pago — responder 200 para que MP no reintente
  if (!mpToken) {
    console.warn('[MP webhook] MERCADOPAGO_ACCESS_TOKEN no configurado');
    return NextResponse.json({ ok: true, skipped: true, reason: 'token no configurado' });
  }

  try {
    // Obtener detalle del pago desde la API de MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });

    if (!mpRes.ok) {
      console.error('[MP webhook] Error consultando pago:', await mpRes.text());
      return NextResponse.json({ ok: true, skipped: true, reason: 'error consultando pago MP' });
    }

    const pago = await mpRes.json();
    const { status, external_reference: turnoId, id: mpPaymentId } = pago;

    if (!turnoId) {
      console.warn('[MP webhook] Pago sin external_reference (turno_id):', mpPaymentId);
      return NextResponse.json({ ok: true, skipped: true, reason: 'sin external_reference' });
    }

    // Solo procesar pagos aprobados
    if (status !== 'approved') {
      console.log(`[MP webhook] Pago ${mpPaymentId} no aprobado (status: ${status}), ignorando`);
      return NextResponse.json({ ok: true, skipped: true, reason: `status: ${status}` });
    }

    // Actualizar turno a 'confirmado' y agregar nota de pago
    const { error: turnoError } = await supabaseAdmin
      .from('turnos')
      .update({
        estado:      'confirmado',
        notas:       `Seña cobrada via MercadoPago. Payment ID: ${mpPaymentId}`,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', turnoId);

    if (turnoError) {
      console.error('[MP webhook] Error actualizando turno:', turnoError);
    }

    // Actualizar registro en tabla pagos (si existe la preferencia)
    const { error: pagoError } = await supabaseAdmin
      .from('pagos')
      .update({
        estado:                    'pagado',
        mercado_pago_payment_id:   String(mpPaymentId),
        fecha_pago:                new Date().toISOString(),
        updated_at:                new Date().toISOString(),
      })
      .eq('turno_id', turnoId)
      .eq('estado', 'pendiente');

    if (pagoError) {
      // No es crítico si no existía fila en pagos (ej: creado manualmente)
      console.warn('[MP webhook] No se pudo actualizar tabla pagos:', pagoError.message);
    }

    console.log(`[MP webhook] Pago aprobado — turno ${turnoId} confirmado`);
    return NextResponse.json({ ok: true, turnoId, mpPaymentId });

  } catch (e) {
    console.error('[MP webhook] Excepción inesperada:', e);
    // Retornar 200 igual — MP no debe reintentar por errores internos nuestros
    return NextResponse.json({ ok: true, skipped: true, reason: 'excepcion interna' });
  }
}
