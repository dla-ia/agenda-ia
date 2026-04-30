# Contexto de Continuidad

> Este archivo es para VOS y para Claude Code.
> Actualizalo al final de cada sesión de trabajo.
> Al retomar, abrí con: "Leé @docs/context.md y continuamos"

---

## Último estado conocido
**Fecha:** 30/04/2026
**Sesión:** Paso 4 completado — Agente Claude con tool use para turnos reales

### ¿Dónde quedamos?
El agente Claude ahora tiene tool use completo. Cuando un paciente escribe por WhatsApp, Claude puede consultar disponibilidad real desde Supabase, crear turnos y cancelarlos. Se creó `src/lib/agent-tools.ts` con 4 herramientas y se actualizó `claude-agent.ts` con el loop agentic. Deploy a producción exitoso.

### ¿Qué funciona?
- App en producción: https://agenda-ia-gray.vercel.app
- Supabase cloud con schema completo y profesional creado
- Google Calendar OAuth end-to-end (token guardado en Supabase)
- Webhook `/api/webhooks/twilio` deployado en Vercel
- Sandbox de Twilio con webhook URL configurada
- Teléfono conectado al sandbox (+5491159530792 → sandbox +14155238886)
- 13 variables de entorno cargadas en Vercel
- **Agente Claude con tool use:** get_disponibilidad, crear_turno, ver_turnos_paciente, cancelar_turno
- **Timezone correcto:** todo en UTC-3 (Argentina), sin DST

### Credenciales y datos clave
- **App producción:** https://agenda-ia-gray.vercel.app
- **Supabase:** https://aikwrtxmkdthnsnrnjng.supabase.co
- **Profesional ID:** 02bccd60-4947-49fc-877d-f109665920f2
- **Google Cloud proyecto:** notional-weft-494920-k6
- **Twilio sandbox:** +14155238886 (whatsapp:+14155238886)
- **Twilio Account SID:** ver .env.local
- **Modelo Claude:** claude-sonnet-4-6

### ¿Qué está roto o incompleto?
- El panel web muestra datos dummy — no está conectado a Supabase todavía
- Google Cloud OAuth solo tiene `localhost:3000` como redirect — falta agregar la URL de Vercel para que funcione en producción
- Google Calendar: el token está guardado pero el agente aún no escribe eventos en el calendario
- MercadoPago y Resend no configurados

### El próximo paso concreto es
> Verificar end-to-end con WhatsApp que el agente consulta disponibilidad real.
> Luego: Paso 5 — Integración Google Calendar para escribir el evento cuando se crea un turno.

---

## Historial de sesiones
| Fecha | Lo que se hizo | Próximo paso |
|-------|---------------|--------------|
| 29/04/2026 | Estructura inicial, deploy en Vercel, panel web listo | OAuth Google Calendar |
| 30/04/2026 | Supabase cloud, OAuth Google Calendar, webhook Twilio, deploy a producción | Agente Claude con tool use para turnos reales |
| 30/04/2026 | Paso 4: tool use completo (get_disponibilidad, crear_turno, ver_turnos, cancelar_turno), deploy a producción | Verificar e2e, luego Paso 5 Google Calendar |
