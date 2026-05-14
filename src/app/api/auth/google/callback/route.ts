import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCode } from '@/lib/google-calendar';
import { getProfesionalId } from '@/lib/supabase-admin';

// Cliente con service role para bypassear RLS en el callback del servidor
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(`${appUrl}/configuracion?google=error`);
  }

  // Verificar que el `state` coincida con el profesional de la sesión actual.
  // Sin esto un atacante podía hand-craftear la URL de consentimiento con
  // state=VICTIMA y escribir SUS tokens de Google sobre la fila de otro
  // profesional (hijack de calendario). El callback corre en el navegador
  // del atacante → su sesión nunca coincide con la víctima.
  const sessionProfesionalId = await getProfesionalId();
  if (!sessionProfesionalId || sessionProfesionalId !== state) {
    return NextResponse.redirect(`${appUrl}/configuracion?google=error`);
  }

  try {
    const tokens = await exchangeCode(code);
    const supabase = getAdminClient();

    const { error: dbError } = await supabase
      .from('profesionales')
      .update({ google_calendar_token: tokens })
      .eq('id', sessionProfesionalId);

    if (dbError) throw dbError;

    return NextResponse.redirect(`${appUrl}/configuracion?google=success`);
  } catch {
    return NextResponse.redirect(`${appUrl}/configuracion?google=error`);
  }
}
