# Correcciones — Calendaria

> **Protocolo:** cuando Diego escribe `corrección: [descripción]`, Claude evalúa tipo (UI / lógica / datos / perf), estima impacto, corrige y registra una fila aquí.
> **Formato mínimo:** una fila por corrección. Sin narrativa. Solo la delta.
> **No duplicar** info que ya está en `tasks.md` o `context.md`.

---

## Tabla de correcciones

| # | Fecha | Hora AR | Tipo | Descripción | Archivos afectados | Estado |
|---|-------|---------|------|-------------|-------------------|--------|
| 1 | 2026-05-02 | — | Lógica | API routes usaban `PROFESIONAL_ID` hardcodeado en lugar de `getProfesionalId()` — rompía auth real | `api/data/agenda/route.ts` · `api/data/pacientes/route.ts` | ✅ |
| 2 | 2026-05-02 | — | UI | Turnos se pisaban visualmente sin validación de solapamiento en el POST | `api/data/agenda/route.ts` | ✅ |
| 3 | 2026-05-02 | — | UX | No había forma de eliminar un paciente desde el panel | `pacientes/page.tsx` · `api/data/pacientes/route.ts` | ✅ |
| 4 | 2026-05-02 | — | UX | Crear turno requería abrir modal manualmente — no había click directo en el calendario | `agenda/page.tsx` | ✅ |
| 5 | 2026-05-03 | — | UX | Registro de nuevo profesional congelado en "Creando cuenta..." — router.push+refresh se cancelaban mutuamente | `auth/page.tsx` | ✅ |
| 6 | 2026-05-03 | — | UI | Sidebar y layout del panel aparecían en /auth y /onboarding — solo '/' estaba en PUBLIC_ROUTES | `conditional-layout.tsx` | ✅ |
| 7 | 2026-05-03 | — | Lógica | Post-registro sin sesión: Supabase email confirm activo devuelve user sin session — faltaba signInWithPassword explícito | `auth/page.tsx` | ✅ |
| 8 | 2026-05-03 | — | Lógica | onboarding/page.tsx usaba useState(() =>{}) para fetch userId — nunca se ejecutaba como side effect | `onboarding/page.tsx` | ✅ |
| 9 | 2026-05-03 | — | Seguridad | api/data/agente, api/data/conversaciones y dashboard/page.tsx usaban PROFESIONAL_ID hardcodeado — datos del demo visibles para cualquier usuario | múltiples routes | ✅ |
| 10 | 2026-05-03 | — | Datos | fetchActividad en dashboard no filtraba por profesional — mostraba mensajes de todos los profesionales | `dashboard/page.tsx` | ✅ |
| 11 | 2026-05-03 | — | UI | Sidebar mostraba "Dr. Diego" hardcodeado en lugar del nombre real del usuario logueado | `dashboard-layout.tsx` | ✅ |
| 12 | 2026-05-03 | — | UI | Badge "3" hardcodeado en Conversaciones en sidebar — mostraba información falsa | `dashboard-layout.tsx` | ✅ |
| 13 | 2026-05-03 | — | Lógica | handleLogout usaba router.push+refresh — mismo bug que registro, podía dejar sesión colgada | `dashboard-layout.tsx` | ✅ |
| 14 | 2026-05-03 | — | Seguridad | middleware: /auth en PUBLIC_PATHS hacía que usuarios logueados nunca fueran redirigidos a /dashboard | `middleware.ts` | ✅ |
| 15 | 2026-05-03 | — | Seguridad | PATCH /api/data/agenda no verificaba ownership del turno — cualquier profesional podía cambiar estado de turnos ajenos | `api/data/agenda/route.ts` | ✅ |
| 16 | 2026-05-03 | — | Seguridad | GET /api/data/pacientes?id= y DELETE no filtraban por profesional_id — cross-tenant data leak posible | `api/data/pacientes/route.ts` | ✅ |
| 17 | 2026-05-03 | — | Seguridad | GET /api/data/conversaciones?id= devolvía mensajes sin verificar ownership — cualquier id de conversación era accesible | `api/data/conversaciones/route.ts` | ✅ |
| 18 | 2026-05-03 | — | Datos | /api/webhooks/n8n usaba columna `nombre_profesional` que no existe — la columna real es `nombre` | `api/webhooks/n8n/route.ts` | ✅ |
| 19 | 2026-05-03 | — | Lógica | api/webhooks/n8n y cron/recordatorios enviaban Twilio From sin prefijo `whatsapp:` — mensajes fallaban silenciosamente | `api/webhooks/n8n/route.ts` · `api/cron/recordatorios/route.ts` | ✅ |
| 20 | 2026-05-03 | — | Lógica | onboarding Step3 usaba router.push('/dashboard') — mismo bug post-auth que en login/registro | `onboarding/page.tsx` | ✅ |
| 21 | 2026-05-03 | — | UX | /agenda scrolleaba siempre a top=0 al montar — ahora scrollea al horario actual | `agenda/page.tsx` | ✅ |
| 22 | 2026-05-03 | — | Datos | agent-tools.ts marcaba conversaciones con estado 'completada' pero el schema y el filtro UI usan 'archivada' — nunca aparecían en el tab "Archivadas" | `lib/agent-tools.ts` | ✅ |
| 23 | 2026-05-03 | — | Lógica | Twilio webhook fallback usaba `NEXT_PUBLIC_PROFESIONAL_ID` que fue eliminado de Vercel — en producción el fallback retornaba `undefined` y el mensaje respondía error | `api/webhooks/twilio/route.ts` | ✅ |
| 24 | 2026-05-03 | — | UX | onboarding Step1 handleNext sin try/catch — errores de red dejaban el botón en "Guardando…" sin mensaje visible | `onboarding/page.tsx` | ✅ |
| 25 | 2026-05-03 | — | UX | eliminarPaciente hacía optimistic remove sin verificar si DELETE fue exitoso — paciente desaparecía de la UI aunque fallara el servidor | `pacientes/page.tsx` | ✅ |
| 26 | 2026-05-03 | — | UI | Botón "Tomar control" en conversaciones sin handler — falsa promesa de funcionalidad — deshabilitado con tooltip "Próximamente" | `conversaciones/page.tsx` | ✅ |

