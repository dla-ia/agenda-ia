# Handoff: AgendaIA — Agente de WhatsApp para psicólogos

## Overview
AgendaIA es un agente conversacional de IA que gestiona la agenda de un psicólogo independiente vía WhatsApp: responde consultas, reserva turnos sincronizados con Google Calendar, cobra señas por MercadoPago y envía recordatorios automáticos. Este handoff cubre la **app web del psicólogo** (panel de control donde supervisa al agente, edita reglas, ve agenda y pacientes) y los **mockups de la experiencia del paciente** (chat de WhatsApp + flujo de pago).

## Sobre los archivos de diseño
Los archivos en este bundle son **referencias de diseño hechas en HTML/React inline** — prototipos que muestran cómo se debe ver y comportar el producto, no código de producción para copiar tal cual. La tarea es **recrear estos diseños en el entorno del proyecto existente**:

- **Stack del proyecto**: Next.js 14 + Tailwind CSS + Vercel · Supabase · Claude API · n8n · Twilio (WhatsApp Business) · Google Calendar API · MercadoPago · Resend.
- Implementar los componentes en Next.js + Tailwind, mapeando los tokens de diseño a `tailwind.config.js` y/o variables CSS.
- Conectar a Supabase para datos reales (pacientes, turnos, conversaciones, configuración del agente).
- El estado del agente (su pensamiento, acciones, etc.) viene del backend; la UI solo lo refleja.

## Fidelidad
**Alta fidelidad (hi-fi)**. Colores, tipografía, espaciado e interacciones son finales y deben replicarse pixel-perfect adaptados al stack.

---

## Pantallas / Vistas

### 1. Dashboard "Resumen" (`/dashboard`)
**Propósito**: vista de aterrizaje del psicólogo. Ver de un vistazo qué hizo el agente, próximos turnos y casos que requieren su atención.

**Layout**: sidebar fija de 240px + contenido principal. Top bar con saludo personalizado y botones (buscar, notificaciones, "Nuevo turno"). Body con grid:
- Fila superior: 4 tarjetas de métricas (turnos esta semana, señas cobradas, tasa de no-show, tiempo ahorrado).
- Fila inferior: grid 1.4fr/1fr — feed de actividad del agente a la izquierda; agenda de hoy + sugerencia del agente a la derecha.

**Componentes clave**:
- `MetricCard`: eyebrow uppercase + número grande en serif (38px Fraunces 500) + delta con flecha + sub-texto.
- `ActivityRow`: ícono coloreado en cuadrado redondeado de 30×30 + nombre paciente + tiempo + descripción + (opcional) "ai-thinking" pill con confianza %, y botón "Responder" si el caso requiere revisión.
- Filtro segmentado "Todo / Revisar / Automático" con badge contador.
- Tarjeta "Sugerencia del agente" con fondo gradient `linear-gradient(180deg, var(--surface) 0%, var(--bg-2) 100%)`.

**Variante (Dashboard hero)**: misma navegación pero la fila superior se reemplaza por una tarjeta hero con gradient `linear-gradient(135deg, #EFE6DA 0%, #E5D7C5 100%)`, mostrando el número 23 enorme en serif (64px) + 3 mini-métricas a la derecha.

---

### 2. Conversaciones (`/conversaciones`)
**Propósito**: el psicólogo monitorea lo que el agente está haciendo en WhatsApp y aprueba casos sensibles.

**Layout**: 320px lista | flex-1 chat | 300px panel de contexto.

**Lista**: cada item con avatar + nombre + timestamp + último mensaje. Item seleccionado tiene `border-left: 3px solid var(--terracotta)` y fondo `--surface`. Items con `status: "review"` muestran un dot terracotta.

**Chat**: header beige `#F0EAE0` con avatar + nombre + estado ("agente esperando tu decisión" / "atendiendo automáticamente"). Botón "Tomar control" a la derecha. Burbujas con estilo WhatsApp (entrante blanco `--chat-in`, saliente verde oliva muy claro `--chat-out: #DCE9C8`). Los burbujas links van con fondo `#F5F0DC` y JetBrains Mono 13px.

**Panel de contexto**: avatar grande centrado, info de paciente, "Resumen del caso" (texto), "Razonamiento del agente" (4 barras: Intención, Sentimiento, Urgencia, Riesgo — cada una con label, valor, % y barra horizontal terracotta), "Acciones disponibles" (botones).

