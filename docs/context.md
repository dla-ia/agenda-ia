# Contexto de Continuidad — Calendaria

> Este archivo es para vos y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 03/05/2026
**Sesión:** DNS calendaria.com.ar live + slug en onboarding + post-DNS completo

### ¿Dónde quedamos?
calendaria.com.ar está live con SSL. Se completó todo el post-DNS: webhook Twilio apuntando al dominio definitivo, Google Cloud OAuth con la URI de producción, y NEXT_PUBLIC_APP_URL actualizado en Vercel. También se agregó el campo slug al onboarding con auto-sugerencia y validación en tiempo real.

### ¿Qué funciona?
- **App en producción:** https://calendaria.com.ar ✅ (dominio definitivo live)
- **WhatsApp multi-tenant:** `/w/demo` → wa.me con TURNO:demo → Aurora del profesional correcto
- **Onboarding con slug:** al registrarse, el profesional elige su link de WhatsApp (auto-sugerido desde la especialidad)
- **Agregar paciente:** botón "+ Paciente" en /pacientes → modal → crea en DB + manda WhatsApp
- **WhatsApp e2e verificado:** saludo → disponibilidad → confirmación → conversación se cierra
- **Google Calendar:** evento creado al confirmar turno (best-effort), URI de prod configurada
- **Panel completo** con datos reales: dashboard, conversaciones, agenda, pacientes, agente
- **Auth:** login/registro/onboarding/middleware (bypass activo via env var)
- **Agente Aurora:** system prompt dinámico desde `configuraciones` table

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

### Credenciales y datos clave
- **App producción:** https://agenda-ia-gray.vercel.app
- **Supabase:** https://aikwrtxmkdthnsnrnjng.supabase.co (project ref: `aikwrtxmkdthnsnrnjng`)
- **Profesional prueba ID:** 02bccd60-4947-49fc-877d-f109665920f2 · slug: `demo`
- **Link de prueba:** https://agenda-ia-gray.vercel.app/w/demo
- **Google Cloud proyecto:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 → webhook en /api/webhooks/twilio
- **Teléfono de prueba:** +5491159530792
- **Modelo Claude:** claude-sonnet-4-6
- **Credenciales:** en `.env.local` (NO en git) y en Vercel (15+ vars)

### ¿Qué está pendiente?
- **Auth real:** eliminar `NEXT_PUBLIC_PROFESIONAL_ID` de Vercel para activar auth obligatorio (cuando haya usuarios reales)
- **Agenda modal:** `+ Turno`, cancelar, marcar completado — UI sin funcionalidad
- **Agente tab "Reglas":** editar horarios por día (actualmente fijo 09:00-19:00)
- **WhatsApp producción:** salir del sandbox para clientes reales (requiere WhatsApp Business aprobado por Meta)
- **Fase 3:** MercadoPago (seña), n8n recordatorios, Resend email confirmación

### El próximo paso concreto es
> 1. Activar auth real (eliminar NEXT_PUBLIC_PROFESIONAL_ID de Vercel) + probar registro → onboarding → dashboard
> 2. Funcionalidad completa en /agenda (+ Turno, cancelar, completar)
> 3. O avanzar con Fase 3: MercadoPago / recordatorios

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
