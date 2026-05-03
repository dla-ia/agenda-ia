# Calendaria — Brand Handoff

Bundle listo para Claude Code. Copiá esta carpeta entera a tu repo (sugerencia: `apps/web/brand/` o `public/brand/`).

## Qué es Calendaria
La agenda que atiende por vos. Un agente de WhatsApp que reserva turnos, cobra señas y manda recordatorios — pensado para **todo trabajador independiente que recibe gente**: psicólogos, kinesiólogos, odontólogos, peluqueros, manicuras, mecánicos de bici, tatuadores, entrenadores, fotógrafos.

**Manifiesto**: "Tu trabajo es atender. El nuestro, agendar."

---

## Archivos

```
brand_assets/
  isotipo.svg            ← terracota, primario
  isotipo-blanco.svg     ← para fondos oscuros
  isotipo-tinta.svg      ← monocromo, sobre claros
  app-icon.svg           ← 1024×1024, fondo terracota + isotipo hueso
  favicon.svg            ← 64×64, mismo lockup
  lockup.svg             ← horizontal: isotipo + wordmark, tinta sobre claro
  lockup-blanco.svg      ← horizontal: isotipo + wordmark, hueso sobre oscuro
Calendaria - Marca.html  ← guidelines completas (abrir en browser)
```

---

## Tokens de marca

### Colores

```css
/* Neutros (papel + tinta) */
--bg:      #F6F1EA;   /* hueso — el aire, 60-70% de la composición */
--bg-2:    #EFE6DA;   /* arena */
--bg-3:    #E5D7C5;   /* arcilla */
--surface: #FBF7F1;   /* tarjeta */
--ink:     #2C241D;   /* tinta cálida — texto principal */
--ink-2:   #5A4E42;   /* secundaria */
--ink-3:   #8C7E6F;   /* terciaria, eyebrows */
--line:    #DDD1C0;
--line-2:  #C9BBA6;

/* Acentos */
--terracotta:   #C26A4A;   /* primario único — botones, marca, momentos clave */
--terracotta-2: #A95838;   /* hover/pressed */
--olive:        #6B7148;   /* confirmación, success */
--ochre:        #C99A3F;   /* atención, warning */
--rose:         #B86A6A;   /* error, cuidado */

/* Chat (WhatsApp-ish, no copia exacta) */
--chat-bg:  #ECE2D2;
--chat-in:  #FFFFFF;
--chat-out: #DCE9C8;
```

### Tailwind config (`tailwind.config.ts`)

```ts
export default {
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#F6F1EA', 2: '#EFE6DA', 3: '#E5D7C5' },
        surface: { DEFAULT: '#FBF7F1', 2: '#FFFFFF' },
        ink: { DEFAULT: '#2C241D', 2: '#5A4E42', 3: '#8C7E6F' },
        line: { DEFAULT: '#DDD1C0', 2: '#C9BBA6' },
        terracotta: { DEFAULT: '#C26A4A', 2: '#A95838' },
        olive: '#6B7148',
        ochre: '#C99A3F',
        rose: '#B86A6A',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { sm: '8px', DEFAULT: '14px', lg: '22px' },
      boxShadow: {
        sm: '0 1px 2px rgba(58, 41, 26, 0.06)',
        DEFAULT: '0 2px 8px rgba(58, 41, 26, 0.08), 0 1px 2px rgba(58, 41, 26, 0.04)',
        lg: '0 12px 32px rgba(58, 41, 26, 0.12), 0 2px 6px rgba(58, 41, 26, 0.05)',
      },
    },
  },
};
```

### Fuentes

Cargar desde Google Fonts (en `app/layout.tsx`):

```tsx
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", weight: ["400","500","600","700"], style: ["normal","italic"] });
const inter    = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["300","400","500","600","700"] });
const mono     = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500"] });
```

Aplicar al `<html>` con las 3 variables: `<html className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>`.

---

## Logo en React (drop-in)

