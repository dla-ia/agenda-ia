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
- **Tablas nuevas en Supabase:** crear siempre con `GRANT` explícito por rol (anon/authenticated/service_role) usando `supabase/migrations/_TEMPLATE_nueva_tabla.sql`. Desde el 30/10/2026 una tabla de `public` sin GRANT no es visible para supabase-js.

## Seguridad — credenciales
- Nunca hardcodear API keys, tokens, secrets, passwords en código (`.ts`, `.tsx`, `.js`, `.json`, `.md`, `.claude/*`). Todo va a `.env.local` (gitignored) o variables de Vercel.
- `.env.local` jamás se versiona. Solo `.env.example` con placeholders.
- Antes de cada commit, auditar: `python D:\Z-IA\TOOLS\secure-kit\audit_secrets.py .` — si hay CRIT fuera de `.env`, arreglar antes de commitear.
- Webhooks (Twilio, MercadoPago, n8n): validar firma/secret del proveedor antes de procesar el body. Sin firma válida → 401/400.
- `SUPABASE_SERVICE_ROLE_KEY` bypasea RLS — solo server-side, nunca en código cliente ni en vars `NEXT_PUBLIC_`.
- Credencial que estuvo hardcodeada = comprometida. Rotar en el panel del proveedor. Si el repo fue público, además purgar historia con `git filter-repo`.
- Kit reusable: `D:\Z-IA\TOOLS\secure-kit\` (audit/migrate de secrets).

## Profesional de prueba (desarrollo)
- ID: 02bccd60-4947-49fc-877d-f109665920f2
- Twilio sandbox: whatsapp:+14155238886
- Teléfono test: +5491159530792

## Docs del proyecto
@docs/architecture.md
@docs/tasks.md
@docs/context.md
@docs/correccion.md

## Protocolo de correcciones
Cuando Diego escribe `corrección: [descripción]`, Claude:
1. Evalúa tipo (UI / UX / Lógica / Datos / Perf / Seguridad)
2. Corrige directamente sin preguntas si el problema es claro
3. Registra una fila en `docs/correccion.md` con fecha y archivos afectados
4. Actualiza `docs/tasks.md` si corresponde

## Estado actual
Ver @docs/tasks.md para el progreso detallado.
