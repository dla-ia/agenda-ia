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
    return NextResponse.redirect(new URL('/', request.url));
  }

  const numero = (process.env.TWILIO_PHONE_NUMBER ?? '+14155238886')
    .replace('whatsapp:', '')
    .replace('+', '');

  const text = encodeURIComponent(`TURNO:${slug}`);
  return NextResponse.redirect(`https://wa.me/${numero}?text=${text}`);
}
