import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const profesionalId = request.nextUrl.searchParams.get('profesionalId') ?? 'default';
  const url = getAuthUrl(profesionalId);
  return NextResponse.redirect(url);
}
