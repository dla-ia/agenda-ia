# Problemas y aprendizajes

> Cada error que cometimos una vez, no lo cometemos dos veces.

---

## Vercel / Deploy

- **Framework "Other" rompe el deploy.** Vercel busca carpeta `/public` si no detecta Next.js. Solución: crear `vercel.json` con `{ "framework": "nextjs" }` en la raíz del proyecto. Esto es SIEMPRE necesario cuando se linkea con CLI.
- **Deploy automático desde GitHub vs CLI.** El deploy desde GitHub puede tener configuración distinta al de CLI. Usar `npx vercel --prod --yes` desde la raíz del proyecto es más confiable.
- **Variables de entorno vacías en Vercel.** Si una variable está vacía en `.env.local`, igual se sube a Vercel y sobreescribe lo que había. Verificar que las variables tengan valor antes de subirlas.
- **Puerto ocupado (3000 → 3001).** Si el dev server arranca en 3001, es porque hay otro proceso node en 3000. Matar con PowerShell: `Stop-Process -Name "node" -Force`. El OAuth de Google está registrado en 3000 — si el servidor corre en otro puerto, el callback falla.

---

## Next.js / React

- **`useSearchParams()` requiere Suspense en Next.js 14.** Sin `<Suspense>` wrapper, la página no hidrata y los estilos de Tailwind no se aplican. Patrón correcto: extraer el componente con useSearchParams a una función interna y exportar el page wrapeado en Suspense.
- **`globals.css` con `@import` no genera estilos.** Usar directivas `@tailwind base/components/utilities`, nunca `@import "tailwindcss/..."`.
- **`taskkill` no funciona en bash de Windows.** Usar PowerShell tool con `Stop-Process -Name "node" -Force`.

---

## Claude API

- **Nombre de modelo incorrecto rompe el webhook silenciosamente.** `claude-sonnet-4-2025-06-05` no existe. El modelo correcto actual es `claude-sonnet-4-6`. Siempre verificar los IDs de modelo en el system prompt de Claude Code. Modelos actuales:
  - Opus: `claude-opus-4-7`
  - Sonnet: `claude-sonnet-4-6`
  - Haiku: `claude-haiku-4-5-20251001`

---

## Google Cloud / OAuth

- **App en modo "Testing" bloquea usuarios.** Aunque seas el dueño, si tu email no está en la lista de usuarios de prueba, Google muestra "Acceso bloqueado". Agregar el email en: APIs → Pantalla de consentimiento → Público → Usuarios de prueba.
- **El redirect URI debe coincidir exactamente.** Puerto, protocolo, path. Para producción agregar `https://agenda-ia-gray.vercel.app/api/auth/google/callback` en Google Cloud Console.
- **Nunca subir `client_secret_*.json` a GitHub.** Ya está en `.gitignore` como `client_secret_*.json`.

---

## Supabase

- **CLI necesita `project_id` en `config.toml`.** Agregar `project_id = "aikwrtxmkdthnsnrnjng"` antes de usar comandos CLI.
- **`realtime.port` no existe en versiones nuevas de la CLI.** Eliminarlo. `ip_version` va en mayúsculas: `"IPv4"`.
- **Pooler (puerto 6543) da "Tenant or user not found".** Para migraciones y scripts, usar conexión directa: `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` con `ssl: { rejectUnauthorized: false }`.
- **`service_role` key bypasea RLS.** Usarla solo en el servidor. Nunca en código cliente ni en variables `NEXT_PUBLIC_`.
- **Instalar `pg` como devDependency** para correr SQL desde scripts node sin Docker.

---

## Twilio / WhatsApp

- **El sandbox no envía mensajes internacionales de forma confiable.** Advertencia de Twilio. Para Argentina, puede fallar. Para producción real usar sender propio verificado.
- **El webhook necesita URL pública.** Para dev local necesitás ngrok. Para producción usar URL de Vercel directamente — es más simple y estable.
- **Formato del número en Twilio:** siempre con prefijo `whatsapp:+NÚMERO`. El sandbox es `whatsapp:+14155238886`.
