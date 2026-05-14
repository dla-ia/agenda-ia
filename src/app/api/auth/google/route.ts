import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-calendar';
import { getProfesionalId } from '@/lib/supabase-admin';

export async function GET() {
  // El profesional que conecta su calendario se deriva de la SESIÓN, nunca de
  // un query param. Antes `/api/auth/google?profesionalId=VICTIMA` permitía
  // que el callback escribiera tokens de Google ajenos sobre otra fila.
  const profesionalId = await getProfesionalId();
  if (!profesionalId) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/auth`);
  }
  return NextResponse.redirect(getAuthUrl(profesionalId));
}
