import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role — bypasea RLS. Solo usar server-side (API routes, Server Components).
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const PROFESIONAL_ID = process.env.NEXT_PUBLIC_PROFESIONAL_ID!;
