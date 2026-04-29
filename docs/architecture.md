# Arquitectura del Proyecto

## Visión general
AgendaIA es un agente conversacional de IA que gestiona la agenda de un psicólogo de forma autónoma por WhatsApp. El sistema recibe mensajes de pacientes via Twilio, procesa las solicitudes con Claude API, y sincroniza turnos con Google Calendar del profesional.

## Estructura de carpetas
```
/
├── src/
│   ├── app/               → Next.js 14 App Router
│   │   ├── page.tsx       → Dashboard principal
│   │   ├── layout.tsx     → Layout raíz
│   │   └── globals.css   → Estilos globales
│   ├── lib/
│   │   ├── supabase.ts   → Cliente Supabase + tipos
│   │   └── claude-agent.ts → Cliente Claude API
│   └── types/             → Tipos TypeScript adicionales
├── supabase/
│   ├── config.toml       → Configuración local
│   └── schema.sql        → Schema de base de datos
├── docs/                 → Documentación del proyecto
├── public/               → Assets estáticos
├── package.json          → Dependencias del proyecto
├── next.config.js        → Configuración Next.js
├── tailwind.config.js    → Configuración Tailwind
└── CLAUDE.md             → Memoria del proyecto
```

## Flujo principal
```
Paciente → Twilio Webhook → n8n → Supabase (guardar mensaje)
       → Claude API (procesar) → Generar respuesta
       → Twilio API (enviar) → Paciente
       → Google Calendar API (sincronizar turno)
```

## Integraciones externas
| Servicio | Para qué | Docs |
|----------|----------|------|
| Twilio | WhatsApp Business API | https://www.twilio.com/docs/whatsapp |
| Anthropic Claude | Agente conversacional | https://docs.anthropic.com/ |
| Google Calendar | Sincronización de turnos | https://developers.google.com/calendar |
| Supabase | Base de datos + Auth | https://supabase.com/docs |
| MercadoPago | Cobro de señas (fase 2) | https://www.mercadopago.com.ar/developers |
| Resend | Emails transaccionales | https://resend.com/docs |

## Decisiones técnicas importantes

### Next.js 14 App Router
Elegí App Router por ser la recomendación actual de Vercel y tener mejor integración con React Server Components.

### Supabase en vez de PostgreSQL raw
Supabase proporciona Auth, Row Level Security, y APIs auto-generadas que aceleran el desarrollo. Además tiene excelente integración con Next.js.

### n8n para automatizaciones
En vez de escribir webhooks custom, n8n permite crear flujos visuales de automatización que son más fáciles de mantener y debuguear.

### Twilio para WhatsApp
Twilio es el proveedor oficial de WhatsApp Business API con mejor documentación y soporte en español.

### Claude Sonnet 4
Elegí Sonnet (no Haiku) porque necesita capacidad de razonamiento para manejar conversaciones complejas de agenda con contexto.
