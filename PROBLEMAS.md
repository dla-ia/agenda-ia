# Problemas y aprendizajes

> Cada error que cometimos una vez, no lo cometemos dos veces.

---

## Vercel / Deploy

- **Framework "Other" rompe el deploy.** Vercel busca carpeta `/public` si no detecta Next.js. Solución: crear `vercel.json` con `{ "framework": "nextjs" }` en la raíz del proyecto. Esto es SIEMPRE necesario cuando se linkea con CLI.

- **`npx vercel` sin versión puede instalar una versión rota.** `npx vercel` instaló v53.0.1 con dependencia inexistente (`@vercel/redwood@2.4.13`). Solución: pinear versión (`npx vercel@51.6.1`) o deployar vía GitHub push (más confiable).

- **Deploy via GitHub es más robusto que CLI cuando hay problemas de espacio o versión.** `git push origin main` y Vercel auto-deploya. Funciona aunque el disco esté lleno o npm esté roto.

- **Variables de entorno vacías en Vercel.** Si una variable está vacía en `.env.local`, igual se sube a Vercel y sobreescribe lo que había. Verificar que las variables tengan valor antes de subirlas.

- **Puerto ocupado (3000 → 3001).** Si el dev server arranca en 3001, hay otro proceso node en 3000. Matar con PowerShell: `Stop-Process -Name "node" -Force`. El OAuth de Google está registrado en 3000 — si el servidor corre en otro puerto, el callback falla.

---

## Disco / Sistema

- **Disco lleno (ENOSPC) bloquea npm/npx completamente.** Cuando el disco está al 100%, ni `npm cache clean` funciona — da ENOSPC. Solución: borrar el cache de npx con PowerShell (no necesita espacio):
  ```powershell
  Remove-Item -Recurse -Force "C:\Users\DIEGO\AppData\Local\npm-cache\_npx"
  Remove-Item -Recurse -Force "C:\Users\DIEGO\AppData\Local\npm-cache\_logs"
  Remove-Item -Recurse -Force "d:\Z-IA\AGENTES\TURNOS 1\.next"
  ```
  Después de liberar espacio, verificar con: `Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'" | Select FreeSpace`

---

## GitHub / Git

- **GitHub Push Protection bloquea secrets en CUALQUIER archivo de texto**, incluso documentación. El Account SID de Twilio en `docs/context.md` y `docs/recursos.md` bloqueó el push. Solución: **nunca escribir credenciales reales en archivos que van a git** — ni en docs, ni en comentarios, ni en markdown. Usar siempre "ver .env.local" como placeholder.

---

## Next.js / React

- **`useSearchParams()` requiere Suspense en Next.js 14.** Sin `<Suspense>` wrapper, la página no hidrata y los estilos de Tailwind no se aplican. Patrón correcto: extraer el componente con useSearchParams a una función interna y exportar el page wrapeado en Suspense.

- **`globals.css` con `@import` no genera estilos.** Usar directivas `@tailwind base/components/utilities`, nunca `@import "tailwindcss/..."`.

- **`taskkill` no funciona en bash de Windows.** Usar PowerShell tool con `Stop-Process -Name "node" -Force`.

---

## Claude API / Agente

- **Nombre de modelo incorrecto rompe el webhook silenciosamente.** `claude-sonnet-4-2025-06-05` no existe — el webhook devolvía "problema técnico" sin error visible. Siempre verificar IDs de modelo en el system prompt de Claude Code. Modelos actuales:
  - Opus: `claude-opus-4-7`
  - Sonnet: `claude-sonnet-4-6`
  - Haiku: `claude-haiku-4-5-20251001`

- **System prompt con demasiados pasos de confirmación bloquea el agente.** Si el flujo exige "¿Confirmás?" antes de llamar `crear_turno`, el agente queda atrapado esperando una confirmación que ya fue dada. El usuario dice "perfecto a las 9" (= confirmación implícita) y el agente sigue preguntando. Solución: diseñar flujos de ≤2 turnos. "Elegiste el horario" ES la confirmación — crear el turno directamente y confirmar después.

- **Los resultados de tool use NO persisten entre mensajes.** El historial de Supabase solo guarda texto. Cuando llega el siguiente mensaje, Claude no recuerda qué devolvió `get_disponibilidad` en el turno anterior. Implicación: Claude tiene que reconstruir el contexto (fecha, horario) desde el texto de la conversación. El system prompt debe instruir esto explícitamente.

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

- **Función `get_disponibilidad` del schema tiene bug con NULL.** Si no hay turnos en el día, `ARRAY_AGG` devuelve NULL y `v_fecha_hora != ALL(NULL)` no retorna ningún slot aunque el día esté libre. No usar esa función RPC — implementar la lógica directamente en TypeScript (ver `src/lib/agent-tools.ts`).

---

## Twilio / WhatsApp

- **El sandbox no envía mensajes internacionales de forma confiable.** Advertencia de Twilio. Para Argentina, puede fallar. Para producción real usar sender propio verificado.

- **El webhook necesita URL pública.** Para dev local necesitás ngrok. Para producción usar URL de Vercel — es más simple y estable.

- **Formato del número en Twilio:** siempre con prefijo `whatsapp:+NÚMERO`. El sandbox es `whatsapp:+14155238886`.
