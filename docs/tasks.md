# Tareas del Proyecto — Calendaria

> Archivo central de progreso. Claude Code puede tildar los checkboxes.
> Guardá aquí el estado al cerrar una sesión.

---

## 🟢 Completado en esta sesión (02/05/2026)
- [x] Configuración del agente persistida en Supabase (`/api/data/agente` GET+POST)
- [x] `/agente` page: estado centralizado, carga desde Supabase al montar, guarda con feedback
- [x] `claude-agent.ts`: system prompt dinámico — usa nombre, tono, saludo, cierre y frases prohibidas desde DB
- [x] MCP servers agregados: Supabase (`https://mcp.supabase.com/mcp`) + Vercel (`https://mcp.vercel.com`) — activar reiniciando Claude Code
- [x] `/agenda`: calendario semanal navegable con datos reales de Supabase
- [x] `/api/data/agenda`: GET turnos por rango de fechas, timezone Argentina UTC-3 correcto
- [x] Todas las pantallas del panel conectadas a datos reales

---

## 🟡 Fase 1 — Fundación del SaaS (próximas)

### Auth y onboarding
- [ ] Login / registro (`/auth`): email + contraseña con Supabase Auth
- [ ] Wizard de setup inicial (`/onboarding`): conectar WhatsApp, Google Calendar, configurar agente

### Mejoras panel
- [ ] `/agenda`: botón "+ Turno" funcional (modal para crear turno manualmente)
- [ ] `/agenda`: acciones del modal (cancelar turno, marcar completado) conectadas a Supabase
- [ ] `/agente` tab "Reglas de agenda": editar horarios por día (actualmente estáticos)

---

## 🟡 Fase 2 — Completar el agente existente
- [ ] Verificar e2e WhatsApp: mensaje → Claude consulta Supabase → responde con horarios → crea turno
- [ ] Paso 5: cuando `crear_turno` tiene éxito, crear evento en Google Calendar (token ya guardado)
- [ ] Agregar URI de producción en Google Cloud OAuth: `https://agenda-ia-gray.vercel.app/api/auth/google/callback`

---

## 🟡 Fase 3 — Pagos y recordatorios
- [ ] MercadoPago: generar link de seña al crear turno
- [ ] Recordatorios automáticos (n8n): 24hs y 2hs antes del turno
- [ ] Resend: email de confirmación de turno con link de seña

---

## 🟢 Completadas (base sólida)
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
- [x] Landing page pública (`/`): hero + profesiones + cómo funciona + features + precios + CTA + footer
- [x] Dashboard (`/dashboard`): MetricCards + ActivityFeed + AgendaHoy con datos reales
- [x] Conversaciones (`/conversaciones`): lista + chat real desde Supabase
- [x] Pacientes (`/pacientes`): lista + ficha con historial de turnos
- [x] Agente IA (`/agente`): 5 tabs con config persistida en Supabase
- [x] Agenda (`/agenda`): calendario semanal navegable con turnos reales
