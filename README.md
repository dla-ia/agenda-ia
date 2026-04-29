# 📁 Plantilla Base — Proyectos con Claude Code

Copiá esta carpeta completa cada vez que arrancás un proyecto nuevo.

## Archivos incluidos

| Archivo | Para qué |
|---------|----------|
| `CLAUDE.md` | Memoria del proyecto — Claude lo lee en cada sesión |
| `INICIO-PROYECTO.md` | Prompts listos para arrancar, retomar y cerrar sesiones |
| `docs/architecture.md` | Arquitectura técnica del proyecto |
| `docs/tasks.md` | Tareas con checkboxes — tu sistema de continuidad |
| `docs/context.md` | Estado al cierre de sesión — para retomar donde dejaste |

## Cómo usar

### Proyecto nuevo
1. Copiá esta carpeta: `cp -r plantilla-proyecto/ mi-nuevo-proyecto/`
2. Abrí `mi-nuevo-proyecto/` en VS Code
3. Abrí `INICIO-PROYECTO.md` y seguí las instrucciones

### Retomar proyecto
Abrí Claude Code y pegá:
```
Leé CLAUDE.md y @docs/context.md.
Resumime dónde estamos y cuál es el próximo paso. No hagas nada todavía.
```

### Cerrar sesión
Antes de cerrar Claude Code, pegá:
```
Actualizá docs/tasks.md y docs/context.md con el estado actual. 
Escribí el próximo paso concreto.
```

## Regla de oro para ahorrar tokens

**CLAUDE.md = solo lo que Claude necesita en CADA sesión** (corto)
**docs/ = todo el detalle** (se carga solo cuando lo necesitás con @docs/archivo)
