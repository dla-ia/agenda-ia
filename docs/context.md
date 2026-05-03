# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 03/05/2026 (sesión autónoma loop, 30 min)
**Sesión:** Auditoría de seguridad multi-tenant + fixes de producción en 7 archivos

### ¿Dónde quedamos?
7 vulnerabilidades de seguridad multi-tenant cerradas: PATCH/DELETE de agenda y pacientes ahora verifican ownership (`profesional_id`), conversaciones verifica ownership antes de devolver mensajes, n8n webhook tenía columna incorrecta (`nombre_profesional` → `nombre`) y faltaba prefijo `whatsapp:` en Twilio From (igual en cron/recordatorios). Onboarding Step3 corregido con `window.location.href`. /agenda ahora scrollea al horario actual.

### ¿Qué funciona?
- **App en producción:** https://calendaria.com.ar ✅
- **Auth real:** login/registro/onboarding protegido — `NEXT_PUBLIC_PROFESIONAL_ID` eliminado de Vercel
- **Login dev:** diego.leonardo.alvarez@gmail.com / Calendaria2026! (cuenta auth creada con UUID correcto)
- **Supabase MCP:** conectado y autenticado directamente desde Claude Code
- **GitHub Actions cron:** `.github/workflows/recordatorios.yml` corre cada hora, llama `/api/cron/recordatorios`
- **Recordatorios:** columnas `recordatorio_24h_enviado` y `recordatorio_2h_enviado` en `turnos`
- **/agenda:** click en espacio vacío del calendario → modal con fecha/hora pre-cargada
- **/agenda:** validación de solapamiento en POST (409 con nombre del paciente conflictivo)
- **/pacientes:** botón "Eliminar" con confirmación inline (cancela turnos futuros automáticamente)
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
- **MercadoPago:** generar link de seña al crear turno (requiere `MERCADOPAGO_ACCESS_TOKEN` — puede usar cuenta existente de Diego)
- **Resend:** email confirmación de turno (paquete `resend` instalado, requiere `RESEND_API_KEY` — free, sin tarjeta)
- **WhatsApp producción:** salir del sandbox Twilio (requiere WhatsApp Business aprobado por Meta)
- **Vercel MCP:** pendiente autenticar (`https://mcp.vercel.com`)
- **Twilio MCP:** requiere reinicio de Claude Code

### El próximo paso concreto es
> 1. **Probar registro nuevo profesional** en calendaria.com.ar — registrarse, onboarding, usar el panel (todos los bugs conocidos corregidos — está listo para probar)
> 2. **MercadoPago:** Diego pega su `MERCADOPAGO_ACCESS_TOKEN` (credencial de test) → integro el link de seña
> 3. **Resend:** Diego crea cuenta free en resend.com → pega `RESEND_API_KEY` → integro email de confirmación
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
