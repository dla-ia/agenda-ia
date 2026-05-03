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
