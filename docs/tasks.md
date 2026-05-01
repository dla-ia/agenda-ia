# Tareas del Proyecto — Calendaria

> Archivo central de progreso. Claude Code puede tildar los checkboxes.
> Guardá aquí el estado al cerrar una sesión.

---

## 🔴 En curso (sesión actual)
- [ ] Deploy a producción con todos los cambios de esta sesión

## ✅ Completado en esta sesión
- [x] Pivot de scope: AgendaIA (mono-profesional) → Calendaria (SaaS multi-profesional)
- [x] Implementar design tokens en tailwind.config.js y globals.css
- [x] Rediseñar layout con sidebar Calendaria (paleta tierra + Fraunces)
- [x] Landing page pública (`/`): hero + profesiones + cómo funciona + features + precios + CTA + footer
- [x] Separar rutas: landing sin sidebar (`/`), panel con sidebar (`/dashboard`, `/conversaciones`, etc.)

---

## 🟡 Fase 1 — Fundación del SaaS (próximas)

### Landing page pública (`/`)
- [ ] Hero section: propuesta de valor, CTA "Creá tu agente"
- [ ] Sección "¿Cómo funciona?": 3 pasos animados
- [ ] Sección profesiones: psicólogo, odontólogo, mecánico, nutricionista, etc.
- [ ] Sección precios / planes
- [ ] Footer con links legales

### Panel del profesional (design handoff)
- [ ] Dashboard (`/dashboard`): MetricCards + ActivityFeed + AgendaHoy
- [ ] Conversaciones (`/conversaciones`): lista + chat + panel de razonamiento IA
- [ ] Agenda (`/agenda`): calendario semanal + modal de turno
- [ ] Pacientes (`/pacientes`): lista + ficha de paciente/cliente
- [ ] Agente IA (`/agente`): 5 tabs (personalidad, reglas, precios, integraciones, crisis)

### Auth y onboarding
- [ ] Login / registro (`/auth`)
- [ ] Wizard de setup inicial (`/onboarding`): conectar WhatsApp, Google Calendar, configurar agente

---

## 🟡 Fase 2 — Completar el agente existente
- [ ] Verificar e2e WhatsApp: mensaje → Claude consulta Supabase → responde con horarios → crea turno
- [ ] Paso 5: cuando `crear_turno` tiene éxito, crear evento en Google Calendar (token ya guardado)
- [ ] Agregar URI de producción en Google Cloud OAuth: `https://agenda-ia-gray.vercel.app/api/auth/google/callback`
- [ ] Panel web con datos reales: conectar Dashboard, Conversaciones, Pacientes, Agenda a Supabase

---

## 🟡 Fase 3 — Pagos y recordatorios
- [ ] MercadoPago: generar link de seña al crear turno
- [ ] Recordatorios automáticos (n8n): 24hs y 2hs antes del turno
- [ ] Resend: email de confirmación de turno con link de seña

---

## 🟢 Completadas (base sólida heredada)
- [x] Estructura inicial del proyecto creada (Next.js 14 + Tailwind + Supabase)
- [x] Schema de Supabase completo (8 tablas, RLS, función get_disponibilidad)
- [x] Deploy automático en Vercel conectado a GitHub
- [x] Supabase cloud configurado — profesional de prueba insertado (ID: 02bccd60-4947-49fc-877d-f109665920f2)
- [x] Google Calendar OAuth implementado y probado end-to-end (token guardado en Supabase)
- [x] Webhook de Twilio implementado (/api/webhooks/twilio → Claude → Supabase → TwiML)
- [x] API key de Anthropic configurada (claude-sonnet-4-6)
- [x] Twilio sandbox conectado (+5491159530792 → +14155238886)
- [x] 13 variables de entorno en Vercel
- [x] Deploy a producción: https://agenda-ia-gray.vercel.app
- [x] Agente Claude con tool use: get_disponibilidad, crear_turno, ver_turnos_paciente, cancelar_turno
- [x] Fix system prompt: flujo 2 pasos (sin confirmación intermedia que bloqueaba la reserva)
- [x] Pivot de nombre y scope: AgendaIA → Calendaria SaaS multi-profesional
- [x] CLAUDE.md, architecture.md, tasks.md, context.md actualizados con nueva visión
- [x] Design tokens (paleta tierra + Fraunces) en tailwind.config.js y globals.css
- [x] Sidebar rediseñada con identidad Calendaria