---

## Tipos de corrección

| Tipo | Definición |
|------|-----------|
| **UI** | Visual, layout, estilo, renderizado incorrecto |
| **UX** | Flujo de usuario, falta funcionalidad esperada |
| **Lógica** | Bug en business logic, cálculo o condición incorrecta |
| **Datos** | Query mal, datos incorrectos, race condition, duplicados |
| **Perf** | Lentitud, queries redundantes, re-renders innecesarios |
| **Seguridad** | Auth, RLS, validación de inputs, exposición de datos |

---

## Patrones de error recurrentes (no repetir)

- **PROFESIONAL_ID vs getProfesionalId():** siempre usar `getProfesionalId()` en API routes — el ID fijo no funciona con auth real
- **Solapamiento de turnos:** siempre validar en el POST antes de insertar, no solo en el cliente
- **Timezone AR:** los turnos se guardan en UTC, mostrar siempre con offset -3. Nunca confiar en `new Date()` local del servidor para comparaciones de agenda
- **Twilio FROM:** siempre incluir prefijo `whatsapp:` en el número From
- **router.push + router.refresh en App Router:** se cancelan mutuamente en Next.js App Router — usar `window.location.href` para navegaciones post-auth (login, registro, logout)
- **PUBLIC_PATHS en middleware:** agregar rutas de auth explícitamente como AUTH_PATHS separadas de rutas siempre públicas — el check "logueado → redirect" no corre si la ruta es PUBLIC
- **Multi-tenant ownership en PATCH/DELETE:** siempre agregar `.eq('profesional_id', profesionalId)` en UPDATE y DELETE — sin eso cualquier profesional logueado puede mutar datos ajenos
- **Nombre de columna en JOIN:** verificar los nombres reales de columna antes de hacer `.select('tabla(columna)')` — `nombre_profesional` vs `nombre` causa error silencioso en runtime
- **Twilio prefijo whatsapp::** normalizar siempre con `rawFrom.startsWith('whatsapp:') ? rawFrom : \`whatsapp:${rawFrom}\`` — no asumir que la variable de entorno lo incluye
- **Estado de conversación en agent-tools:** siempre usar `'archivada'` al cerrar conversación — el schema SQL define `activa | archivada`, no `completada`
- **Fallback env var en webhook:** usar `?? ''` para variables de entorno opcionales removidas de prod — el caller ya valida `if (!profesionalId)` y devuelve error amigable
