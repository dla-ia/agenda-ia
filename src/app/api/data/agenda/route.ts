import { NextResponse } from 'next/server';
import { supabaseAdmin, getProfesionalId } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'cancelado', 'completado', 'no_asistio'];

// Escapa texto controlado por el usuario antes de interpolarlo en HTML (email).
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(req: Request) {
  const profesionalId = await getProfesionalId();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');

  if (!from || !to) return NextResponse.json({ error: 'from and to required' }, { status: 400 });

  const fromUTC = new Date(`${from}T00:00:00-03:00`).toISOString();
  const toUTC   = new Date(`${to}T23:59:59-03:00`).toISOString();

  const { data, error } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, estado, pacientes(nombre)')
    .eq('profesional_id', profesionalId)
    .gte('fecha_hora', fromUTC)
    .lte('fecha_hora', toUTC)
    .order('fecha_hora', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const turnos = (data ?? []).map((t: any) => ({
    id:               t.id,
    fecha_hora:       t.fecha_hora,
    duracion_minutos: t.duracion_minutos ?? 50,
    estado:           t.estado,
    paciente_nombre:  t.pacientes?.nombre ?? 'Sin nombre',
  }));

  return NextResponse.json(turnos);
}

export async function POST(req: Request) {
  const profesionalId = await getProfesionalId();
  const { nombre_paciente, fecha_hora, duracion_minutos, notas } = await req.json();

  if (!nombre_paciente?.trim() || !fecha_hora) {
    return NextResponse.json({ error: 'nombre_paciente y fecha_hora son requeridos' }, { status: 400 });
  }

  // Validar fecha — sin esto una fecha inválida da NaN y saltea el chequeo de solapamiento.
  if (isNaN(new Date(fecha_hora).getTime())) {
    return NextResponse.json({ error: 'fecha_hora inválida' }, { status: 400 });
  }

  const durMin = Number(duracion_minutos) || 50;

  // Verificar solapamiento
  const newStart = new Date(fecha_hora).getTime();
  const newEnd   = newStart + durMin * 60 * 1000;
  const dayStart = new Date(newStart); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(newStart); dayEnd.setHours(23, 59, 59, 999);

  const { data: turnosDelDia } = await supabaseAdmin
    .from('turnos')
    .select('id, fecha_hora, duracion_minutos, pacientes(nombre)')
    .eq('profesional_id', profesionalId)
    .in('estado', ['pendiente', 'confirmado'])
    .gte('fecha_hora', dayStart.toISOString())
    .lte('fecha_hora', dayEnd.toISOString());

  const solapado = (turnosDelDia ?? []).find((t: any) => {
    const tStart = new Date(t.fecha_hora).getTime();
    const tEnd   = tStart + (t.duracion_minutos ?? 50) * 60 * 1000;
    return newStart < tEnd && newEnd > tStart;
  });

  if (solapado) {
    const nombre = (solapado as any).pacientes?.nombre ?? 'otro paciente';
    return NextResponse.json(
      { error: `Horario ocupado — ya hay un turno de ${nombre} en ese momento` },
      { status: 409 }
    );
  }

  // Buscar o crear paciente
  const { data: existente } = await supabaseAdmin
    .from('pacientes')
    .select('id')
    .eq('profesional_id', profesionalId)
    .ilike('nombre', nombre_paciente.trim())
    .maybeSingle();

  let pacienteId = existente?.id;

  if (!pacienteId) {
    const { data: nuevo } = await supabaseAdmin
      .from('pacientes')
      .insert({ profesional_id: profesionalId, nombre: nombre_paciente.trim(), telefono: `manual-${Date.now()}` })
      .select('id')
      .single();
    pacienteId = nuevo?.id;
  }

  const { data, error } = await supabaseAdmin
    .from('turnos')
    .insert({
      profesional_id:   profesionalId,
      paciente_id:      pacienteId,
      fecha_hora,
      duracion_minutos: durMin,
      estado:           'confirmado',
      notas:            notas?.trim() || null,
    })
    .select('id, fecha_hora, duracion_minutos, estado')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const turnoId         = data.id;
  let mp_init_point: string | null = null;

  // ── MercadoPago: generar preferencia de pago (si hay token configurado) ──
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (mpToken) {
    try {
      // Obtener tarifa del profesional (primera tarifa o default $500)
      const { data: tarifas } = await supabaseAdmin
        .from('configuraciones')
        .select('valor')
        .eq('profesional_id', profesionalId)
        .eq('clave', 'agente_tarifas')
        .maybeSingle();

      let monto = 500;
      if (tarifas?.valor) {
        try {
          const parsed = JSON.parse(tarifas.valor);
          if (Array.isArray(parsed) && parsed[0]?.precio) {
            monto = Number(parsed[0].precio) || 500;
          }
        } catch { /* usar default */ }
      }

      const { data: prof } = await supabaseAdmin
        .from('profesionales')
        .select('nombre')
        .eq('id', profesionalId)
        .single();

      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            title: `Seña — Turno con ${prof?.nombre ?? 'el profesional'}`,
            quantity: 1,
            unit_price: monto,
            currency_id: 'ARS',
          }],
          external_reference: turnoId,
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://calendaria.com.ar'}/api/webhooks/mercadopago`,
        }),
      });

      if (mpRes.ok) {
        const mpData = await mpRes.json();
        mp_init_point = mpData.init_point ?? null;
        // Guardar en tabla pagos si se creó la preferencia
        if (mpData.id) {
          await supabaseAdmin.from('pagos').insert({
            turno_id:                  turnoId,
            monto,
            estado:                    'pendiente',
            mercado_pago_preference_id: mpData.id,
          });
        }
      } else {
        console.error('[agenda POST] MercadoPago error:', await mpRes.text());
      }
    } catch (e) {
      console.error('[agenda POST] MercadoPago exception:', e);
    }
  }

  // ── Resend: email de confirmación al paciente (si tiene email y hay API key) ──
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { data: pacienteData } = await supabaseAdmin
        .from('pacientes')
        .select('email, nombre')
        .eq('id', pacienteId!)
        .maybeSingle();

      if (pacienteData?.email) {
        const { data: prof } = await supabaseAdmin
          .from('profesionales')
          .select('nombre')
          .eq('id', profesionalId)
          .single();

        const fechaAR = new Date(data.fecha_hora).toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        const resend = new Resend(resendKey);
        await resend.emails.send({
          from:    'Calendaria <noreply@calendaria.com.ar>',
          to:      pacienteData.email,
          subject: `Tu turno fue confirmado — ${fechaAR}`,
          html: `
<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#F5EFE6;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:40px auto;background:#FFFCF8;border-radius:12px;overflow:hidden;border:1px solid #E5D9CB;">
    <div style="background:#C26A4A;padding:28px 32px;">
      <p style="color:#FFFCF8;font-size:22px;font-weight:600;margin:0;letter-spacing:-0.01em;">Calendaria</p>
    </div>
    <div style="padding:32px;">
      <h1 style="font-size:22px;color:#2C241D;margin:0 0 8px;font-weight:500;">Tu turno fue confirmado</h1>
      <p style="color:#7A6B5E;font-size:14px;margin:0 0 24px;">Hola ${escapeHtml(pacienteData.nombre)}, tu turno fue reservado correctamente.</p>
      <div style="background:#F5EFE6;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#7A6B5E;">Fecha y hora</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#2C241D;text-transform:capitalize;">${fechaAR}</p>
      </div>
      <div style="background:#F5EFE6;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#7A6B5E;">Profesional</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#2C241D;">${escapeHtml(prof?.nombre ?? 'Tu profesional')}</p>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:#7A6B5E;line-height:1.6;">Si necesitás cancelar o reprogramar, respondé a este email o escribinos por WhatsApp.</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #E5D9CB;">
      <p style="margin:0;font-size:12px;color:#A89488;">Calendaria — Gestión de agenda inteligente</p>
    </div>
  </div>
</body>
</html>`,
        });
      }
    } catch (e) {
      console.error('[agenda POST] Resend exception:', e);
    }
  }

  return NextResponse.json({
    ok: true,
    turno: { ...data, paciente_nombre: nombre_paciente.trim() },
    ...(mp_init_point ? { mp_init_point } : {}),
  });
}

export async function PATCH(req: Request) {
  const profesionalId = await getProfesionalId();
  const { id, estado } = await req.json();
  if (!id || !estado) return NextResponse.json({ error: 'id y estado requeridos' }, { status: 400 });
  if (!ESTADOS_VALIDOS.includes(estado)) return NextResponse.json({ error: 'estado inválido' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('turnos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profesional_id', profesionalId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
