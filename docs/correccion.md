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
| 27 | 2026-05-03 | — | UI | Tab "Integraciones": WhatsApp mostraba badge "conectado" (verde) siendo sandbox — corregido a "pendiente" (amarillo) con descripción honesta | `agente/page.tsx` | ✅ |
| 28 | 2026-05-03 | — | UX | Tab "Precios": tarifas hardcodeadas 18.000/15.000/22.000 no editables y no persistían — reemplazadas por filas editables con persistencia en `configuraciones.agente_tarifas` | `agente/page.tsx` | ✅ |
| 29 | 2026-05-03 | — | Lógica | Slug en /configuracion no se normalizaba — mayúsculas, espacios y caracteres especiales podían generar slugs inválidos para URL | `api/data/configuracion/route.ts` · `configuracion/page.tsx` | ✅ |
| 30 | 2026-05-03 | — | Seguridad | Twilio webhook aceptaba requests sin campos `From`/`To`/`Body` — ahora retorna 400 en lugar de procesar | `api/webhooks/twilio/route.ts` | ✅ |
| 31 | 2026-05-03 | — | UI | Modales de agenda con width fijo (360px/400px) desbordaban pantalla en mobile — cambiado a `min(Xpx, calc(100vw - 32px))` | `agenda/page.tsx` | ✅ |
| 32 | 2026-05-03 | — | UI | `/conversaciones`: lista lateral de 300px fixed no era usable en mobile — ahora oculta al seleccionar conversación, con botón volver | `conversaciones/page.tsx` | ✅ |
| 33 | 2026-05-03 | — | UI | `/agenda` + `/conversaciones`: `height: 100vh` causaba scroll-over en mobile con barra del navegador visible — corregido a `100svh` | `agenda/page.tsx` · `conversaciones/page.tsx` | ✅ |
| 34 | 2026-05-03 | — | UX | CTAs de landing (`/`) apuntaban a `/dashboard` en lugar de `/auth` — usuarios no autenticados recibían redirect del middleware | `app/page.tsx` | ✅ |
| 35 | 2026-05-03 | — | UX | `/w/[slug]`: redireccionaba directo a `wa.me` sin contexto — reemplazado por página intermedia con nombre del profesional, spinner y redirect automático a los 2s | `app/w/[slug]/route.ts` | ✅ |
| 36 | 2026-05-03 | — | UX | `/w/[slug]` con slug inválido redirigía a `/` sin mensaje — ahora devuelve 404 amigable en HTML | `app/w/[slug]/route.ts` | ✅ |
| 37 | 2026-05-03 | — | Seguridad | RLS solo tenía políticas SELECT — INSERT/UPDATE/DELETE sin restricción de `profesional_id` en todas las tablas | `supabase/migrations/20260503_rls_write_policies.sql` | ✅ |
| 38 | 2026-05-03 | — | Lógica | System prompt Aurora no cargaba nombre real del profesional ni horario — el agente no podía mencionar su nombre ni detectar mensajes fuera de horario | `lib/claude-agent.ts` | ✅ |
| 39 | 2026-05-03 | — | UX | Modal "+ Paciente" sin campo email — Resend no podía enviar confirmaciones aunque la key estuviera configurada | `pacientes/page.tsx` · `api/data/pacientes/route.ts` | ✅ |
| 40 | 2026-05-03 | — | UX | Modal "+ Turno" en /agenda no mostraba los turnos existentes del día — profesional podía crear turnos sin ver el contexto del día | `agenda/page.tsx` | ✅ |
| 41 | 2026-05-14 | — | Seguridad | **CRÍTICO** — PATCH `/api/auth/profesional` sin auth + `...spread` del body: cualquiera podía sobreescribir `slug`/`twilio_*`/`mercado_pago_access_token`/`google_calendar_token` de cualquier profesional. Ahora usa `getProfesionalId()` (session) + whitelist de columnas | `api/auth/profesional/route.ts` | ✅ |
| 42 | 2026-05-14 | — | Seguridad | POST `/api/auth/profesional` sin auth — confirmaba email de UUID arbitrario (`updateUserById`) e insertaba fila con PK del cliente. Ahora valida que `id === sessionId` | `api/auth/profesional/route.ts` | ✅ |
| 43 | 2026-05-14 | — | Seguridad | Webhook Twilio no validaba `X-Twilio-Signature` — requests falsos generaban gasto en Claude API, escrituras en DB y WhatsApp salientes. Agregado `validateRequest` (falla cerrado, 403) | `api/webhooks/twilio/route.ts` | ✅ |
| 44 | 2026-05-14 | — | Seguridad | Webhooks `n8n` y `cron/recordatorios` fail-open: `if (SECRET && ...)` salteaba el chequeo si la env var no estaba seteada. Ahora falla cerrado + comparación `timingSafeEqual` | `api/webhooks/n8n/route.ts` · `api/cron/recordatorios/route.ts` | ✅ |
| 45 | 2026-05-14 | — | Seguridad | Email de confirmación (Resend) interpolaba `paciente.nombre` y `prof.nombre` crudos en el HTML — HTML injection. Agregado helper `escapeHtml` | `api/data/agenda/route.ts` | ✅ |
| 46 | 2026-05-14 | — | Lógica | POST `/api/data/agenda` no validaba `fecha_hora` — una fecha inválida daba `NaN` y salteaba el chequeo de solapamiento (recién fallaba en el INSERT). Ahora valida y devuelve 400 | `api/data/agenda/route.ts` | ✅ |

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
- **GRANT explícito en tablas nuevas:** desde el 30/10/2026 Supabase no expone tablas nuevas de `public` a la Data API sin `GRANT` — al crear una tabla copiar `supabase/migrations/_TEMPLATE_nueva_tabla.sql` (CREATE + GRANT por rol + RLS + políticas). Sin el GRANT, `supabase.from('tabla')` falla con error de permisos aunque la tabla exista. Las 8 tablas actuales conservan sus grants, no están afectadas
- **Nunca `...spread` del body en un UPDATE:** mass-assignment — el cliente puede setear cualquier columna (`slug`, tokens, credenciales). Siempre whitelist explícita campo por campo, como en `api/data/configuracion/route.ts`
- **API routes que mutan datos NO son públicas por defecto:** toda route bajo `/api/` es accesible sin auth salvo que se valide sesión. Las que tocan `profesionales`/datos sensibles deben llamar `getProfesionalId()` y usar ese id, nunca el `id` del body
- **Webhooks fail-closed:** validar firma/secret SIEMPRE. El patrón `if (SECRET && header !== SECRET)` deja el webhook abierto si la env var falta — usar `if (!SECRET || !safeEqual(...))`. Comparar secrets con `crypto.timingSafeEqual`, no `!==`
- **Twilio webhook:** validar `X-Twilio-Signature` con `validateRequest` de la lib `twilio`. La URL a verificar se reconstruye de `x-forwarded-proto` + `host` + pathname (detrás de Vercel `request.url` puede traer host interno)
