# Recursos y Servicios Externos

> Todos los servicios conectados al proyecto. Qué se hizo en cada uno y dónde están las credenciales.
> **IMPORTANTE:** Las credenciales reales están en `.env.local` (no en git) y en el panel de Vercel.

---

## GitHub
- **URL:** github.com — usuario: `dla-ia`
- **Repo:** `agenda-ia` (privado)
- **Para qué:** control de versiones
- **Estado:** activo, rama `main`

---

## Vercel
- **URL:** vercel.com → proyecto `agenda-ia`
- **URL producción:** https://agenda-ia-gray.vercel.app
- **Para qué:** hosting Next.js con deploy automático
- **Lo que se hizo:** proyecto linkeado con CLI, 13 variables de entorno cargadas, `vercel.json` con `framework: nextjs`
- **Comandos útiles:**
  - `npx vercel --prod --yes` → deploy a producción
  - `npx vercel env ls` → ver variables cargadas
  - `npx vercel logs https://agenda-ia-gray.vercel.app` → ver logs en tiempo real
- **Estado:** en producción y funcionando

---

## Supabase
- **URL dashboard:** supabase.com/dashboard/project/aikwrtxmkdthnsnrnjng
- **Project ref:** `aikwrtxmkdthnsnrnjng`
- **URL API:** https://aikwrtxmkdthnsnrnjng.supabase.co
- **Para qué:** base de datos PostgreSQL + Auth
- **Lo que se hizo:** schema completo ejecutado, RLS habilitado, profesional insertado
- **Profesional ID:** `02bccd60-4947-49fc-877d-f109665920f2`
- **Tablas:** profesionales, pacientes, turnos, pagos, lista_espera, conversaciones, mensajes, configuraciones
- **Variables en .env.local:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Conexión directa para scripts:** `postgresql://postgres:[pass]@db.aikwrtxmkdthnsnrnjng.supabase.co:5432/postgres`

---

## Google Cloud Console
- **URL:** console.cloud.google.com
- **Proyecto:** My First Project — ID: `notional-weft-494920-k6`
- **Para qué:** credenciales OAuth 2.0 para Google Calendar API
- **Lo que se hizo:** Calendar API habilitada, OAuth 2.0 configurado, email agregado como usuario de prueba
- **Redirect URIs autorizados:**
  - `http://localhost:3000/api/auth/google/callback` ✅
  - `https://agenda-ia-gray.vercel.app/api/auth/google/callback` ⚠️ PENDIENTE AGREGAR
- **Variables en .env.local:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Archivo original:** `client_secret_396645192332-*.json` (en .gitignore)

---

## Anthropic (Claude API)
- **URL:** platform.claude.com/settings/keys
- **Para qué:** agente conversacional que procesa mensajes de WhatsApp
- **Key name:** AgendaIA
- **Modelo:** `claude-sonnet-4-6`
- **Variables en .env.local:** `ANTHROPIC_API_KEY`
- **Créditos disponibles:** ~$4.84 USD (al 30/04/2026)

---

## Twilio
- **URL:** console.twilio.com
- **Account SID:** ver .env.local (TWILIO_ACCOUNT_SID)
- **Para qué:** WhatsApp Business API — recibir y enviar mensajes
- **Sandbox número:** `+1 415 523 8886` (`whatsapp:+14155238886`)
- **Teléfono conectado:** `+5491159530792`
- **Webhook configurado:** `https://agenda-ia-gray.vercel.app/api/webhooks/twilio` (HTTP POST)
- **Variables en .env.local:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Crédito trial:** $15.50 USD
- **Estado:** sandbox activo, webhook configurado

---

## MercadoPago ⏳ Pendiente
- **Para qué:** cobro de señas online (Fase 2)
- **Variables:** `MERCADOPAGO_ACCESS_TOKEN` (vacía en .env.local)

## Resend ⏳ Pendiente
- **Para qué:** emails transaccionales — confirmaciones y recordatorios (Fase 2)
- **Variables:** `RESEND_API_KEY` (vacía en .env.local)
