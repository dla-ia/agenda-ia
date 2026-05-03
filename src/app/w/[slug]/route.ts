import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug.toLowerCase();

  const { data } = await supabaseAdmin
    .from('profesionales')
    .select('id, nombre')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) {
    /* Slug no encontrado — 404 amigable */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calendaria.com.ar';
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Profesional no encontrado — Calendaria</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; padding: 32px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      background: #F6F1EA; color: #2C241D;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      flex-direction: column; text-align: center; gap: 0;
    }
    .num  { font-family: Georgia, serif; font-size: clamp(80px,18vw,120px); font-weight: 600; color: #C26A4A; line-height: 1; letter-spacing: -0.04em; opacity: 0.15; user-select: none; margin-bottom: 8px; }
    h1   { font-family: Georgia, serif; font-size: clamp(22px,4vw,28px); font-weight: 500; margin: 16px 0 10px; letter-spacing: -0.015em; }
    p    { font-size: 15px; color: #8C7E6F; max-width: 380px; line-height: 1.6; margin: 0 0 28px; }
    a    { display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; border-radius: 10px; font-size: 14px; font-weight: 500; background: #C26A4A; color: #FFF8F0; text-decoration: none; border: 1px solid #A95838; }
  </style>
</head>
<body>
  <div class="num">404</div>
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C9BBA6" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
  <h1>Profesional no encontrado</h1>
  <p>El link que seguiste no corresponde a ningún profesional activo en Calendaria.</p>
  <a href="${appUrl}">Ir al inicio</a>
</body>
</html>`;
    return new NextResponse(html, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const numero = (process.env.TWILIO_PHONE_NUMBER ?? '+14155238886')
    .replace('whatsapp:', '')
    .replace('+', '');

  const waText = encodeURIComponent(`TURNO:${slug}`);
  const waUrl  = `https://wa.me/${numero}?text=${waText}`;
  const nombre = data.nombre ?? 'el profesional';

  /* Página intermedia con auto-redirect */
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Conectando con ${nombre} — Calendaria</title>
  <meta http-equiv="refresh" content="2;url=${waUrl}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; padding: 32px 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      background: #F6F1EA; color: #2C241D;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      flex-direction: column; text-align: center; gap: 0;
    }
    .logo-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-mark { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #C26A4A 0%, #A95838 100%); display: flex; align-items: center; justify-content: center; }
    .logo-name { font-family: Georgia, serif; font-weight: 600; font-size: 22px; color: #2C241D; letter-spacing: -0.02em; }
    .card {
      background: #FBF7F1; border: 1px solid #DDD1C0; border-radius: 18px;
      padding: 32px 36px; max-width: 380px; width: 100%;
      box-shadow: 0 4px 16px rgba(58,41,26,0.08);
    }
    .wa-icon { width: 56px; height: 56px; border-radius: 16px; background: #E7F8EE; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    h1   { font-family: Georgia, serif; font-size: 22px; font-weight: 500; margin: 0 0 10px; letter-spacing: -0.015em; }
    p    { font-size: 14px; color: #8C7E6F; line-height: 1.6; margin: 0 0 24px; }
    .spinner { width: 28px; height: 28px; border: 2.5px solid #E5D7C5; border-top-color: #C26A4A; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hint { font-size: 12px; color: #8C7E6F; }
    a.manual { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; background: #25D366; color: #fff; text-decoration: none; border: none; margin-top: 16px; }
  </style>
  <script>
    setTimeout(function() { window.location.href = "${waUrl}"; }, 2000);
  </script>
</head>
<body>
  <div class="logo-wrap">
    <div class="logo-mark">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
      </svg>
    </div>
    <span class="logo-name">Calendaria</span>
  </div>

  <div class="card">
    <div class="wa-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.918-1.419A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.31-1.268l-.31-.183-3.187.919.893-3.096-.201-.318A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
      </svg>
    </div>
    <h1>Conectando con ${nombre}</h1>
    <p>Te estamos redirigiendo a WhatsApp para que puedas reservar tu turno.</p>
    <div class="spinner"></div>
    <span class="hint">Redirigiendo automáticamente...</span>
    <br />
    <a class="manual" href="${waUrl}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51c-.173-.008-.371-.01-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347z"/>
      </svg>
      Abrir WhatsApp ahora
    </a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
