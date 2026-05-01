# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 02/05/2026
**Sesión:** WhatsApp e2e verificado + Google Calendar Paso 5 + dominio calendaria.com.ar + MCP Twilio

### ¿Dónde quedamos?
El flujo central del agente está funcionando end-to-end y verificado: WhatsApp → Claude → Supabase → TwiML. Se corrigió el problema de contaminación de contexto (historial limitado a 10 mensajes, conversación se cierra al confirmar turno). Google Calendar Paso 5 implementado: al crear un turno se crea el evento en Calendar del profesional.

El dominio `calendaria.com.ar` fue registrado y agregado al proyecto Vercel. Falta que Diego cargue las delegaciones en NIC Argentina (nameservers de Vercel) para que el DNS propague.

MCP de Twilio configurado en `.claude/settings.local.json` — se activa reiniciando Claude Code.

### ¿Qué funciona?
- **App en producción:** https://agenda-ia-gray.vercel.app
- **WhatsApp e2e verificado:** saludo limpio → disponibilidad → confirma turno → conversación se cierra
- **Google Calendar:** al confirmar turno, se crea evento automáticamente (best-effort)
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
- **Dominio:** calendaria.com.ar agregado a Vercel, `www` → redirect 301 a raíz

### Credenciales y datos clave
- **App producción:** https://agenda-ia-gray.vercel.app (dominio definitivo: calendaria.com.ar — pendiente DNS)
- **Supabase:** https://aikwrtxmkdthnsnrnjng.supabase.co (project ref: `aikwrtxmkdthnsnrnjng`)
- **Profesional prueba ID:** 02bccd60-4947-49fc-877d-f109665920f2
- **Google Cloud proyecto:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 → webhook en /api/webhooks/twilio
- **Teléfono de prueba:** +5491159530792
- **Modelo Claude:** claude-sonnet-4-6
- **Credenciales:** en `.env.local` (NO en git) y en Vercel (15+ vars)

### ¿Qué está pendiente?
- **DNS calendaria.com.ar:** Diego tiene que cargar en NIC Argentina:
  - `ns1.vercel-dns.com` y `ns2.vercel-dns.com` como delegaciones → EJECUTAR CAMBIOS
  - Una vez propagado (hasta 48hs), Vercel emite SSL automáticamente
- **Post-DNS (Claude lo hace):**
  - Actualizar `NEXT_PUBLIC_APP_URL` en Vercel → `https://calendaria.com.ar`
  - Agregar `https://calendaria.com.ar/api/auth/google/callback` en Google Cloud Console
  - Actualizar webhook Twilio → `https://calendaria.com.ar/api/webhooks/twilio`
- **Auth obligatorio:** middleware en bypass mientras `NEXT_PUBLIC_PROFESIONAL_ID` esté en Vercel. Eliminar esa variable cuando haya usuarios reales.
- **Agenda modal:** botón "+ Turno" y acciones (cancelar, marcar completado) son UI sin funcionalidad
- **MCP servers:** requieren reiniciar Claude Code para activarse:
  - Supabase MCP (autenticar después de reinicio)
  - Vercel MCP (autenticar después de reinicio)
  - Twilio MCP (ya configurado en settings.local.json, listo para usar tras reinicio)

### El próximo paso concreto es
> 1. **Diego carga delegaciones en NIC Argentina** → `ns1.vercel-dns.com` + `ns2.vercel-dns.com` → EJECUTAR CAMBIOS
> 2. **Reiniciar Claude Code** → MCPs de Supabase, Vercel y Twilio quedan activos
> 3. **Post-DNS propagado:** Claude actualiza URLs (APP_URL en Vercel, Google Cloud, Twilio webhook)
> 4. **Siguiente feature:** modal "+ Turno" en agenda, o activar auth real eliminando NEXT_PUBLIC_PROFESIONAL_ID

---

## Historial de sesiones
| Fecha | Lo que se hizo | Próximo paso |
|-------|---------------|--------------|
| 29/04/2026 | Estructura inicial, deploy Vercel, panel web básico | OAuth Google Calendar |
| 30/04/2026 | Supabase cloud, OAuth Google Calendar, webhook Twilio, deploy prod | Agente Claude con tool use |
| 30/04/2026 | Tool use completo (4 herramientas), deploy | Verificar e2e, Paso 5 Google Calendar |
| 30/04/2026 | Fix system prompt (flujo bloqueado en confirmación), deploy vía GitHub | Verificar e2e con WhatsApp |
| 01/05/2026 | Pivot a Calendaria SaaS: docs, design tokens, sidebar, landing page | Panel con datos reales |
| 02/05/2026 mañana | Config agente→Supabase, agenda calendario, auth completo, middleware, onboarding, MCP servers | Verificar WhatsApp e2e + Google Calendar Paso 5 |
| 02/05/2026 tarde | WhatsApp e2e verificado, Google Calendar Paso 5, fix contaminación historial, dominio calendaria.com.ar, MCP Twilio | Cargar DNS en NIC + reiniciar Claude Code |
