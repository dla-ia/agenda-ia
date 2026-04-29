# AgendaIA - Agente de WhatsApp para Psicólogos

## Descripción
Agente conversacional de IA que gestiona la agenda de un psicólogo de forma autónoma por WhatsApp: responde consultas, reserva turnos sincronizados con Google Calendar, cobra señas via MercadoPago, y envía recordatorios automáticos.

## Stack
- Frontend: Next.js 14 + Tailwind CSS + Vercel
- Base de datos: Supabase (PostgreSQL + Auth)
- Agente IA: Claude API (Claude Sonnet 4-2025-06-05)
- Automatizaciones: n8n self-hosted (Docker en VPS)
- WhatsApp: WhatsApp Business API via Twilio
- Calendario: Google Calendar API (OAuth)
- Pagos: MercadoPago API
- Emails: Resend

## Comandos clave
```
npm run dev        → inicia desarrollo local
npm run build      → build de producción
npx supabase start → inicia Supabase local
```

## Convenciones
- Archivos: kebab-case (ej. user-service.js)
- Funciones/variables: camelCase
- Commits: conventional commits (feat:, fix:, docs:)
- Idioma del código: inglés / comentarios: español

## Reglas importantes
- [Ej: No modificar /lib sin avisar]
- [Ej: Siempre validar inputs del usuario]
- [Ej: No dar consejos de salud mental - solo gestionar agenda]
- [Ej: Hablar en español rioplatense, tono cálido y profesional]

## Docs del proyecto
@docs/architecture.md
@docs/tasks.md

## Estado actual
Ver @docs/tasks.md para el progreso detallado.