**Footer del chat (cuando es revisión)**: barra `--bg-2` con icono sparkles + sugerencia del agente + botones "Rechazar" y "Aprobar y responder".

---

### 3. Agenda (`/agenda`)
**Propósito**: ver agenda semanal sincronizada con Google Calendar.

**Layout**: tabla `60px + repeat(5, 1fr)` para una semana laboral. Header row con día (eyebrow) + número en serif 22px (terracotta si es hoy). Filas de hora (09:00 → 19:00) con `min-height: 56px`. Columna de hora en JetBrains Mono 11px.

**Estados de turno** (color de fondo + borde):
- `confirmed` — `#E8EFDC` / `#CDD9B5`
- `pending` — `#F5E9CD` / `#E5D2A0`
- `paid` — `#EFE0D2` / `#D6C2B0` (para primera consulta con seña pagada)
- bloqueado (almuerzo) — `--bg-3`

**Modal de detalle de turno**: 380px, overlay 35% negro, con avatar + datos (Fecha, Hora, Modalidad, Pago) + 3 botones (Reagendar, Ver chat, Confirmar primario).

**Top bar**: prev/today/next + "Conectado · Google Calendar" + "Bloquear horario" primario.

**Leyenda**: 4 swatches abajo del calendario.

---

### 4. Pacientes (`/pacientes`)
**Layout**: 320px lista | flex-1 detalle.

**Lista**: items 12px-18px padding, avatar + nombre + timestamp + último evento del agente. Status dots: terracotta (revisar), oliva (primera).

**Detalle**: header con avatar lg + nombre h2 + meta (mono phone + paciente desde X + N sesiones) + 2 botones (WhatsApp, Reservar). Grid de 4 mini-stats. Grid 1fr/1fr con:
- "Conversación reciente" — tarjeta con header + chat-area + footer de acciones (Rechazar / Aprobar 30% off con botón oliva `#5A6034`).
- "Historial" — lista de eventos con fecha mono + ícono + texto.

Tarjeta inferior "Notas privadas" — caja `--bg-2` con texto serif italic.

---

### 5. Agente IA (`/agente`)
**Layout**: top bar + tabs horizontales + contenido scroll.

**Tabs**: Personalidad · Reglas de agenda · Precios y pagos · Integraciones · Cuándo derivarme.
Tab activo: `border-bottom: 2px solid var(--terracotta)`, color `--ink`.

**Personalidad**: grid 1.2fr/1fr.
- Izquierda: tarjeta con campos (nombre, tono — 3 cards radio, saludo, frase de cierre).
- Derecha: vista previa con burbujas reales del chat + tarjeta "Frases que evita" con tags removibles.

**Reglas de agenda**: grid 1fr/1fr. Izquierda: lista de días con horarios y botón Editar. Derecha: stack de `ToggleCard` con título + descripción + toggle terracotta (36×20px).

**Precios y pagos**: grid 1fr/1fr.
- Tarifas: rows con label + duración + precio serif 18px + menú.
- Cobro de seña: input monto + vencimiento + ToggleCard "Sin pago, sin reserva".

**Integraciones**: grid 2 cols, cada tarjeta con ícono 38px + nombre + badge "conectado" + descripción + botón Configurar.

**Cuándo derivarme**: grid 1.3fr/1fr.
- Izquierda: rows con ícono terracotta + label + descripción + badge "obligatorio" amber.
- Derecha: tarjeta gradient con escudo + protocolo de crisis (línea 135 CABA, 0800-345-1435).

---

### 6. Vista del paciente — WhatsApp en iPhone
3 variantes de tono (warm/direct/casual). Cada una es un `IOSDevice` (360×780) con un componente `<ChatMockup tone>` adentro. Animación: typing indicator (3 dots) entre mensajes del agente, mensajes entrantes con delay 800ms, salientes 1500ms.

**Tono cálido** (default): "Hola, qué lindo que te animes a dar este paso 🌱 Soy Aurora, asistente de la Lic. Lucía Fernández. ¿Cómo te llamás?"
**Tono directo**: "Hola. Soy Aurora, asistente de la Lic. Fernández. ¿Tu nombre y si es primera vez?"
**Tono casual**: "Hola! Soy Aurora 👋 Sí, hay lugar. ¿Cómo te llamás?"

El último mensaje siempre es un link de pago `🔗 mpago.la/sena-mariana` con fondo `#F5F0DC` y JetBrains Mono.

---

