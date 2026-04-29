-- Schema de base de datos para AgendaIA
-- Agente de WhatsApp para Psicólogos

-- ============================================
-- TABLA: profesionales
-- ============================================
CREATE TABLE profesionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100) DEFAULT 'psicología clínica',
    duracion_sesion_minutos INTEGER DEFAULT 50,
    horario_inicio TIME DEFAULT '09:00',
    horario_fin TIME DEFAULT '20:00',
    dias_laborables INTEGER[] DEFAULT '{1,2,3,4,5}', -- lunes=1, domingo=0
    google_calendar_token JSONB,
    google_calendar_refresh_token TEXT,
    google_calendar_id TEXT,
    twilio_phone_sid TEXT,
    twilio_auth_token TEXT,
    twilio_account_sid TEXT,
    mercado_pago_access_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: pacientes
-- ============================================
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profesional_id, telefono)
);

-- ============================================
-- TABLA: turnos
-- ============================================
CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    duracion_minutos INTEGER DEFAULT 50,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmado, cancelado, completado, no_asistio
    google_event_id TEXT,
    notas TEXT,
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: pagos
-- ============================================
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turno_id UUID REFERENCES turnos(id) ON DELETE SET NULL,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagado, fallido, reembolsado
    mercado_pago_payment_id TEXT,
    mercado_pago_preference_id TEXT,
    fecha_pago TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: lista_espera
-- ============================================
CREATE TABLE lista_espera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha_alta TIMESTAMPTZ DEFAULT NOW(),
    preferencia_horaria VARCHAR(50), -- mañana, tarde, cualquier
    dias_disponibles INTEGER[], -- días de la semana preferidos
    activo BOOLEAN DEFAULT TRUE,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: conversaciones
-- ============================================
CREATE TABLE conversaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    telefono VARCHAR(20) NOT NULL,
    ultimo_mensaje TEXT,
    ultimo_mensaje_at TIMESTAMPTZ DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'activa', -- activa, archivada
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: mensajes
-- ============================================
CREATE TABLE mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    direccion VARCHAR(10) NOT NULL, -- entrante, saliente
    twilio_message_sid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: configuraciones
-- ============================================
CREATE TABLE configuraciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
    clave VARCHAR(100) NOT NULL,
    valor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profesional_id, clave)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_turnos_profesional_fecha ON turnos(profesional_id, fecha_hora);
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_pacientes_telefono ON pacientes(telefono);
CREATE INDEX idx_conversaciones_telefono ON conversaciones(telefono);
CREATE INDEX idx_conversaciones_estado ON conversaciones(estado);
CREATE INDEX idx_lista_espera_activo ON lista_espera(activo);

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener disponibilidad de horarios
CREATE OR REPLACE FUNCTION get_disponibilidad(
    p_profesional_id UUID,
    p_fecha DATE,
    p_duracion_minutos INTEGER DEFAULT 50
)
RETURNS TABLE(hora TIME) AS $$
DECLARE
    v_horario_inicio TIME;
    v_horario_fin TIME;
    v_dias_laborables INTEGER[];
    v_turnos_existentes TIMESTAMPTZ[];
    v_hora TIME;
    v_fecha_hora TIMESTAMPTZ;
BEGIN
    -- Obtener configuración del profesional
    SELECT horario_inicio, horario_fin, dias_laborables
    INTO v_horario_inicio, v_horario_fin, v_dias_laborables
    FROM profesionales
    WHERE id = p_profesional_id;

    -- Verificar si el día es laborable
    IF EXTRACT(DOW FROM p_fecha)::INTEGER + 1 NOT IN (SELECT unnest FROM unnest(v_dias_laborables)) THEN
        RETURN;
    END IF;

    -- Obtener turnos existentes para ese día
    SELECT ARRAY_AGG(fecha_hora)
    INTO v_turnos_existentes
    FROM turnos
    WHERE profesional_id = p_profesional_id
    AND DATE(fecha_hora) = p_fecha
    AND estado NOT IN ('cancelado');

    -- Generar todos los posibles horarios
    v_hora := v_horario_inicio;
    WHILE v_hora < v_horario_fin LOOP
        v_fecha_hora := p_fecha::TIMESTAMPTZ + v_hora;

        -- Verificar que no haya un turno existente en ese horario
        IF v_fecha_hora != ALL(v_turnos_existentes) THEN
            RETURN QUERY SELECT v_hora;
        END IF;

        v_hora := v_hora + (p_duracion_minutos || ' minutes')::INTERVAL;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profesionales (solo su propio registro)
CREATE POLICY "Profesionales pueden ver su propio registro"
ON profesionales FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Profesionales pueden ver sus pacientes"
ON pacientes FOR SELECT
USING (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden ver sus turnos"
ON turnos FOR SELECT
USING (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden ver sus pagos"
ON pagos FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM turnos t
        WHERE t.id = pagos.turno_id
        AND t.profesional_id = auth.uid()
    )
);

CREATE POLICY "Profesionales pueden ver su lista de espera"
ON lista_espera FOR SELECT
USING (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden ver sus conversaciones"
ON conversaciones FOR SELECT
USING (profesional_id = auth.uid());

CREATE POLICY "Profesionales pueden ver sus mensajes"
ON mensajes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversaciones c
        WHERE c.id = mensajes.conversacion_id
        AND c.profesional_id = auth.uid()
    )
);

CREATE POLICY "Profesionales pueden ver sus configuraciones"
ON configuraciones FOR SELECT
USING (profesional_id = auth.uid());