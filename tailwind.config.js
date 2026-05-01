/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fondos tierra cálidos
        bg: {
          DEFAULT: '#F6F1EA',   // hueso cálido
          2: '#EFE6DA',         // arena
          3: '#E5D7C5',         // arcilla suave
        },
        surface: {
          DEFAULT: '#FBF7F1',   // tarjeta
          2: '#FFFFFF',
        },
        // Tinta
        ink: {
          DEFAULT: '#2C241D',   // tinta cálida
          2: '#5A4E42',         // secundaria
          3: '#8C7E6F',         // terciaria / muted
        },
        // Líneas
        line: {
          DEFAULT: '#DDD1C0',
          2: '#C9BBA6',
        },
        // Acentos
        terracotta: {
          DEFAULT: '#C26A4A',   // primario
          2: '#A95838',         // hover / pressed
        },
        olive: '#6B7148',       // secundario, salud
        ochre: '#C99A3F',       // warning suave
        rose: '#B86A6A',        // error suave
        sage: '#8AA176',        // success suave
        // Chat
        'chat-bg': '#ECE2D2',
        'chat-in': '#FFFFFF',
        'chat-out': '#DCE9C8',  // verde oliva claro
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'eyebrow': ['11px', { letterSpacing: '0.08em', fontWeight: '500' }],
        'metric': ['38px', { letterSpacing: '-0.02em', lineHeight: '1', fontWeight: '500' }],
        'metric-lg': ['64px', { letterSpacing: '-0.03em', lineHeight: '1', fontWeight: '500' }],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        lg: '22px',
        btn: '10px',
        badge: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(58, 41, 26, 0.06)',
        DEFAULT: '0 2px 8px rgba(58, 41, 26, 0.08), 0 1px 2px rgba(58, 41, 26, 0.04)',
        lg: '0 12px 32px rgba(58, 41, 26, 0.12), 0 2px 6px rgba(58, 41, 26, 0.05)',
      },
      spacing: {
        sidebar: '240px',
      },
    },
  },
  plugins: [],
}