### 7. Pago de seña — pantalla MercadoPago (mockup)
`IOSDevice` (360×780). Header `#1F2C5C` con logo amarillo $. Tarjetas blancas:
- "Estás pagando" — descripción + total `$8.000` en serif.
- "Método de pago" — radios ($45.230 disponibles seleccionado).
- Botón `#009EE3` "Pagar $8.000".
- Estado de éxito: tarjeta verde `#E8F5E9` con check `#4CAF50`.

---

## Interacciones y comportamiento

- **Sidebar**: `nav-item` con hover `--bg-3` y estado active con `--surface-2` + box-shadow sutil.
- **Tabs en config del agente**: cambian de tab sin recargar, `border-bottom` indica active.
- **Modal de turno**: click en celda con turno → abre overlay; click fuera cierra.
- **Chat mockup**: autoplay con typing indicator entre mensajes; botón play/pause en input bar reinicia el script desde el principio.
- **Tone switcher (Tweak)**: cambiar el tono recarga el script de chat con copy distinto.
- **Toggles**: animación de 200ms ease en el dot que se mueve de left:2px a left:18px.
- **Razonamiento del agente**: tweakeable on/off — cuando off, las pills "ai-thinking" se ocultan completamente.
- **Caso para revisar (Sofía Pérez)**: el agente pausa la conversación y muestra footer con sugerencia + botones de aprobación.

---

## State management

- `view` en App shell — qué vista está activa (`dashboard | chats | agenda | pacientes | agente`).
- `tone` global (warm/direct/casual) — afecta el copy del agente en mockups y vistas previas.
- `showReasoning` global — toggle de visibilidad de pills de confianza.
- `selected` en Conversaciones, Pacientes, Agenda — qué item/turno está abierto.
- En backend: queue de acciones pendientes de aprobación, estado de cada conversación (auto/review/human-controlled), reglas configuradas, agenda sincronizada.

---

## Design tokens

### Colores
```css
--bg: #F6F1EA;            /* hueso cálido */
--bg-2: #EFE6DA;          /* arena */
--bg-3: #E5D7C5;          /* arcilla */
--surface: #FBF7F1;
--surface-2: #FFFFFF;
--ink: #2C241D;           /* tinta cálida */
--ink-2: #5A4E42;
--ink-3: #8C7E6F;
--line: #DDD1C0;
--line-2: #C9BBA6;

/* Acentos */
--terracotta: #C26A4A;    /* primario */
--terracotta-2: #A95838;
--olive: #6B7148;         /* secundario salud */
--ochre: #C99A3F;
--rose: #B86A6A;
--sage: #8AA176;          /* success */

/* Chat */
--chat-bg: #ECE2D2;
--chat-in: #FFFFFF;
--chat-out: #DCE9C8;
```

### Tipografía
- **Serif** (números, títulos): `Fraunces` (Google Fonts), pesos 400/500/600/700, `font-optical-sizing: auto`.
- **Sans** (UI): `Inter`, pesos 300/400/450/500/600/700.
- **Mono** (timestamps, teléfonos, código): `JetBrains Mono`, 400/500.

Escala:
- h1: serif 32px / 1.15 / -0.02em / 500
- h2: serif 24px / 1.2 / -0.015em / 500
- h3: serif 19px / 1.25 / -0.01em / 500
- metric-number: serif 38px / 1 / -0.02em / 500 / tabular-nums
- eyebrow: 11px / 0.08em uppercase / 500 / `--ink-3`
- body: 13–14px / 1.45–1.5

### Espaciado / radius / shadows
- Radii: `--radius: 14px` (cards), `--radius-sm: 8px`, `--radius-lg: 22px`, botones 10px, badges 999px.
- Shadows:
  - sm: `0 1px 2px rgba(58, 41, 26, 0.06)`
  - default: `0 2px 8px rgba(58, 41, 26, 0.08), 0 1px 2px rgba(58, 41, 26, 0.04)`
  - lg: `0 12px 32px rgba(58, 41, 26, 0.12), 0 2px 6px rgba(58, 41, 26, 0.05)`
- Sidebar 240px. Cards padding 16–22px. Top bar padding 22px 32px.

