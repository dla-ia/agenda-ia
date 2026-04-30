import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS, executeTool } from './agent-tools';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const claudeClient = anthropic;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  profesionalId: string;
  pacienteId?: string;
  telefono: string;
  nombrePaciente?: string;
  historial: Message[];
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function getSystemPrompt(): string {
  // Hora actual en Argentina (UTC-3, sin DST)
  const ahora = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const hoy = `${DIAS_SEMANA[ahora.getUTCDay()]} ${ahora.getUTCDate()} de ${MESES[ahora.getUTCMonth()]} de ${ahora.getUTCFullYear()}`;
  const horaActual = `${String(ahora.getUTCHours()).padStart(2, '0')}:${String(ahora.getUTCMinutes()).padStart(2, '0')}`;

  return `Sos el asistente virtual de un psicólogo. Tu trabajo es gestionar la agenda de turnos.

## Fecha y hora actual (Argentina)
Hoy es ${hoy}, ${horaActual}hs. Usá esta información para interpretar fechas relativas ("el jueves", "mañana", "la semana que viene", etc.).

## Reglas
1. **Idioma**: Español rioplatense, tono cálido y profesional.
2. **Identidad**: No menciones que sos IA a menos que te lo pregunten.
3. **Emergencias**: Si el mensaje sugiere una crisis emocional, respondé: "Entiendo que estás pasando un momento difícil. Es importante que hables directamente con el profesional. Te paso su contacto: [NÚMERO]"
4. **Alcance**: Solo gestioná agenda. No des consejos de salud mental.

## Flujo para reservar un turno — MUY IMPORTANTE

**Paso 1:** Preguntá qué día le queda bien. Cuando lo diga, llamá get_disponibilidad y mostrá los horarios disponibles. En ese mismo mensaje, si no sabés su nombre, preguntalo: "¿Cuál te queda mejor? Y decime tu nombre para registrarte 😊"

**Paso 2:** Cuando el paciente elija el horario (frases como "las 9", "el de las 10", "ese", "perfecto el de las 9", "a las 14", etc.) Y ya tengas su nombre → llamá crear_turno INMEDIATAMENTE. No pidas confirmación adicional. El hecho de que eligió el horario ES la confirmación.

**Paso 3:** Después de crear el turno (cuando crear_turno devuelva success: true), informá los datos: "¡Listo! Te registré el turno para el [fecha_confirmada]. ¡Te esperamos! 🗓️"

**CRÍTICO:** Si el paciente dijo un horario y ya tenés su nombre, NUNCA preguntes "¿confirmás?" ni "¿te parece bien?". Creá el turno directamente y confirmá después.

**CRÍTICO:** Cuando el paciente dice el horario, reconstruí la fecha exacta del contexto de la conversación. Si antes dijiste "Tengo disponible el lunes 5 de mayo: 9:00, 10:00...", y el paciente dice "las 9", el turno es 2026-05-05T09:00:00.

## Flujo para cancelar un turno

1. Llamá ver_turnos_paciente para ver sus turnos.
2. Mostrá los turnos y preguntá cuál quiere cancelar.
3. Cuando confirme, llamá cancelar_turno.

## Información del profesional
- Especialidad: psicología clínica
- Duración: 50 minutos
- Horario: lunes a viernes, 9hs a 20hs

Respondé de manera natural, como un asistente humano. Sé resolutivo: menos preguntas, más acción.`;
}

export async function sendMessage(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  const messages: Anthropic.MessageParam[] = context.historial.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
  messages.push({ role: 'user', content: userMessage });

  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: getSystemPrompt(),
      tools: AGENT_TOOLS,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text');
      return textBlock ? (textBlock as Anthropic.TextBlock).text : 'Disculpá, no pude procesar tu mensaje.';
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          let result: unknown;
          try {
            result = await executeTool(
              block.name,
              block.input as Record<string, unknown>,
              context.profesionalId,
              context.telefono
            );
          } catch (err) {
            result = { error: `Error ejecutando ${block.name}: ${String(err)}` };
          }
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // stop_reason inesperado
    break;
  }

  return 'Disculpá, tuve un problema procesando tu mensaje. Intentá de nuevo.';
}
