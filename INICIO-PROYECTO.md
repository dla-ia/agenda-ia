# 🚀 PROMPT DE INICIO DE PROYECTO
## Pegá esto en Claude Code al arrancar un proyecto nuevo

---

```
Vamos a iniciar un nuevo proyecto. Necesito que me ayudes a configurarlo de forma ordenada, 
continuable y token-friendly.

## Datos del proyecto

**Nombre:** [NOMBRE]
**Descripción:** [Qué hace y para quién — 2 líneas]
**Tipo:** [web app / chatbot / automatización / API / script]
**Stack elegido:** [o decí "ayudame a elegir" si no lo definiste]
**Usa IA:** [sí/no — y si sí, qué modelo/servicio]

## Lo que necesito que hagas

1. Completá el archivo CLAUDE.md con los datos reales del proyecto
2. Creá la estructura de carpetas adecuada para este tipo de proyecto
3. Completá docs/architecture.md con las decisiones técnicas iniciales
4. En docs/tasks.md, listá las primeras 5-7 tareas concretas para arrancar
5. En docs/context.md, escribí el estado inicial del proyecto

## Reglas de trabajo

- Trabajamos en pasos pequeños, uno a la vez
- Al terminar cada tarea, tildá el checkbox en tasks.md
- Antes de hacer cambios grandes, describí qué vas a hacer y esperá confirmación
- Si necesitás contexto extra, pedímelo con @docs/archivo antes de inventar
- Al final de sesión, actualizá docs/context.md con el estado

## Para retomar en otra sesión

Siempre que retomemos, arrancá leyendo CLAUDE.md y @docs/context.md antes de hacer nada.

¿Entendiste el proyecto? Haceme un resumen en 3 puntos y decime cuál es el primer paso.
```

---

## 📋 Checklist antes de empezar

- [ ] Copié la plantilla-proyecto a la carpeta del nuevo proyecto
- [ ] Completé los datos del proyecto en el prompt arriba
- [ ] Abrí la carpeta en VS Code
- [ ] Inicié Claude Code (`claude` en la terminal)
- [ ] Pegué el prompt

## 🔁 Para retomar un proyecto existente

Pegá esto al abrir una sesión nueva:

```
Leé CLAUDE.md y @docs/context.md. 
Resumime en 2 puntos dónde estamos y cuál es el próximo paso según docs/tasks.md.
No hagas nada todavía, esperá mi confirmación.
```

## 💾 Para cerrar una sesión

Pegá esto antes de cerrar:

```
Antes de terminar:
1. Tildá las tareas completadas en docs/tasks.md
2. Actualizá docs/context.md con el estado actual
3. Escribí el próximo paso concreto en docs/context.md
Después hacé un resumen de lo que hicimos hoy.
```
