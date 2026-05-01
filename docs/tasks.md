# Tareas del Proyecto — Calendaria

> Archivo central de progreso. Claude Code puede tildar los checkboxes.
> Guardá aquí el estado al cerrar una sesión.

---

## 🟡 Fase 1 — En progreso (próximas sesiones)

### Panel del profesional
- [ ] `/agenda`: botón "+ Turno" funcional (modal para crear turno manualmente)
- [ ] `/agenda`: acciones del modal (cancelar turno, marcar completado) conectadas a Supabase
- [ ] `/agente` tab "Reglas de agenda": editar horarios por día (actualmente muestra 09:00-19:00 fijo)

### Auth y onboarding
- [ ] Activar auth obligatorio en producción: eliminar `NEXT_PUBLIC_PROFESIONAL_ID` de Vercel cuando haya usuarios reales
- [ ] Probar flujo completo registro → onboarding → dashboard con cuenta nueva

### MCP servers (requieren reiniciar Claude Code)
- [ ] Activar Supabase MCP (`https://mcp.supabase.com/mcp`) — ya agregado, falta autenticar
- [ ] Activar Vercel MCP (`https://mcp.vercel.com`) — ya agregado, falta autenticar

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

## 🟢 Completadas — Sesión 02/05/2026
- [x] Configuración del agente persistida en Supabase (`/api/data/agente` GET+POST)
- [x] `/agente` page: estado centralizado, carga desde Supabase al montar, guarda con feedback visual
- [x] `claude-agent.ts`: system prompt dinámico — nombre, tono, saludo, cierre y frases prohibidas desde DB
- [x] `/agenda`: calendario semanal navegable con datos reales de Supabase
- [x] `/api/data/agenda`: GET turnos por rango de fechas, timezone Argentina UTC-3 correcto
- [x] MCP servers agregados al config: Supabase + Vercel (activar reiniciando Claude Code)
- [x] `@supabase/ssr` instalado para manejo de sesiones en Next.js App Router
- [x] `/auth`: página login/registro con split-screen (branding izquierda, formulario derecha)
- [x] `/onboarding`: wizard 3 pasos (perfil → agente → listo) con barra de progreso
- [x] `/api/auth/profesional`: POST crea registro en Supabase + auto-confirma email via Admin API
- [x] `middleware.ts`: protege rutas del panel (bypass activo mientras NEXT_PUBLIC_PROFESIONAL_ID esté seteado)
- [x] `getProfesionalId()`: helper session-aware — usa sesión real o fallback a env var
- [x] Sidebar: botón logout + email del usuario desde sesión
- [x] Email auto-confirmado al registrarse (sin config manual en Supabase dashboard)

## 🟢 Completadas — Sesiones anteriores
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
- [x] Design tokens (paleta tierra + Fraunces) en tailwind.config.js y globals.css
- [x] Sidebar rediseñada con identidad Calendaria
- [x] Landing page pública (`/`): hero + profesiones + cómo funciona + features + precios + CTA + footer
- [x] Dashboard (`/dashboard`): MetricCards + ActivityFeed + AgendaHoy con datos reales
- [x] Conversaciones (`/conversaciones`): lista + chat real desde Supabase
- [x] Pacientes (`/pacientes`): lista + ficha con historial de turnos
