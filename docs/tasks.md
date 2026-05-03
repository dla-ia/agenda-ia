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
- [x] Activar auth obligatorio en producción: `NEXT_PUBLIC_PROFESIONAL_ID` eliminado de Vercel + cuenta auth creada para profesional de dev
- [x] Flujo registro: 3 bugs corregidos (congelado, sidebar en auth, sin sesión post-registro)
- [x] `/configuracion`: página de perfil, cuenta e integraciones para el profesional
- [ ] Probar flujo completo registro → onboarding → dashboard con cuenta nueva (post-fixes)

### Dominio calendaria.com.ar ✅ COMPLETADO
- [x] Cargar delegaciones en NIC Argentina: `ns1.vercel-dns.com` y `ns2.vercel-dns.com`
- [x] Propagación DNS — calendaria.com.ar live con SSL
- [x] Actualizar `NEXT_PUBLIC_APP_URL` en Vercel: `https://calendaria.com.ar`
- [x] Agregar URI en Google Cloud OAuth: `https://calendaria.com.ar/api/auth/google/callback`
- [x] Actualizar webhook Twilio: `https://calendaria.com.ar/api/webhooks/twilio`

### MCP servers
- [x] Supabase MCP activo — autenticado vía OAuth esta sesión
- [ ] Vercel MCP (`https://mcp.vercel.com`) — pendiente autenticar
- [ ] Twilio MCP (`@twilio-alpha/mcp`) — requiere reinicio de Claude Code

---

## 🟡 Fase 2 — Completar el agente existente
- [x] Agregar URI de producción en Google Cloud OAuth — hecho junto con DNS
- [ ] Salir del sandbox Twilio: conectar WhatsApp Business real para producción

---

## 🟡 Fase 3 — Pagos y recordatorios
- [ ] MercadoPago: generar link de seña al crear turno (requiere MERCADOPAGO_ACCESS_TOKEN)
- [x] Endpoint `/api/webhooks/n8n` para recordatorios manuales (turno_id + tipo)
- [x] GitHub Actions cron cada hora → `/api/cron/recordatorios` → WhatsApp 24h y 2h antes
- [x] Migración Supabase: `recordatorio_24h_enviado` y `recordatorio_2h_enviado` en `turnos`
- [x] `CRON_SECRET` en Vercel y en GitHub Actions secrets (`APP_URL` también)
- [ ] Resend: email de confirmación de turno (paquete instalado, falta RESEND_API_KEY)

---

## 🟢 Completadas — Sesión 03/05/2026 (autónoma loop, 30 min)
- [x] Seguridad: PATCH /agenda agrega filtro `profesional_id` en UPDATE (ownership)
- [x] Seguridad: GET + DELETE /pacientes filtran por `profesional_id` (cross-tenant leak cerrado)
- [x] Seguridad: GET /conversaciones?id= verifica ownership antes de devolver mensajes
- [x] Datos: /api/webhooks/n8n — columna `nombre_profesional` → `nombre` (nombre correcto en tabla)
- [x] Lógica: Twilio `From` normalizado con prefijo `whatsapp:` en n8n y cron/recordatorios
- [x] Lógica: onboarding Step3 `router.push('/dashboard')` → `window.location.href` (fix post-auth)
- [x] UX: /agenda scroll inicial al horario actual en lugar de top=0

## 🟢 Completadas — Sesión 03/05/2026 (autónoma, sin Diego)
- [x] `/configuracion`: nueva página (perfil, cuenta, integraciones) + API route GET+PATCH
- [x] `PROFESIONAL_ID` hardcodeado eliminado de `/api/data/agente`, `/api/data/conversaciones`, `dashboard/page.tsx`
- [x] `fetchActividad` en dashboard ahora filtra por `profesional_id` — no mezclaba datos entre profesionales
- [x] Sidebar: nombre del profesional cargado desde `profesionales` (antes era "Dr. Diego" hardcodeado)
- [x] Sidebar: badge "3" hardcodeado en Conversaciones eliminado
- [x] `handleLogout` migrado a `window.location.href` (igual que login/registro)
- [x] Middleware refactorizado: `AUTH_PATHS=['/auth']` separado de `ALWAYS_PUBLIC=['/']` — usuarios logueados en /auth ahora redirigen a /dashboard correctamente
- [x] Sidebar: `Configuración` agregado al nav con ícono de engranaje

## 🟢 Completadas — Sesión 02/05/2026 (día siguiente)
- [x] `flujo.md`: diagrama completo del sistema (Mermaid + Markdown importable en XMind)
- [x] GitHub Actions cron recordatorios: `.github/workflows/recordatorios.yml` + `/api/cron/recordatorios`
- [x] Supabase MCP autenticado directamente desde Claude Code
- [x] Auth real activado: `NEXT_PUBLIC_PROFESIONAL_ID` eliminado de Vercel
- [x] Cuenta Supabase Auth creada para profesional de dev (misma UUID → datos intactos)
- [x] `gh` CLI instalado y autenticado via Windows Credential Manager
- [x] GitHub secrets `CRON_SECRET` y `APP_URL` seteados directo desde Claude Code
- [x] `CRON_SECRET` agregado a Vercel via CLI
- [x] `/pacientes`: botón "Eliminar" con confirmación inline (cancela turnos futuros)
- [x] `/agenda`: click en columna de día → modal pre-cargado con fecha/hora (cursor crosshair)
- [x] `/agenda`: validación de solapamiento en POST — error con nombre del paciente conflictivo
- [x] API routes migradas de `PROFESIONAL_ID` a `getProfesionalId()` (agenda + pacientes)
- [x] `docs/correccion.md`: sistema de registro de correcciones con protocolo `corrección:`

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
