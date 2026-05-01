# Arquitectura de Calendaria

## Visión general
Calendaria es un SaaS multi-tenant donde cada profesional tiene su propio agente IA que gestiona turnos vía WhatsApp. La plataforma soporta cualquier tipo de profesional: psicólogos, odontólogos, mecánicos, nutricionistas, etc.

## Estructura de carpetas
```
/
├── src/
│   ├── app/
│   │   ├── page.tsx              → Landing page pública (marketing)
│   │   ├── layout.tsx            → Root layout (fonts, metadata)
│   │   ├── dashboard-layout.tsx  → Sidebar + topbar del panel del profesional
│   │   ├── globals.css           → Design tokens + utilidades CSS
│   │   ├── dashboard/
│   │   │   └── page.tsx          → Resumen de actividad del agente
│   │   ├── conversaciones/
│   │   │   └── page.tsx          → Inbox WhatsApp + razonamiento IA
│   │   ├── agenda/
│   │   │   └── page.tsx          → Calendario semanal sincronizado
│   │   ├── pacientes/
│   │   │   └── page.tsx          → Lista + ficha de pacientes/clientes
│   │   ├── agente/
│   │   │   └── page.tsx          → Config del agente IA (5 tabs)
│   │   ├── auth/
│   │   │   └── page.tsx          → Login / registro de profesionales
│   │   ├── onboarding/
│   │   │   └── page.tsx          → Wizard de setup inicial
│   │   └── api/
│   │       ├── webhooks/
│   │       │   └── twilio/route.ts   → Recibe mensajes WhatsApp
│   │       └── auth/
│   │           └── google/route.ts   → OAuth Google Calendar
│   ├── components/
│   │   ├── ui/                   → Card, Button, Badge, Avatar, Toggle, Tabs
│   │   ├── layout/               → Sidebar, TopBar
│   │   ├── dashboard/            → MetricCard, ActivityFeed, AgendaHoy
│   │   ├── conversaciones/       → ChatPane, ReasoningPanel, ChatBubble
│   │   ├── agenda/               → WeekCalendar, AppointmentModal
│   │   ├── pacientes/            → PatientList, PatientDetail
│   │   └── agente/               → PersonalidadTab, ReglasTab, PreciosTab, etc.
│   ├── lib/
│   │   ├── supabase.ts           → Cliente Supabase + tipos
│   │   ├── claude-agent.ts       → Agente Claude con tool use
│   │   ├── agent-tools.ts        → Herramientas del agente
│   │   └── google-calendar.ts    → Google Calendar API
│   └── types/
│       └── supabase.ts           → Tipos generados por Supabase
├── supabase/
│   ├── config.toml
│   └── schema.sql                → 8 tablas, RLS, función get_disponibilidad
├── design_handoff_agendaia/      → Referencia de diseño hi-fi (NO portar al prod)
│   └── AgendaIA.html             → Ver con: python -m http.server 8000
├── tailwind.config.js            → Design tokens mapeados a Tailwind
└── CLAUDE.md                     → Memoria del proyecto
```

## Flujo principal (agente en producción)
```
Paciente → Twilio Webhook → /api/webhooks/twilio
         → Claude API (tool use) → get_disponibilidad / crear_turno / etc.
         → Supabase (guardar turno + mensaje)
         → Google Calendar (crear evento)
         → Twilio API (TwiML → responder al paciente)
         → [Fase 2] MercadoPago (cobrar seña) → Resend (confirmar email)
```

## Multi-tenancy
- Cada profesional tiene un registro en tabla `profesionales`
- Todas las tablas tienen `profesional_id` como FK
- Row Level Security (RLS) en Supabase: cada profesional solo ve sus datos
- El agente recibe `profesional_id` desde el webhook de Twilio
- Auth: Supabase Auth (email/password en MVP, Google OAuth a futuro)

## Integraciones externas
| Servicio | Para qué | Estado |
|----------|----------|--------|
| Twilio | WhatsApp Business API | ✅ Sandbox conectado |
| Claude API | Agente conversacional | ✅ claude-sonnet-4-6 con tool use |
| Google Calendar | Sincronización de turnos | ✅ OAuth OK · ⚠️ escritura pendiente |
| Supabase | DB + Auth multi-tenant | ✅ Cloud configurado |
| MercadoPago | Cobro de señas | 🔜 Fase 2 |
| Resend | Emails transaccionales | 🔜 Fase 2 |

## Decisiones técnicas

### Next.js 14 App Router
App Router + React Server Components para layouts persistentes (sidebar) sin re-render completo. Cada ruta del panel es un page.tsx server component; las partes interactivas son client components.

### Supabase con RLS
Multi-tenancy a nivel DB sin lógica extra en la app. Cada query filtra automáticamente por el profesional autenticado.

### Claude Sonnet como agente
Capacidad de razonamiento real para entender intención, manejar contexto multi-turno y ejecutar tool calls (reservar turnos, consultar disponibilidad, cancelar).

### Sistema de diseño propio (tokens tierra)
Paleta terracota/arena/hueso con Fraunces serif para números grandes. Design tokens centralizados en `tailwind.config.js` y `globals.css`. Referencia visual en `design_handoff_agendaia/`.

### n8n para automatizaciones
Recordatorios, follow-ups y flujos secundarios sin escribir código custom.
