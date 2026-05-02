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
