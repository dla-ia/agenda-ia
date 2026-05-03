# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 03/05/2026 (sesión autónoma loop 7 — pagos, system prompt Aurora, email pacientes, CSV, métricas, RLS)
**Sesión:** /pagos nueva página, Aurora mejorada (fuera de horario + nombre profesional), email opcional en pacientes, export CSV, tasa de confirmación en dashboard, próximo turno del día, turnos del día en modal de agenda, auditoría RLS.

### ¿Dónde quedamos?
8 tareas completadas: (1) `/pagos`: historial de señas con métricas y tabla ordenada. (2) Aurora system prompt: nombre del profesional, manejo fuera de horario, crisis protocol reforzado. (3) Email opcional en modal "+ Paciente" y guardado en Supabase. (4) Botón "↓ CSV" en /pacientes (genera cliente-side, sin deps). (5) Dashboard: métrica "tasa de confirmación" + banner "próximo turno del día". (6) Agenda modal: resumen turnos del día seleccionado en footer. (7) RLS write policies: migration SQL en supabase/migrations/ (INSERT/UPDATE/DELETE para todas las tablas). (8) Sidebar: link a /pagos.

### ¿Qué funciona?
- **App en producción:** https://calendaria.com.ar ✅
- **Auth real:** login/registro/onboarding protegido — `NEXT_PUBLIC_PROFESIONAL_ID` eliminado de Vercel
- **Login dev:** diego.leonardo.alvarez@gmail.com / Calendaria2026! (cuenta auth creada con UUID correcto)
- **Supabase MCP:** conectado y autenticado directamente desde Claude Code
- **GitHub Actions cron:** `.github/workflows/recordatorios.yml` corre cada hora, llama `/api/cron/recordatorios`
- **Recordatorios:** columnas `recordatorio_24h_enviado` y `recordatorio_2h_enviado` en `turnos`
- **/conversaciones:** "Tomar control" funcional — escribe y envía por WhatsApp, guarda en Supabase
- **/conversaciones mobile:** lista oculta al abrir chat, botón "volver" en header
- **/agenda:** click en espacio vacío del calendario → modal con fecha/hora pre-cargada; empty state overlay
- **/agenda:** validación de solapamiento en POST (409 con nombre del paciente conflictivo)
- **/agenda modal:** si MERCADOPAGO_ACCESS_TOKEN está seteado → muestra botón "Cobrar seña" post-creación
- **/agenda modal:** resumen de turnos del día seleccionado en footer del modal "+ Turno"
- **/agenda mobile:** modales fluid (`min(Xpx, calc(100vw - 32px))`), grid con minmax, svh
- **/pacientes:** botón "Eliminar" con confirmación inline (cancela turnos futuros automáticamente)
- **/pacientes modal:** campo email opcional (para Resend), guardado en Supabase
- **/pacientes:** botón "↓ CSV" descarga lista de pacientes (nombre, tel, email, fecha alta, turnos)
- **/agente tab "Precios":** tarifas editables (label/precio/duración), agregar/quitar filas, persisten en `agente_tarifas`
- **/agente tab "Integraciones":** estados reales — WhatsApp pendiente, Calendar conectado
- **/pagos:** nueva página con historial de señas, métricas (total cobrado, pendientes), tabla ordenada por fecha
- **Error boundaries:** `error.tsx` + `global-error.tsx` + `dashboard/error.tsx` — mensajes amigables, botón reset, sin stack traces en prod
- **Loading skeletons:** `conversaciones/loading.tsx`, `pacientes/loading.tsx`, `agenda/loading.tsx` — shimmer mientras carga SSR
- **/configuracion:** botón "Copiar link" con feedback "¡Copiado!" 2s junto al slug
- **/w/[slug]:** página intermedia con nombre del profesional, spinner y auto-redirect 2s a WhatsApp; 404 amigable si slug no existe
- **Landing:** CTAs corregidos a `/auth`, sección FAQ expandible, link demo en hero
- **/dashboard:** loading.tsx con skeleton shimmer mientras carga SSR; tasa de confirmación; banner "próximo turno del día"
- **404 personalizada:** not-found.tsx con design tokens, redirige a /dashboard si logueado
- **Metadata + OG tags:** título, description, openGraph, twitter card — en todas las rutas
- **MercadoPago webhook:** `/api/webhooks/mercadopago` — procesa IPN, actualiza turno a 'confirmado'
- **Twilio webhook:** validación de campos `From/To/Body` requeridos — 400 si faltan
- **Brand system:** Lockup/Isotype/Wordmark, app icon, next/font/google activo
- **WhatsApp multi-tenant:** `/w/slug` → Aurora del profesional correcto
- **Agente Aurora:** system prompt dinámico, tool use (get_disponibilidad, crear_turno, cancelar, ver)
- **Aurora:** carga nombre del profesional + horario + días laborables desde DB → system prompt contextualizado
- **Aurora:** fuera de horario laboral → avisa y puede registrar turnos futuros igual
- **Aurora:** crisis protocol mejorado — líneas exactas, no sigue flujo de agenda post-crisis
- **Google Calendar:** evento creado al confirmar turno (best-effort)
- **`docs/correccion.md`:** sistema de registro de bugs con protocolo `corrección:`
- **RLS:** `supabase/migrations/20260503_rls_write_policies.sql` — políticas INSERT/UPDATE/DELETE para todas las tablas (pendiente ejecutar en Supabase Cloud)

