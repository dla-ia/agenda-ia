import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role — bypasea RLS. Solo usar server-side (API routes, Server Components).
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ID fijo para desarrollo/demo (se reemplaza cuando auth está activo)
export const PROFESIONAL_ID = process.env.NEXT_PUBLIC_PROFESIONAL_ID!;

// Devuelve el profesional_id del usuario logueado, o el ID de demo si no hay sesión.
// Usar en API routes y Server Components.
export async function getProfesionalId(): Promise<string> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch { /* en edge/middleware o sin cookies, cae al fallback */ }
  return PROFESIONAL_ID;
}
