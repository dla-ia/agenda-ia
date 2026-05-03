import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas siempre públicas (sin sesión y sin restricción)
const ALWAYS_PUBLIC = ['/'];
// Rutas de auth: accesibles sin sesión, pero si hay sesión → redirigir al panel
const AUTH_PATHS = ['/auth'];

const AUTH_BYPASS = !!process.env.NEXT_PUBLIC_PROFESIONAL_ID;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (AUTH_BYPASS || ALWAYS_PUBLIC.includes(pathname)) {
    return NextResponse.next();
  }

  let res = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Sin sesión: solo puede estar en rutas de auth
  if (!user) {
    if (AUTH_PATHS.includes(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Con sesión: no puede estar en rutas de auth (ya está adentro)
  if (AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