### Arquitectura WhatsApp multi-tenant
```
Profesional A → slug: "garcia-psico"
Link: calendaria.com.ar/w/garcia-psico → wa.me/14155238886?text=TURNO:garcia-psico

Todos comparten +14155238886, $15/mes fijo
```
Webhook routing: twilio_number → slug en mensaje → conversación previa → fallback dev

### Recordatorios automáticos
```
GitHub Actions (cada hora)
  → GET /api/cron/recordatorios?secret=... (header x-cron-secret)
  → Supabase: turnos en ventana 23-25h (24h) y 1.5-2.5h (2h)
  → Twilio WhatsApp por cada turno
  → Marca recordatorio_24h/2h_enviado = true
```
Secret: `CRON_SECRET=calendaria_cron_secret_2026` (en Vercel + GitHub secrets)

### Credenciales y datos clave
- **Supabase:** aikwrtxmkdthnsnrnjng.supabase.co · project ref: `aikwrtxmkdthnsnrnjng`
- **Profesional dev:** ID `02bccd60-4947-49fc-877d-f109665920f2` · slug: `demo` · email: diego.leonardo.alvarez@gmail.com
- **Login dev:** contraseña `Calendaria2026!`
- **Link de prueba:** https://calendaria.com.ar/w/demo
- **Google Cloud:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 · webhook: /api/webhooks/twilio
- **Teléfono de prueba:** +5491159530792
- **Modelo Claude:** claude-sonnet-4-6
- **Credenciales:** `.env.local` (NO en git) + Vercel (16 vars)
- **gh CLI instalado:** `C:\Users\DIEGO\AppData\Local\gh-cli\bin\gh.exe` (autenticado vía Credential Manager)

### ¿Qué está pendiente?
- **Ejecutar migración RLS:** `supabase/migrations/20260503_rls_write_policies.sql` — copiar y ejecutar en Supabase SQL editor
- **Probar flujo registro completo:** registrarse como nuevo profesional → onboarding → dashboard (no testeado post auth-real)
- **MercadoPago activo:** código listo, solo falta pegar `MERCADOPAGO_ACCESS_TOKEN` en Vercel (cuenta de Diego)
- **Resend activo:** código listo, solo falta crear cuenta free en resend.com + pegar `RESEND_API_KEY` en Vercel
- **WhatsApp producción:** salir del sandbox Twilio (requiere WhatsApp Business aprobado por Meta)
- **Vercel MCP:** pendiente autenticar (`https://mcp.vercel.com`)
- **Twilio MCP:** requiere reinicio de Claude Code

