-- ============================================
-- TEMPLATE — Crear una tabla nueva en `public`
-- ============================================
-- Desde el 30/10/2026, Supabase NO expone tablas nuevas de `public` a la
-- Data API (supabase-js / PostREST / GraphQL) sin un GRANT explícito.
-- Copiá este bloque entero al crear cualquier tabla nueva. No alcanza con
-- CREATE TABLE: sin los GRANT, `supabase.from('...')` falla con error de permisos.
--
-- Reemplazá `nueva_tabla` por el nombre real y ajustá columnas/políticas.
-- ============================================

-- 1. Crear la tabla
CREATE TABLE nueva_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
    -- ... columnas ...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GRANTS explícitos por rol (obligatorio desde 30/10/2026)
-- `anon` (rol no autenticado) queda comentado a propósito: Calendaria es
-- multi-tenant sin datos públicos. Descomentar SOLO si esta tabla expone
-- datos a usuarios no logueados (ej. landing pública).
-- GRANT SELECT ON public.nueva_tabla TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nueva_tabla TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nueva_tabla TO service_role;

-- 3. Habilitar RLS (el GRANT da acceso al rol; RLS filtra qué filas ve)
ALTER TABLE public.nueva_tabla ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS — multi-tenant: cada profesional solo ve/muta sus filas
CREATE POLICY "Profesionales pueden ver sus filas"
ON nueva_tabla FOR SELECT
USING (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden insertar sus filas"
ON nueva_tabla FOR INSERT
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden actualizar sus filas"
ON nueva_tabla FOR UPDATE
USING (profesional_id = auth.uid())
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden eliminar sus filas"
ON nueva_tabla FOR DELETE
USING (profesional_id = auth.uid());
