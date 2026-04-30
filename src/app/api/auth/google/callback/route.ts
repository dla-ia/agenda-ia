import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCode } from '@/lib/google-calendar';

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
  const profesionalId = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error || !code || !profesionalId) {
    return NextResponse.redirect(`${appUrl}/configuracion?google=error`);
  }

  try {
    const tokens = await exchangeCode(code);
    const supabase = getAdminClient();

    const { error: dbError } = await supabase
      .from('profesionales')
      .update({ google_calendar_token: tokens })
      .eq('id', profesionalId);

    if (dbError) throw dbError;

    return NextResponse.redirect(`${appUrl}/configuracion?google=success`);
  } catch {
    return NextResponse.redirect(`${appUrl}/configuracion?google=error`);
  }
}
