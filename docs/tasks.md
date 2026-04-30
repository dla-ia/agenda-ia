# Tareas del Proyecto

> Archivo central de progreso. Claude Code puede tildar los checkboxes.
> Guardá aquí el estado al cerrar una sesión.

---

## 🔴 En curso (sesión actual)
- [ ] Verificar end-to-end: enviar WhatsApp → Claude consulta Supabase → responde con horarios reales

## 🟡 Próximas
- [ ] Paso 5: Integración Google Calendar — leer y escribir turnos reales con el token guardado
- [ ] Paso 6: Panel web con datos reales — conectar Dashboard, Turnos, Conversaciones, Pacientes a Supabase
- [ ] Agregar URI de producción en Google Cloud OAuth (agenda-ia-gray.vercel.app/api/auth/google/callback)

## 🟢 Completadas
- [x] Estructura inicial del proyecto creada
- [x] CLAUDE.md con datos del proyecto
- [x] Schema de Supabase completo (8 tablas, RLS, función get_disponibilidad)
- [x] Interfaz gráfica completa (Dashboard, Turnos, Conversaciones, Pacientes, Configuración)
- [x] Deploy automático en Vercel conectado a GitHub
- [x] Supabase cloud configurado — tablas creadas, profesional insertado (ID: 02bccd60-4947-49fc-877d-f109665920f2)
- [x] Google Calendar OAuth implementado y probado end-to-end (token guardado en Supabase)
- [x] Webhook de Twilio implementado (/api/webhooks/twilio → Claude → Supabase → TwiML)
- [x] API key de Anthropic configurada (modelo: claude-sonnet-4-6)
- [x] Twilio sandbox conectado al teléfono (+5491159530792)
- [x] Webhook URL configurada en Twilio sandbox settings
- [x] Todas las variables de entorno en Vercel (13 variables)
- [x] Deploy a producción: https://agenda-ia-gray.vercel.app
- [x] vercel.json creado para forzar framework Next.js
- [x] Paso 4: Agente Claude con tool use — get_disponibilidad, crear_turno, ver_turnos_paciente, cancelar_turno (src/lib/agent-tools.ts + claude-agent.ts actualizado)
