# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 03/05/2026 (noche)
**Sesión:** Brand system completo + /agenda funcional + /agente horarios editables + webhook n8n recordatorios

### ¿Dónde quedamos?
Cerramos con el panel 100% funcional y la identidad de marca aplicada en toda la app. El único endpoint que falta integrar en n8n es el de recordatorios, que ya está construido y esperando el workflow. Las APIs de Fase 3 (MercadoPago, Resend) están vacías — cuando el usuario agregue esas claves se puede avanzar.

### ¿Qué funciona?
- **App en producción:** https://calendaria.com.ar ✅ (dominio definitivo con SSL)
- **Brand system:** Lockup/Isotype/Wordmark en sidebar, landing, auth y onboarding. App icon generado. next/font/google activo.
- **WhatsApp multi-tenant:** `/w/demo` → wa.me con TURNO:demo → Aurora del profesional correcto
- **Onboarding con slug:** auto-sugerido desde especialidad + validación en tiempo real + preview del link
- **Agregar paciente:** botón "+ Paciente" → modal → crea en DB + manda WhatsApp proactivo
- **WhatsApp e2e verificado:** saludo → disponibilidad → confirmación → conversación se cierra
- **Google Calendar:** evento creado al confirmar turno (best-effort), URI de prod configurada
- **/agenda completa:** navegación semanal, modal "+ Turno" con autocomplete, cancelar y completar conectados a Supabase
- **/agente completo:** 5 tabs. "Reglas de agenda" editable con Toggle por día + inputs de hora
- **Auth:** login/registro/onboarding/middleware (bypass activo via env var)
- **Agente Aurora:** system prompt dinámico desde `configuraciones` table
- **Recordatorios:** endpoint `/api/webhooks/n8n` listo para recibir llamadas de n8n

### Arquitectura WhatsApp multi-tenant
```
Profesional A → slug: "garcia-psico"
Link: calendaria.com.ar/w/garcia-psico
  → wa.me/14155238886?text=TURNO:garcia-psico

Profesional B → slug: "lopez-nutricion"
Link: calendaria.com.ar/w/lopez-nutricion
  → wa.me/14155238886?text=TURNO:lopez-nutricion

Ambos comparten +14155238886, $15/mes fijo para TODOS
```

Webhook routing (`/api/webhooks/twilio/route.ts`):
1. `To` es número individual del prof → busca por `twilio_number`
2. Mensaje empieza con `TURNO:slug` → busca por `slug`
3. Teléfono tiene conversación previa → usa `profesional_id` de la última
4. Fallback → `NEXT_PUBLIC_PROFESIONAL_ID` (desarrollo)

### Endpoint de recordatorios (para configurar en n8n)
```
POST https://calendaria.com.ar/api/webhooks/n8n
Header: x-webhook-secret: calendaria_n8n_secret_2026
Body:   { "turno_id": "UUID", "tipo": "24h" }   // o "2h"
```
n8n workflow sugerido: Cron cada hora → Supabase query turnos en ventana → loop → HTTP Request al endpoint.

### Credenciales y datos clave
- **App producción:** https://calendaria.com.ar (también: https://agenda-ia-gray.vercel.app)
- **Supabase:** https://aikwrtxmkdthnsnrnjng.supabase.co (project ref: `aikwrtxmkdthnsnrnjng`)
- **Profesional prueba ID:** 02bccd60-4947-49fc-877d-f109665920f2 · slug: `demo`
- **Link de prueba:** https://calendaria.com.ar/w/demo
- **Google Cloud proyecto:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 → webhook en /api/webhooks/twilio
- **Teléfono de prueba:** +5491159530792
- **Modelo Claude:** claude-sonnet-4-6
- **Credenciales:** en `.env.local` (NO en git) y en Vercel (15+ vars)
- **n8n webhook secret:** `calendaria_n8n_secret_2026` (en .env.local y agregar a Vercel)

### ¿Qué está pendiente?
- **Auth real:** eliminar `NEXT_PUBLIC_PROFESIONAL_ID` de Vercel para activar auth obligatorio (cuando haya usuarios reales). Probar flujo registro → onboarding → dashboard.
- **n8n workflow:** configurar en n8n el cron que llama al endpoint de recordatorios (código listo, falta el workflow)
- **Agregar `N8N_WEBHOOK_SECRET` a Vercel** (actualmente solo en .env.local)
- **MercadoPago:** generar link de seña al crear turno (requiere `MERCADOPAGO_ACCESS_TOKEN`)
- **Resend:** email de confirmación de turno (requiere `RESEND_API_KEY`)
- **WhatsApp producción:** salir del sandbox Twilio (requiere WhatsApp Business aprobado por Meta)
- **MCP servers:** activar reiniciando Claude Code (Supabase, Vercel, Twilio MCPs ya configurados)

### El próximo paso concreto es
> **INMEDIATO — n8n MCP (quedó a mitad):**
> Paquete listo: `n8n-mcp`. Falta que Diego dé:
> 1. URL de la instancia n8n (ej: `http://IP:5678` o `https://n8n.dominio.com`)
> 2. API key (n8n → Settings → API → Create an API Key)
> Con eso, agregar a `.claude/settings.local.json` y reiniciar Claude Code.
>
> **Después:**
> 3. Agregar `N8N_WEBHOOK_SECRET` a Vercel y crear el workflow de recordatorios en n8n
> 4. Activar auth real: eliminar `NEXT_PUBLIC_PROFESIONAL_ID` de Vercel
> 5. Fase 3: keys de MercadoPago y Resend → seña + email confirmación

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
| 02/05/2026 noche | Multi-tenant WhatsApp (slug), agregar paciente proactivo, arquitectura 1 número compartido | DNS + slug en onboarding |
| 03/05/2026 | DNS live (calendaria.com.ar), slug en onboarding, post-DNS completo (Twilio+GCloud+Vercel) | Auth real + /agenda modal |
| 03/05/2026 noche | Brand system, /agenda completa, /agente horarios editables, webhook n8n recordatorios | n8n workflow + auth real + Fase 3 |
