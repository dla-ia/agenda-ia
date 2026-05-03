# Historial de cambios en settings.json

## Estado original (antes de sesión autónoma 03/05/2026)
```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)"
    ]
  }
}
```

## Estado actual (03/05/2026 loop 2)
```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(npx tsc --noEmit *)",
      "Bash(npx vercel logs *)",
      "Bash(npx vercel env ls *)",
      "Bash(git commit *)",
      "Bash(git push *)"
    ]
  }
}
```

**Cambios acumulados:**
- `Bash(npx tsc --noEmit *)` — TypeScript check sin prompt (Claude Code, loop 1)
- `Bash(npx vercel logs *)` + `Bash(npx vercel env ls *)` — read-only Vercel (Claude Code, loop 1)
- `Bash(git commit *)` + `Bash(git push *)` — commits y push sin prompt (Diego, loop 2)

Para revertir: decile a Claude "revertí los permisos al estado original".
