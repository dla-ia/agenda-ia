# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 02/05/2026
**Sesión:** Auth completo + panel con datos reales + calendario semanal + config dinámica del agente

### ¿Dónde quedamos?
El panel de Calendaria está completo y conectado a Supabase real. Todas las páginas del panel tienen datos reales. Se implementó el sistema de auth completo: login, registro, onboarding wizard y middleware de protección de rutas.

El agente Aurora ahora usa la configuración que el profesional guardó en `/agente` (nombre, tono, saludo, frases prohibidas) — el system prompt se genera dinámicamente en cada conversación de WhatsApp.

Se agregaron los MCP servers de Supabase y Vercel al config — necesitan que reinicies Claude Code para activarse.

### ¿Qué funciona?
- **App en producción:** https://agenda-ia-gray.vercel.app
- **Todas las páginas del panel con datos reales de Supabase:**
  - `/dashboard` → métricas reales (turnos, señas, no-shows, pacientes)
  - `/conversaciones` → mensajes reales de WhatsApp
  - `/agenda` → calendario semanal navegable con turnos reales
  - `/pacientes` → lista + ficha con historial
  - `/agente` → 5 tabs, config se guarda y carga desde Supabase
- **Auth:**
  - `/auth` → login/registro (email confirmado automáticamente via Admin API)
  - `/onboarding` → wizard 3 pasos (perfil, agente, listo)
  - `middleware.ts` → protege rutas (bypass activo, ver abajo)
  - Sidebar → logout + email de sesión
- **Agente Aurora:** system prompt dinámico desde `configuraciones` table
- **Webhook Twilio:** activo en Vercel, recibe WhatsApp → Claude → responde
- **Google Calendar OAuth:** end-to-end (token guardado, escritura pendiente)
- **MCP servers:** Supabase + Vercel en config (activar reiniciando Claude Code)

### Credenciales y datos clave
- **App producción:** https://agenda-ia-gray.vercel.app
- **Supabase:** https://aikwrtxmkdthnsnrnjng.supabase.co (project ref: `aikwrtxmkdthnsnrnjng`)
- **Profesional prueba ID:** 02bccd60-4947-49fc-877d-f109665920f2
- **Google Cloud proyecto:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 → webhook en /api/webhooks/twilio
- **Teléfono de prueba:** +5491159530792
- **Modelo Claude:** claude-sonnet-4-6
- **Credenciales:** en `.env.local` (NO en git) y en Vercel (15+ vars)

### ¿Qué está roto o incompleto?
- **WhatsApp e2e:** no fue verificado post-últimos cambios (system prompt dinámico). Probar mandando un mensaje al sandbox.
- **Google Calendar escritura:** token guardado pero el agente no crea eventos al confirmar turno (Paso 5 pendiente)
- **Google Cloud OAuth URI:** falta `https://agenda-ia-gray.vercel.app/api/auth/google/callback` en Google Cloud Console
- **Auth obligatorio:** el middleware está en bypass mientras `NEXT_PUBLIC_PROFESIONAL_ID` esté en Vercel. Para activar auth real: eliminar esa variable de Vercel.
- **Agenda modal:** botón "+ Turno" y acciones (cancelar, marcar completado) son UI sin funcionalidad
- **MCP servers:** agregados al config pero no cargados — requieren reiniciar Claude Code

### El próximo paso concreto es
> 1. **Reiniciar Claude Code** → los MCPs de Supabase y Vercel quedan activos
> 2. **Verificar e2e WhatsApp:** mandar un mensaje al sandbox y confirmar que el agente responde con horarios y crea el turno correctamente
> 3. **Google Calendar Paso 5:** en `crear_turno` (agent-tools.ts), después de insertar el turno en Supabase, llamar a Google Calendar API para crear el evento

---

## Historial de sesiones
| Fecha | Lo que se hizo | Próximo paso |
|-------|---------------|--------------|
| 29/04/2026 | Estructura inicial, deploy Vercel, panel web básico | OAuth Google Calendar |
| 30/04/2026 | Supabase cloud, OAuth Google Calendar, webhook Twilio, deploy prod | Agente Claude con tool use |
| 30/04/2026 | Tool use completo (4 herramientas), deploy | Verificar e2e, Paso 5 Google Calendar |
| 30/04/2026 | Fix system prompt (flujo bloqueado en confirmación), deploy vía GitHub | Verificar e2e con WhatsApp |
| 01/05/2026 | Pivot a Calendaria SaaS: docs, design tokens, sidebar, landing page | Panel con datos reales |
| 02/05/2026 | Config agente→Supabase, agenda calendario, auth completo, middleware, onboarding, MCP servers | Verificar WhatsApp e2e + Google Calendar Paso 5 |
