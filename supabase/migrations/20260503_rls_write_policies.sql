-- ============================================
-- Migración: Políticas RLS de escritura
-- Fecha: 2026-05-03
-- Auditoría: schema.sql solo tenía SELECT policies.
-- Esta migración agrega INSERT, UPDATE y DELETE para todas las tablas relevantes.
-- ============================================

-- ── profesionales ──────────────────────────────────────────────────────────────
CREATE POLICY "Profesionales pueden actualizar su propio perfil"
ON profesionales FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT lo hace la app server-side con service role (al registrarse), no se expone al cliente.

-- ── pacientes ──────────────────────────────────────────────────────────────────
CREATE POLICY "Profesionales pueden insertar sus pacientes"
ON pacientes FOR INSERT
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden actualizar sus pacientes"
ON pacientes FOR UPDATE
USING (profesional_id = auth.uid())
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden eliminar sus pacientes"
ON pacientes FOR DELETE
USING (profesional_id = auth.uid());

-- ── turnos ──────────────────────────────────────────────────────────────────────
CREATE POLICY "Profesionales pueden insertar sus turnos"
ON turnos FOR INSERT
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden actualizar sus turnos"
ON turnos FOR UPDATE
USING (profesional_id = auth.uid())
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden eliminar sus turnos"
ON turnos FOR DELETE
USING (profesional_id = auth.uid());

-- ── conversaciones ──────────────────────────────────────────────────────────────
CREATE POLICY "Profesionales pueden insertar sus conversaciones"
ON conversaciones FOR INSERT
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden actualizar sus conversaciones"
ON conversaciones FOR UPDATE
USING (profesional_id = auth.uid())
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden eliminar sus conversaciones"
ON conversaciones FOR DELETE
USING (profesional_id = auth.uid());

-- ── mensajes ──────────────────────────────────────────────────────────────────
-- Los mensajes no tienen profesional_id directo, se validan por la conversación.
CREATE POLICY "Profesionales pueden insertar mensajes en sus conversaciones"
ON mensajes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversaciones c
    WHERE c.id = mensajes.conversacion_id
    AND c.profesional_id = auth.uid()
  )
);

CREATE POLICY "Profesionales pueden eliminar mensajes de sus conversaciones"
ON mensajes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM conversaciones c
    WHERE c.id = mensajes.conversacion_id
    AND c.profesional_id = auth.uid()
  )
);

-- ── configuraciones ──────────────────────────────────────────────────────────────
CREATE POLICY "Profesionales pueden insertar sus configuraciones"
ON configuraciones FOR INSERT
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden actualizar sus configuraciones"
ON configuraciones FOR UPDATE
USING (profesional_id = auth.uid())
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden eliminar sus configuraciones"
ON configuraciones FOR DELETE
USING (profesional_id = auth.uid());

-- ── pagos ──────────────────────────────────────────────────────────────────────
-- Los pagos los gestiona la app server-side (MercadoPago webhook) con service role.
-- No se necesita política de escritura del lado cliente por ahora.
-- Si en el futuro se expone a clientes, agregar aquí.

-- ── lista_espera ──────────────────────────────────────────────────────────────────
CREATE POLICY "Profesionales pueden insertar lista de espera"
ON lista_espera FOR INSERT
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden actualizar lista de espera"
ON lista_espera FOR UPDATE
USING (profesional_id = auth.uid())
WITH CHECK (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden eliminar lista de espera"
ON lista_espera FOR DELETE
USING (profesional_id = auth.uid());
