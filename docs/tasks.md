# Tareas del Proyecto — Calendaria

> Archivo central de progreso. Claude Code puede tildar los checkboxes.
> Guardá aquí el estado al cerrar una sesión.

---

## 🟡 Fase 1 — En progreso (próximas sesiones)

### Panel del profesional
- [x] `/agenda`: botón "+ Turno" funcional (modal para crear turno manualmente)
- [x] `/agenda`: acciones del modal (cancelar turno, marcar completado) conectadas a Supabase
- [x] `/agente` tab "Reglas de agenda": editar horarios por día con toggle + inputs de hora inline
- [x] Onboarding: asignar `slug` al profesional cuando se registra — campo con auto-sugerencia, validación en tiempo real y preview del link

### Auth y onboarding
- [ ] Activar auth obligatorio en producción: eliminar `NEXT_PUBLIC_PROFESIONAL_ID` de Vercel cuando haya usuarios reales
- [ ] Probar flujo completo registro → onboarding → dashboard con cuenta nueva

### Dominio calendaria.com.ar ✅ COMPLETADO
- [x] Cargar delegaciones en NIC Argentina: `ns1.vercel-dns.com` y `ns2.vercel-dns.com`
- [x] Propagación DNS — calendaria.com.ar live con SSL
- [x] Actualizar `NEXT_PUBLIC_APP_URL` en Vercel: `https://calendaria.com.ar`
- [x] Agregar URI en Google Cloud OAuth: `https://calendaria.com.ar/api/auth/google/callback`
- [x] Actualizar webhook Twilio: `https://calendaria.com.ar/api/webhooks/twilio`

### MCP servers (requieren reiniciar Claude Code)
- [ ] Activar Supabase MCP (`https://mcp.supabase.com/mcp`) — ya en config, falta autenticar
- [ ] Activar Vercel MCP (`https://mcp.vercel.com`) — ya en config, falta autenticar
- [ ] Activar Twilio MCP (`@twilio-alpha/mcp`) — configurado en `.claude/settings.local.json`, requiere reinicio

---

## 🟡 Fase 2 — Completar el agente existente
- [x] Agregar URI de producción en Google Cloud OAuth — hecho junto con DNS
- [ ] Salir del sandbox Twilio: conectar WhatsApp Business real para producción

---

## 🟡 Fase 3 — Pagos y recordatorios
- [ ] MercadoPago: generar link de seña al crear turno (requiere MERCADOPAGO_ACCESS_TOKEN)
- [x] Endpoint `/api/webhooks/n8n` para recordatorios — n8n llama con `turno_id` + `tipo: 24h|2h`, envía WhatsApp vía Twilio
- [ ] Configurar workflow en n8n: cron 24h y 2h antes del turno → POST al endpoint
- [ ] Resend: email de confirmación de turno con link de seña (requiere RESEND_API_KEY)

---

## 🟢 Completadas — Sesión 03/05/2026 (noche)
- [x] Brand system completo: SVGs en `public/brand/`, componentes `Isotype` / `Wordmark` / `Lockup`, logos reemplazados en sidebar, landing, auth y onboarding
- [x] `src/app/layout.tsx`: migrado de `<link>` Google Fonts a `next/font/google` (Fraunces + Inter + JetBrains Mono como CSS vars)
- [x] `src/app/icon.tsx`: app icon generado con `ImageResponse` (isotipo blanco sobre fondo terracota)
- [x] Manifiesto agregado al hero de landing: "Tu trabajo es atender. El nuestro, agendar."
- [x] `/agenda`: modal "+ Turno" funcional — autocomplete de pacientes, fecha/hora, duración, notas, conversión AR→UTC
- [x] `/agenda`: cancelar y marcar completado conectados a Supabase con optimistic update
- [x] `/agente` API GET: retorna `_horario_inicio`, `_horario_fin`, `_dias_laborables` desde tabla `profesionales`
- [x] `/agente` API POST: sincroniza `agente_horarios` JSON de vuelta a `profesionales.horario_inicio/fin/dias_laborables`
- [x] `/agente` tab "Reglas": Toggle por día + inputs de hora inline, se persiste con "Guardar"
- [x] `/api/webhooks/n8n`: endpoint para recordatorios — n8n llama con `turno_id` + `tipo: 24h|2h`, envía WhatsApp vía Twilio, validado por `x-webhook-secret`
- [x] `N8N_WEBHOOK_SECRET` agregado a `.env.local`

