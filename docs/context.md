# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 03/05/2026 (sesión autónoma — MP webhook + SEO + mobile responsive + spam protection)
**Sesión:** Webhook MercadoPago + OG tags + fixes mobile agenda/conversaciones + validación Twilio

### ¿Dónde quedamos?
4 tareas completadas: (1) `/api/webhooks/mercadopago` implementado — recibe IPN de MP, verifica pago, actualiza turno y tabla pagos. (2) OG tags completos (openGraph + Twitter card). (3) Responsive mobile: modales fluid en agenda, /conversaciones con toggle lista/chat en mobile, svh fix. (4) Twilio webhook: validación de campos requeridos + rechazo de requests malformados.

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
- **/agenda mobile:** modales fluid (`min(Xpx, calc(100vw - 32px))`), grid con minmax, svh
- **/pacientes:** botón "Eliminar" con confirmación inline (cancela turnos futuros automáticamente)
- **/agente tab "Precios":** tarifas editables (label/precio/duración), agregar/quitar filas, persisten en `agente_tarifas`
- **/agente tab "Integraciones":** estados reales — WhatsApp pendiente, Calendar conectado
- **/dashboard:** loading.tsx con skeleton shimmer mientras carga SSR
- **404 personalizada:** not-found.tsx con design tokens, redirige a /dashboard si logueado
- **Metadata + OG tags:** título, description, openGraph, twitter card — en todas las rutas
- **MercadoPago webhook:** `/api/webhooks/mercadopago` — procesa IPN, actualiza turno a 'confirmado'
- **Twilio webhook:** validación de campos `From/To/Body` requeridos — 400 si faltan
- **Brand system:** Lockup/Isotype/Wordmark, app icon, next/font/google activo
- **WhatsApp multi-tenant:** `/w/slug` → Aurora del profesional correcto
- **Agente Aurora:** system prompt dinámico, tool use (get_disponibilidad, crear_turno, cancelar, ver)
- **Google Calendar:** evento creado al confirmar turno (best-effort)
- **`docs/correccion.md`:** sistema de registro de bugs con protocolo `corrección:`

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
- **Probar flujo registro completo:** registrarse como nuevo profesional → onboarding → dashboard (no testeado post auth-real)
- **MercadoPago activo:** código listo, solo falta pegar `MERCADOPAGO_ACCESS_TOKEN` en Vercel (cuenta de Diego)
- **Resend activo:** código listo, solo falta crear cuenta free en resend.com + pegar `RESEND_API_KEY` en Vercel
- **WhatsApp producción:** salir del sandbox Twilio (requiere WhatsApp Business aprobado por Meta)
- **Vercel MCP:** pendiente autenticar (`https://mcp.vercel.com`)
- **Twilio MCP:** requiere reinicio de Claude Code

### El próximo paso concreto es
> 1. **Activar MercadoPago:** Diego pega `MERCADOPAGO_ACCESS_TOKEN` en Vercel → al crear un turno aparece botón "Cobrar seña"
> 2. **Activar Resend:** Diego crea cuenta free en resend.com → pega `RESEND_API_KEY` → al crear turno el paciente recibe email
> 3. **Probar registro nuevo profesional** en calendaria.com.ar — registrarse, onboarding, usar el panel
> 4. **WhatsApp producción:** salir del sandbox Twilio (requiere aprobación Meta WhatsApp Business)

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
