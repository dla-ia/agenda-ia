# Calendaria — SaaS de agentes IA para gestión de agenda

## Visión del producto
Calendaria es una plataforma SaaS donde cualquier profesional independiente (psicólogo, odontólogo, mecánico, nutricionista, etc.) puede contratar un agente de IA que gestiona su agenda de forma autónoma por WhatsApp: responde consultas, reserva turnos, cobra señas por MercadoPago, y envía recordatorios automáticos.

**El profesional no toca la agenda — el agente lo hace por él.**

## Stack
- Frontend: Next.js 14 + Tailwind CSS + Vercel
- Base de datos: Supabase (PostgreSQL + Auth multi-tenant)
- Agente IA: Claude API (claude-sonnet-4-6)
- Automatizaciones: n8n self-hosted (Docker en VPS)
- WhatsApp: WhatsApp Business API via Twilio
- Calendario: Google Calendar API (OAuth por profesional)
- Pagos: MercadoPago API
- Emails: Resend

## Modelo de negocio
- Profesionales pagan una suscripción mensual por su agente
- Cada profesional tiene su propia instancia del agente con nombre, tono y reglas configurables
- La plataforma es multi-tenant: datos aislados por profesional (RLS en Supabase)

## Sistema de diseño
- Paleta: tonos tierra cálidos (terracota, arena, hueso) — ver design tokens en `tailwind.config.js`
- Tipografía: Fraunces (serif, números y títulos) + Inter (UI) + JetBrains Mono (timestamps, código)
- Referencia visual: `design_handoff_agendaia/` — ejecutar `AgendaIA.html` con un servidor estático para ver los diseños

## Comandos clave
```
npm run dev        → inicia desarrollo local
npm run build      → build de producción
npx supabase start → inicia Supabase local
cd design_handoff_agendaia && python -m http.server 8000  → ver diseños en localhost:8000
```

## Estructura de rutas (app)
```
/                  → Landing page pública (qué es Calendaria, CTA registro)
/dashboard         → Panel del profesional — resumen de actividad del agente
/conversaciones    → Monitoreo de chats WhatsApp que maneja el agente
/agenda            → Calendario semanal sincronizado con Google Calendar
/pacientes         → Lista y ficha de cada paciente/cliente
/agente            → Configuración del agente IA (personalidad, reglas, precios)
/auth              → Login / registro de profesionales
/onboarding        → Wizard de setup inicial (WhatsApp, Calendar, configurar agente)
```

## Convenciones
- Archivos: kebab-case (ej. user-service.ts)
- Funciones/variables: camelCase
- Commits: conventional commits (feat:, fix:, docs:)
- Idioma del código: inglés / comentarios y copy: español argentino (vos, MercadoPago, $)
- El agente se llama **Aurora** por defecto (configurable por profesional)

## Reglas importantes
- Nunca modificar `/lib` sin avisar
- Siempre validar inputs del usuario en los webhooks
- El agente no da consejos de salud/técnicos — solo gestiona agenda
- Hablar en español rioplatense, tono cálido y profesional
- Protocolo de crisis (si alguien menciona autolesión): compartir líneas de ayuda (135 CABA, 0800-345-1435) y notificar al profesional

## Profesional de prueba (desarrollo)
- ID: 02bccd60-4947-49fc-877d-f109665920f2
- Twilio sandbox: whatsapp:+14155238886
- Teléfono test: +5491159530792

## Docs del proyecto
@docs/architecture.md
@docs/tasks.md
@docs/context.md

## Estado actual
Ver @docs/tasks.md para el progreso detallado.