```tsx
// components/brand/Isotype.tsx
export const Isotype = ({ size = 64, color = "#C26A4A", className }: { size?: number; color?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="Calendaria">
    <path d="M50 22 C50 14, 42 8, 32 8 C18 8, 8 18, 8 32 C8 46, 18 56, 32 56 C42 56, 50 50, 53 42"
          stroke={color} strokeWidth="5.5" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="22" r="4.2" fill={color} />
  </svg>
);

// components/brand/Wordmark.tsx
export const Wordmark = ({ size = 56, color = "#2C241D" }: { size?: number; color?: string }) => (
  <span style={{
    fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: size,
    letterSpacing: "-0.035em", color, lineHeight: 1,
    fontVariationSettings: '"opsz" 144',
  }}>calendaria</span>
);

// components/brand/Lockup.tsx
import { Isotype } from "./Isotype";
import { Wordmark } from "./Wordmark";
export const Lockup = ({ size = 36, color = "#2C241D", markColor = "#C26A4A", gap = 12 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap }}>
    <Isotype size={size * 1.05} color={markColor} />
    <Wordmark size={size} color={color} />
  </div>
);
```

---

## Construcción del isotipo

- Caja **64×64**, radio del anillo **24**.
- Trazo **5.5**, terminales redondeadas.
- Punto Ø **8.4**, ubicado a 60° desde el eje vertical (esquina superior derecha).
- Espacio mínimo alrededor: igual a la altura del punto.
- Tamaño mínimo de uso: **24px** (isotipo solo) / **28px** (lockup).

---

## Tipografía — escala

| Uso | Familia | Tamaño / line-height / tracking |
|---|---|---|
| Display | Fraunces 500 | 64–88 / 1.0 / -0.03em |
| H1 | Fraunces 500 | 32 / 1.15 / -0.02em |
| H2 | Fraunces 500 | 24 / 1.2 / -0.015em |
| H3 | Fraunces 500 | 19 / 1.25 / -0.01em |
| Métrica | Fraunces 500 | 38 / 1.0 / -0.02em / `tabular-nums` |
| Body | Inter 400 | 14 / 1.5 |
| Body sm | Inter 400 | 13 / 1.45 |
| Eyebrow | Inter 500 | 11 / 1.0 / +0.08em / UPPERCASE |
| Mono | JetBrains 400/500 | 11–13 / 1.4 |

---

## Tono de voz

**Cálido** — como un buen recepcionista que ya te conoce. Saluda, confirma, no apura.
**Claro** — frases cortas, una idea por mensaje. Sin jerga, sin formalismos vacíos.
**Útil** — habla del turno, del precio, del lugar. Resuelve. No vende, no opina, no presiona.

### ✓ Decimos
- "Hola, ¿en qué te puedo ayudar?"
- "¿Te queda mejor el martes a la tarde o el jueves a la mañana?"
- "Listo, te lo agendé. Te llega un recordatorio el día anterior."
- "Si necesitás cambiarlo, escribime sin problema."

### ✗ No decimos
- "¡Hola! 🎉 ¿Listx para reservar?"
- "Selecciona un horario disponible del calendario adjunto."
- "Tu reserva ha sido procesada exitosamente."
- "Recordá que la cancellation policy es de 24hs."

**Idioma**: español rioplatense (vos, decime, agendate). Para mercados fuera de Argentina, usar variantes locales sin perder calidez.

**Customización**: el agente toma el nombre del negocio. No tiene un nombre fijo (no es "Aurora", no es "Carla") — se presenta como "la asistente de [Nombre del negocio]". El profesional puede ponerle nombre propio si lo desea, configurable.

---

## Reglas de uso del logo

- **Sí**: terracota sobre fondos claros, hueso sobre fondos oscuros, monocromo en tinta para casos sin color.
- **No**: deformar proporciones, rotar el isotipo, agregar sombras o brillos, usar gradientes saturados, ponerlo sobre fotos sin un fondo de protección.
- **Acento único**: la terracota es el único color "fuerte" de la paleta. Olive y rosa seco son para estados (success/error), no decorativos.

---

## Para Claude Code: cómo usar este bundle

1. Copiá `brand_assets/` a `public/brand/` en el proyecto Next.js.
2. Generá los componentes `Isotype`, `Wordmark`, `Lockup` con el código de arriba en `components/brand/`.
3. Aplicá los tokens de color al `tailwind.config.ts` y las fuentes a `app/layout.tsx`.
4. Configurá `app/icon.tsx` y `app/apple-icon.tsx` apuntando a `app-icon.svg`.
5. En la landing y la app del psicólogo/profesional, usar `<Lockup>` en el header (size 22-28) y `<Isotype>` solo donde el espacio lo pida (favicon, splash, loaders).
6. Mostrar el manifiesto "Tu trabajo es atender. El nuestro, agendar." en el hero de la landing — Fraunces 500, 56-72px.

Cualquier duda visual, abrí `Calendaria - Marca.html` en el browser para ver el sistema completo en acción.
