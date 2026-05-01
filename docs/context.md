# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 01/05/2026
**Sesión:** Pivot de scope + fundación del sistema de diseño

### ¿Dónde quedamos?
Pivoteamos el proyecto de "AgendaIA para psicólogos" a **Calendaria**, un SaaS multi-profesional donde cualquier profesional (psicólogo, mecánico, odontólogo, etc.) contrata un agente IA que gestiona su agenda por WhatsApp.

Se actualizó toda la documentación (CLAUDE.md, architecture.md, tasks.md, context.md) y se implementó el sistema de diseño completo del handoff: design tokens en tailwind.config.js, variables CSS en globals.css (paleta tierra cálida, Fraunces + Inter + JetBrains Mono), y sidebar rediseñada con identidad Calendaria.

### ¿Qué funciona?
- App en producción: https://agenda-ia-gray.vercel.app (nombre a actualizar cuando tengamos dominio)
- Supabase cloud: schema completo, profesional de prueba, RLS activo
- Google Calendar OAuth end-to-end (token guardado en Supabase)
- Webhook `/api/webhooks/twilio` activo en Vercel
- Twilio sandbox conectado al teléfono de prueba (+5491159530792 → +14155238886)
- 13 variables de entorno en Vercel
- Agente Claude con tool use: get_disponibilidad, crear_turno, ver_turnos_paciente, cancelar_turno
- Timezone UTC-3 (Argentina) correcto
- Sistema de diseño: tokens tierra en Tailwind + globals.css + sidebar rediseñada

### Credenciales y datos clave
- **App producción:** https://agenda-ia-gray.vercel.app
- **Supabase:** https://aikwrtxmkdthnsnrnjng.supabase.co
- **Profesional prueba ID:** 02bccd60-4947-49fc-877d-f109665920f2
- **Google Cloud proyecto:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 (whatsapp:+14155238886)
- **Modelo Claude:** claude-sonnet-4-6
- **Credenciales:** en `.env.local` (NO en git) y en Vercel (13 vars)

### ¿Qué está roto o incompleto?
- El agente e2e con WhatsApp no fue re-verificado post-fix (pendiente de test)
- Google Calendar: token guardado pero agente no escribe eventos aún (Paso 5)
- Panel web: muestra datos dummy, sin conexión real a Supabase aún
- Google Cloud OAuth: falta URI de producción `https://agenda-ia-gray.vercel.app/api/auth/google/callback`
- Landing page: no existe aún (prioridad para el pivot SaaS)
- MercadoPago y Resend: no configurados (Fase 2)

### El próximo paso concreto es
> **Landing page** (`/`): hero con propuesta de valor de Calendaria + sección de profesiones + CTA de registro.
> Usar los design tokens ya configurados y el diseño del handoff como referencia.

---

## Historial de sesiones
| Fecha | Lo que se hizo | Próximo paso |
|-------|---------------|--------------|
| 29/04/2026 | Estructura inicial, deploy en Vercel, panel web básico | OAuth Google Calendar |
| 30/04/2026 | Supabase cloud, OAuth Google Calendar, webhook Twilio, deploy a producción | Agente Claude con tool use |
| 30/04/2026 | Paso 4: tool use completo (4 herramientas), deploy a producción | Verificar e2e, Paso 5 Google Calendar |
| 30/04/2026 | Fix system prompt (flujo bloqueado en confirmación), deploy vía GitHub | Verificar e2e con WhatsApp |
| 01/05/2026 | Pivot a Calendaria SaaS: docs actualizados, design tokens, sidebar rediseñada | Landing page pública + panel con datos reales |