## 🟢 Completadas — Sesión 02/05/2026 (noche)
- [x] Modelo de negocio WhatsApp definido: 1 número compartido + slug por profesional (escalable, $15/mes fijo)
- [x] Webhook multi-tenant: detecta profesional por número individual > slug en mensaje > conversación previa > fallback
- [x] Ruta `/w/[slug]` → redirige a `wa.me/NUMERO?text=TURNO:slug` (link personalizado por profesional)
- [x] `profesionales` tabla: campos `slug` (UNIQUE) y `twilio_number` agregados via migración SQL
- [x] Profesional demo tiene `slug='demo'` → link: `calendaria.com.ar/w/demo`
- [x] `/pacientes`: botón "+ Paciente" + modal para agregar paciente y enviar WhatsApp proactivo
- [x] `POST /api/data/pacientes`: crea paciente en Supabase + envía WhatsApp via Twilio REST + crea conversación
- [x] Normalización automática de teléfono argentino (sin código de país)

## 🟢 Completadas — Sesión 02/05/2026 (tarde)
- [x] WhatsApp e2e verificado: mensaje → Claude → Supabase → TwiML funciona correctamente
- [x] Historial acotado a 10 mensajes — evita contaminación de contexto entre sesiones
- [x] Conversación se cierra (estado='completada') al confirmar turno — próximo mensaje empieza limpio
- [x] Google Calendar Paso 5: `crear_turno` crea evento en Google Calendar (best-effort, token desde Supabase)
- [x] Dominio `calendaria.com.ar` registrado y agregado al proyecto Vercel
- [x] `www.calendaria.com.ar` → redirect 301 a raíz configurado en `vercel.json`
- [x] MCP Twilio (`@twilio-alpha/mcp`) configurado en `.claude/settings.local.json`

## 🟢 Completadas — Sesión 02/05/2026 (mañana)
- [x] Configuración del agente persistida en Supabase (`/api/data/agente` GET+POST)
- [x] `/agente` page: estado centralizado, carga desde Supabase al montar, guarda con feedback visual
- [x] `claude-agent.ts`: system prompt dinámico — nombre, tono, saludo, cierre y frases prohibidas desde DB
- [x] `/agenda`: calendario semanal navegable con datos reales de Supabase
- [x] `/api/data/agenda`: GET turnos por rango de fechas, timezone Argentina UTC-3 correcto
- [x] MCP servers agregados al config: Supabase + Vercel (activar reiniciando Claude Code)
- [x] `@supabase/ssr` instalado para manejo de sesiones en Next.js App Router
- [x] `/auth`: página login/registro con split-screen (branding izquierda, formulario derecha)
- [x] `/onboarding`: wizard 3 pasos (perfil → agente → listo) con barra de progreso
- [x] `/api/auth/profesional`: POST crea registro en Supabase + auto-confirma email via Admin API
- [x] `middleware.ts`: protege rutas del panel (bypass activo mientras NEXT_PUBLIC_PROFESIONAL_ID esté seteado)
- [x] `getProfesionalId()`: helper session-aware — usa sesión real o fallback a env var
- [x] Sidebar: botón logout + email del usuario desde sesión
- [x] Email auto-confirmado al registrarse (sin config manual en Supabase dashboard)

## 🟢 Completadas — Sesiones anteriores
- [x] Estructura inicial del proyecto creada (Next.js 14 + Tailwind + Supabase)
- [x] Schema de Supabase completo (8 tablas, RLS, función get_disponibilidad)
- [x] Deploy automático en Vercel conectado a GitHub
- [x] Supabase cloud configurado — profesional de prueba insertado (ID: 02bccd60-4947-49fc-877d-f109665920f2)
- [x] Google Calendar OAuth implementado y probado end-to-end (token guardado en Supabase)
- [x] Webhook de Twilio implementado (/api/webhooks/twilio → Claude → Supabase → TwiML)
- [x] API key de Anthropic configurada (claude-sonnet-4-6)
- [x] Twilio sandbox conectado (+5491159530792 → +14155238886)
- [x] Deploy a producción: https://agenda-ia-gray.vercel.app
- [x] Agente Claude con tool use: get_disponibilidad, crear_turno, ver_turnos_paciente, cancelar_turno
- [x] Fix system prompt: flujo 2 pasos (sin confirmación intermedia que bloqueaba la reserva)
- [x] Pivot de nombre y scope: AgendaIA → Calendaria SaaS multi-profesional
- [x] Design tokens (paleta tierra + Fraunces) en tailwind.config.js y globals.css
- [x] Landing page pública (`/`): hero + profesiones + cómo funciona + features + precios + CTA + footer
- [x] Dashboard (`/dashboard`): MetricCards + ActivityFeed + AgendaHoy con datos reales
- [x] Conversaciones (`/conversaciones`): lista + chat real desde Supabase
- [x] Pacientes (`/pacientes`): lista + ficha con historial de turnos
