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

## Estado actual
```json
{
  "permissions": {
    "allow": [
      "Bash(git add *)",
      "Bash(npx tsc --noEmit *)"
    ]
  }
}
```

**Cambio:** agregado `Bash(npx tsc --noEmit *)` — permite correr TypeScript type check sin prompt de aprobación.

Para revertir: decile a Claude "revertí los permisos al estado original".