### Componentes utilitarios
- `.btn`, `.btn-primary` (terracotta), `.btn-ghost`, `.btn-sm`.
- `.badge`, `.badge-success`, `.badge-warn`, `.badge-error`, `.badge-info`, `.badge-ai`.
- `.avatar`, `.avatar-lg`, `.avatar-sm` (background tierra, texto serif).
- `.chat-bubble`, `.chat-in`, `.chat-out`, `.chat-meta`, `.chat-time`.
- `.ai-thinking` (mono 11px, fondo `--bg`, dashed border `--line-2`).
- `.tag`, `.input`, `.field`.

---

## Assets / iconografía
- **Iconos**: stroke-based, 1.6px stroke. Set inline SVG en `components/shared.jsx` (`Icon` component): home, chat, calendar, users, settings, sparkles, check, x, plus, chevron, bell, search, clock, money, phone, send, mic, paperclip, moreV, calCheck, google, wallet, book, inbox, flag, shield, refresh, eye, pause, play. Recomendamos usar **Lucide Icons** en producción (mismo lenguaje visual).
- **Logo**: cuadrado redondeado 6px con gradient `linear-gradient(135deg, #C26A4A 0%, #A95838 100%)` + glifo de reloj/círculo en blanco hueso `#FFF8F0`. Wordmark "AgendaIA" en Fraunces 600 17px.
- **Avatares**: paleta tierra `["#D6BFA6", "#C4A586", "#B5A188", "#A8957A", "#C9B89A", "#D4B5A0"]`, iniciales en serif.

---

## Idioma y copy
**Español argentino — vos / MercadoPago / $**. El agente se llama **Aurora** por defecto (configurable). Tono cálido: usa metáforas suaves ("dar este paso 🌱"), valida emociones, evita diagnósticos. Frases prohibidas configurables: "diagnósticos", "pronósticos", "consejos médicos", "promesas de resultado".

**Protocolo de crisis** (obligatorio, no editable): si el agente detecta menciones de autolesión o crisis, comparte líneas de ayuda (135 CABA, 0800-345-1435) y notifica al psicólogo por SMS y email.

---

## Cómo ver los diseños
Para ver los diseños mientras implementás:
1. `cd design_handoff_agendaia && python3 -m http.server 8000` (o cualquier servidor estático).
2. Abrí `http://localhost:8000/AgendaIA.html` en el navegador.
3. El canvas te deja navegar entre vistas, hacer zoom, y abrir cualquier artboard en pantalla completa con el ícono ↗.

## Archivos en este bundle

- `AgendaIA.html` — entry point con DesignCanvas + Tweaks panel.
- `styles.css` — variables CSS, utilidades, tipografía.
- `components/shared.jsx` — Icon, Avatar, Logo, Sidebar, TopBar, Badge.
- `components/dashboard.jsx` — Dashboard variante "feed".
- `components/conversaciones.jsx` — inbox + chat + panel de razonamiento.
- `components/agenda.jsx` — calendario semanal + modal.
- `components/pacientes.jsx` — lista + ficha de paciente.
- `components/agente.jsx` — config del agente (5 tabs).
- `components/chat-mockup.jsx` — chat de WhatsApp animado (paciente).
- `components/payment.jsx` — pantalla MercadoPago.
- `design-canvas.jsx`, `ios-frame.jsx`, `tweaks-panel.jsx` — starters (no portar al producto, solo para visualizar el prototipo).

## Recomendaciones de implementación en Next.js

1. **Tailwind config**: mapear los tokens CSS a `theme.extend.colors` (`bg`, `surface`, `ink`, `terracotta`, etc.) y agregar las 3 fonts a `fontFamily` (`serif: ['Fraunces', ...]`, `sans: ['Inter', ...]`, `mono: ['JetBrains Mono', ...]`).
2. **Componentes UI**: crear `<Card>`, `<Button>`, `<Badge>`, `<Avatar>`, `<Toggle>`, `<Tabs>` reutilizables. Usar Radix UI o Headless UI para accesibilidad.
3. **Layout**: `app/(dashboard)/layout.tsx` con sidebar + top bar; cada vista en su propio `page.tsx`.
4. **Chat de WhatsApp**: componente puro (no usar lib de chat); las burbujas son `<div>` con clases Tailwind.
5. **Estado del agente**: server components leyendo de Supabase; mutations vía server actions o tRPC. Las acciones pendientes (descuentos, etc.) van a una tabla `agent_actions` con `status: pending | approved | rejected`.
6. **Animaciones**: usar `framer-motion` para typing indicator y entrada de mensajes.
7. **Realtime**: Supabase Realtime para que las nuevas conversaciones aparezcan sin refresh.