### El próximo paso concreto es
> 1. **Ejecutar migración RLS:** abrir Supabase SQL editor → copiar y ejecutar `supabase/migrations/20260503_rls_write_policies.sql`
> 2. **Activar MercadoPago:** Diego pega `MERCADOPAGO_ACCESS_TOKEN` en Vercel → al crear un turno aparece botón "Cobrar seña"
> 3. **Activar Resend:** Diego crea cuenta free en resend.com → pega `RESEND_API_KEY` → al crear turno el paciente recibe email
> 4. **Probar registro nuevo profesional** en calendaria.com.ar — registrarse, onboarding, usar el panel

---

## Historial de sesiones
| Fecha | Lo que se hizo | Próximo paso |
|-------|---------------|--------------|
| 29/04/2026 | Estructura inicial, deploy Vercel, panel web básico | OAuth Google Calendar |
| 30/04/2026 | Supabase cloud, OAuth Google Calendar, webhook Twilio, deploy prod | Agente Claude con tool use |
| 30/04/2026 | Tool use completo (4 herramientas), fix system prompt | Verificar e2e con WhatsApp |
| 01/05/2026 | Pivot a Calendaria SaaS: docs, design tokens, sidebar, landing page | Panel con datos reales |
| 02/05/2026 mañana | Config agente→Supabase, agenda, auth, middleware, onboarding, MCP servers | WhatsApp e2e |
| 02/05/2026 tarde | WhatsApp e2e verificado, Google Calendar Paso 5, dominio, MCP Twilio | DNS + multi-tenant |
| 02/05/2026 noche | Multi-tenant WhatsApp (slug), agregar paciente proactivo, 1 número compartido | DNS + slug en onboarding |
| 03/05/2026 | DNS live, slug en onboarding, post-DNS completo | Auth real + /agenda modal |
| 03/05/2026 noche | Brand system, /agenda completa, /agente horarios, webhook n8n | Auth real + Fase 3 |
| 02/05/2026+ | Auth real, GitHub Actions cron, eliminar paciente, click calendario, solapamiento, correccion.md | Probar registro + MercadoPago + Resend |
| 03/05/2026 loop | Auditoría multi-tenant: 7 fixes seguridad en agenda/pacientes/conversaciones/n8n/cron/onboarding | Probar registro nuevo usuario |
| 03/05/2026 loop 2 | Auditoría final PROFESIONAL_ID + 5 bugs UX/lógica (agent-tools, twilio fallback, onboarding, pacientes, conversaciones) | Probar registro nuevo usuario |
| 03/05/2026 loop 3 | Precios editables, loading skeleton, empty states mejorados, metadata por ruta, WhatsApp status honesto | MercadoPago + Resend + probar registro |
| 03/05/2026 loop 4 | Tomar control conversaciones, código MP+Resend (activados por env var), 404, slug normalization | Pegar credenciales MP+Resend + probar registro |
| 03/05/2026 loop 5 | Webhook MP implementado, OG tags, mobile responsive (agenda+conversaciones), Twilio spam fix | Pegar credenciales MP+Resend + probar registro |
| 03/05/2026 loop 6 | Error boundaries, loading skeletons (conversaciones/pacientes/agenda), copiar link en /configuracion, /w/slug mejorado, FAQ + CTAs landing | Pegar credenciales MP+Resend + probar registro |
| 03/05/2026 loop 7 | /pagos, Aurora mejorada (out-of-hours+nombre prof+crisis), email pacientes, CSV export, dashboard metrics (confirmación+próximo turno), agenda modal turnos del día, RLS write policies migration | Ejecutar migración RLS + activar MP+Resend |
