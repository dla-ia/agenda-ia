# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 14/05/2026 (sesión — Supabase Data API hardening, secure-kit, SSH setup, auditoría de seguridad completa)
**Sesión:** template GRANT para tablas nuevas (cambio Supabase 30/10/2026), reglas de seguridad en CLAUDE.md, secure-kit auditado y mejorado, SSH key dedicada para GitHub (push sin tokens), y auditoría de seguridad punta a punta del codebase: 10 correcciones (#41-50).

### ¿Dónde quedamos?
**Auditoría de seguridad completa** — todo el codebase revisado (webhooks, cron, auth routes, data routes, OAuth, middleware, lib/agente). 10 hallazgos cerrados (#41-50): 1 crítico (mass-assignment en `auth/profesional` PATCH), 4 altos (POST sin auth, firma Twilio, fail-open n8n/cron, hijack de Google Calendar), 2 medios (doble-booking en `crear_turno`, scoping de `cancelar_turno`), 3 bajos (HTML injection en email, fecha sin validar, offset ART). Antes: Supabase Data API hardening (template GRANT + reglas en CLAUDE.md) y setup de SSH para GitHub.

**Pendiente: verificación post-deploy** (necesita a Diego) — ver "¿Qué está pendiente?".

### ¿Qué funciona?
- **App en producción:** https://calendaria.com.ar ✅
- **Auth real:** login/registro/onboarding protegido — `NEXT_PUBLIC_PROFESIONAL_ID` eliminado de Vercel
- **Login dev:** diego.leonardo.alvarez@gmail.com / Calendaria2026! (cuenta auth creada con UUID correcto)
- **Supabase MCP:** conectado y autenticado directamente desde Claude Code
- **Git push vía SSH:** key dedicada `~/.ssh/id_ed25519_github` + `~/.ssh/config` (`IdentitiesOnly yes`). Remote en SSH (`git@github.com:dla-ia/agenda-ia.git`). No más tokens/HTTPS — `gh` CLI no quedó autenticado
- **Seguridad — superficie pública auditada:** webhooks (Twilio valida `X-Twilio-Signature`, n8n/cron fail-closed + `timingSafeEqual`), `auth/profesional` (session check + whitelist de columnas), OAuth Google (state desde sesión, no query param), data routes (multi-tenant ownership OK), agente (`crear_turno` valida solapamiento, `cancelar_turno` scopeado al paciente)
- **secure-kit:** toolkit en `D:\Z-IA\TOOLS\secure-kit\` — `audit_secrets.py` corrido sobre Calendaria, sin leaks (`.env` bien gitignored, `client_secret.json` gitignored + untracked)
- **Supabase Data API:** `supabase/migrations/_TEMPLATE_nueva_tabla.sql` — toda tabla nueva debe crearse con GRANT explícito (cambio Supabase del 30/10/2026)
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
- **RLS:** `supabase/migrations/20260503_rls_write_policies.sql` — políticas INSERT/UPDATE/DELETE para todas las tablas ✅ ejecutado en Supabase Cloud (03/05/2026)

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
- **gh CLI instalado:** `C:\Users\DIEGO\AppData\Local\gh-cli\bin\gh.exe` — ⚠️ NO autenticado (el token expiró). Git usa SSH ahora, no `gh`
- **Git push:** SSH key `~/.ssh/id_ed25519_github` + `~/.ssh/config`. `gh auth login` sigue pendiente si se quiere usar el CLI

### ¿Qué está pendiente?
- **⚠️ Verificación post-deploy de los fixes de seguridad de hoy (#41-50):**
  1. **Webhook Twilio** — mandar 1 mensaje al sandbox. Si da 403, Vercel logs → `[Twilio webhook] Firma inválida` muestra el `publicUrl` reconstruido vs el configurado en Twilio
  2. **Registro nuevo profesional** — el POST `/api/auth/profesional` ahora exige sesión (debería andar, pero testear)
  3. **Conectar Google Calendar** desde `/configuracion` — el flujo OAuth ahora deriva de sesión
  4. **n8n** — confirmar `N8N_WEBHOOK_SECRET` en Vercel (el webhook ahora falla cerrado sin él)
- **MercadoPago activo:** código listo, solo falta pegar `MERCADOPAGO_ACCESS_TOKEN` en Vercel (cuenta de Diego)
- **Resend activo:** código listo, solo falta crear cuenta free en resend.com + pegar `RESEND_API_KEY` en Vercel
- **WhatsApp producción:** salir del sandbox Twilio (requiere WhatsApp Business aprobado por Meta)
- **Vercel MCP:** pendiente autenticar (`https://mcp.vercel.com`)
- **Twilio MCP:** requiere reinicio de Claude Code
- **M2 (riesgo aceptado):** webhook MercadoPago no valida `x-signature` — mitigado por re-fetch a la API de MP
- **L4 (bajo, sin tocar):** `claude-agent.ts` relaya `String(err)` al modelo — info leak menor

### El próximo paso concreto es
> 1. **Verificar los 4 puntos post-deploy** de arriba — son los fixes de seguridad de hoy, conviene confirmar que no rompieron nada
> 2. **Activar MercadoPago:** Diego pega `MERCADOPAGO_ACCESS_TOKEN` en Vercel → al crear un turno aparece botón "Cobrar seña"
> 3. **Activar Resend:** Diego crea cuenta free en resend.com → pega `RESEND_API_KEY`
> 4. **Probar registro nuevo profesional** en calendaria.com.ar

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
| 03/05/2026 cierre | RLS write policies ejecutado en Supabase SQL editor (Success ✅) — 40 correcciones registradas, todos los features de Fase 1 completos | Activar MP+Resend + probar registro nuevo |
| 14/05/2026 | Supabase Data API hardening (template GRANT + reglas CLAUDE.md), secure-kit auditado/mejorado, SSH key para GitHub, auditoría de seguridad completa del codebase: 10 correcciones #41-50 (1 crít, 4 altos, 2 medios, 3 bajos) | Verificar 4 puntos post-deploy + activar MP+Resend + probar registro |
