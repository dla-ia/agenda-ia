import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS, executeTool } from './agent-tools';
import { supabaseAdmin } from './supabase-admin';

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
  conversacionId?: string;
  pacienteId?: string;
  telefono: string;
  nombrePaciente?: string;
  historial: Message[];
}

interface AgenteConfig {
  nombre: string;
  tono: string;
  saludo: string;
  cierre: string;
  frases_prohibidas: string[];
  reagenda_automatica: boolean;
  confirma_24h: boolean;
  buffer_sesiones: boolean;
  nombreProfesional?: string;
  horarioInicio?: string;
  horarioFin?: string;
  diasLaborables?: number[];
}

const CONFIG_DEFAULTS: AgenteConfig = {
  nombre:               'Aurora',
  tono:                 'warm',
  saludo:               'Hola, soy Aurora, la asistente del profesional. ¿Cómo puedo ayudarte?',
  cierre:               '¡Te espero! Cualquier duda, estoy por acá.',
  frases_prohibidas:    ['diagnósticos', 'pronósticos', 'consejos médicos', 'promesas de resultado'],
  reagenda_automatica:  true,
  confirma_24h:         true,
  buffer_sesiones:      true,
};

async function loadAgenteConfig(profesionalId: string): Promise<AgenteConfig> {
  try {
    const [{ data: configRows }, { data: prof }] = await Promise.all([
      supabaseAdmin
        .from('configuraciones')
        .select('clave, valor')
        .eq('profesional_id', profesionalId),
      supabaseAdmin
        .from('profesionales')
        .select('nombre, horario_inicio, horario_fin, dias_laborables')
        .eq('id', profesionalId)
        .single(),
    ]);

    const raw: Record<string, string> = {};
    for (const row of configRows ?? []) if (row.valor !== null) raw[row.clave] = row.valor;

    return {
      nombre:              raw.agente_nombre              ?? CONFIG_DEFAULTS.nombre,
      tono:                raw.agente_tono                ?? CONFIG_DEFAULTS.tono,
      saludo:              raw.agente_saludo              ?? CONFIG_DEFAULTS.saludo,
      cierre:              raw.agente_cierre              ?? CONFIG_DEFAULTS.cierre,
      frases_prohibidas:   raw.agente_frases_prohibidas   ? JSON.parse(raw.agente_frases_prohibidas) : CONFIG_DEFAULTS.frases_prohibidas,
      reagenda_automatica: raw.agente_reagenda_automatica !== 'false',
      confirma_24h:        raw.agente_confirma_24h        !== 'false',
      buffer_sesiones:     raw.agente_buffer_sesiones     !== 'false',
      nombreProfesional:   prof?.nombre ?? undefined,
      horarioInicio:       prof?.horario_inicio ?? '09:00',
      horarioFin:          prof?.horario_fin    ?? '20:00',
      diasLaborables:      prof?.dias_laborables ?? [1, 2, 3, 4, 5],
    };
  } catch {
    return CONFIG_DEFAULTS;
  }
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function getSystemPrompt(cfg: AgenteConfig): string {
  const ahora = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const hoy = `${DIAS_SEMANA[ahora.getUTCDay()]} ${ahora.getUTCDate()} de ${MESES[ahora.getUTCMonth()]} de ${ahora.getUTCFullYear()}`;
  const horaActual = `${String(ahora.getUTCHours()).padStart(2, '0')}:${String(ahora.getUTCMinutes()).padStart(2, '0')}`;
  const horaActualNum = ahora.getUTCHours() * 60 + ahora.getUTCMinutes();

  // Evaluar si estamos fuera de horario laboral
  const [hIni, mIni] = (cfg.horarioInicio ?? '09:00').split(':').map(Number);
  const [hFin, mFin] = (cfg.horarioFin    ?? '20:00').split(':').map(Number);
  const minutosInicio = hIni * 60 + (mIni || 0);
  const minutosFin    = hFin * 60 + (mFin || 0);
  const diasLaborables = cfg.diasLaborables ?? [1, 2, 3, 4, 5];
  const esHorarioLaboral =
    diasLaborables.includes(ahora.getUTCDay()) &&
    horaActualNum >= minutosInicio &&
    horaActualNum < minutosFin;

  const nombreProf = cfg.nombreProfesional ? `de ${cfg.nombreProfesional}` : 'del profesional';

  const toneDesc: Record<string, string> = {
    warm:   'Tono cálido y empático. Usá palabras amables, mostrá comprensión.',
    direct: 'Tono directo y eficiente. Respondé de forma concisa, sin rodeos.',
    casual: 'Tono cercano y casual. Podés usar emojis con moderación.',
  };

  const frasesProhibidas = cfg.frases_prohibidas.length
    ? `- Nunca usés estas palabras o frases: ${cfg.frases_prohibidas.join(', ')}.`
    : '';

  const diasNombres = diasLaborables.map(d => DIAS_SEMANA[d] ?? '').filter(Boolean).join(', ');
  const horarioInfo = `${cfg.horarioInicio ?? '09:00'} a ${cfg.horarioFin ?? '20:00'} (${diasNombres})`;

  const avisoFueraHorario = !esHorarioLaboral
    ? `\n⚠️ CONTEXTO: Ahora son las ${horaActual}hs. El consultorio está FUERA DE HORARIO. Podés recibir el mensaje y confirmar el turno para otro día, pero informá amablemente que el turno se confirmará cuando el consultorio abra (${horarioInfo}).`
    : '';

  return `Sos ${cfg.nombre}, el asistente virtual ${nombreProf}. Tu trabajo es gestionar la agenda de turnos.

## Fecha y hora actual (Argentina)
Hoy es ${hoy}, ${horaActual}hs. Usá esta información para interpretar fechas relativas ("el jueves", "mañana", "la semana que viene", etc.).
Horario de atención del consultorio: ${horarioInfo}.${avisoFueraHorario}

## Personalidad
${toneDesc[cfg.tono] ?? toneDesc.warm}
Español rioplatense. No menciones que sos IA a menos que te lo pregunten.

## Tu saludo inicial
Cuando un paciente escribe por primera vez: "${cfg.saludo}"

## Tu frase de cierre
Al confirmar un turno o despedirte: "${cfg.cierre}"

## Reglas importantes
1. **Alcance**: Solo gestioná agenda. No des consejos de salud, diagnósticos ni pronósticos.
${frasesProhibidas ? `2. ${frasesProhibidas}` : ''}
3. **Crisis o emergencia**: Si el mensaje sugiere autolesión, ideación suicida o una crisis emocional grave, respondé EXACTAMENTE: "Entiendo que estás pasando un momento muy difícil. Por favor comunicate directamente con el profesional o llamá a las líneas de ayuda: 135 (CABA, gratuito) · 0800-345-1435 (todo el país, gratuito). Estoy disponible para agenda cuando estés listo/a." No sigas el flujo normal de agenda luego de este mensaje.
4. **Fuera de horario**: Si alguien escribe fuera del horario de atención (${horarioInfo}), podés igualmente registrar su turno para un día y hora futuros dentro del horario. Informá que el consultorio retomará actividad en el próximo día hábil.

## Flujo para reservar un turno — MUY IMPORTANTE

**Paso 1:** Preguntá qué día le queda bien. Cuando lo diga, llamá get_disponibilidad y mostrá los horarios disponibles. En ese mismo mensaje, si no sabés su nombre, preguntalo: "¿Cuál te queda mejor? Y decime tu nombre para registrarte 😊"

**Paso 2:** Cuando el paciente elija el horario (frases como "las 9", "el de las 10", "ese", "perfecto el de las 9", "a las 14", etc.) Y ya tengas su nombre → llamá crear_turno INMEDIATAMENTE. No pidas confirmación adicional. El hecho de que eligió el horario ES la confirmación.

**Paso 3:** Después de crear el turno (cuando crear_turno devuelva success: true), informá los datos y cerrá con tu frase de cierre.

**CRÍTICO:** Si el paciente dijo un horario y ya tenés su nombre, NUNCA preguntes "¿confirmás?" ni "¿te parece bien?". Creá el turno directamente.

**CRÍTICO:** Cuando el paciente dice el horario, reconstruí la fecha exacta del contexto. Si antes dijiste "Tengo disponible el lunes 5 de mayo: 9:00, 10:00..." y el paciente dice "las 9", el turno es 2026-05-05T09:00:00.

## Flujo para cancelar un turno
1. Llamá ver_turnos_paciente para ver sus turnos.
2. Mostrá los turnos y preguntá cuál quiere cancelar.
3. Cuando confirme, llamá cancelar_turno.

Respondé de manera natural. Sé resolutivo: menos preguntas, más acción.`;
}

export async function sendMessage(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  const [cfg, messages] = await Promise.all([
    loadAgenteConfig(context.profesionalId),
    Promise.resolve(context.historial.map(msg => ({
      role: msg.role,
      content: msg.content,
    } as Anthropic.MessageParam))),
  ]);

  messages.push({ role: 'user', content: userMessage });

  const systemPrompt = getSystemPrompt(cfg);
  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
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
              context.telefono,
              context.conversacionId
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

    break;
  }

  return 'Disculpá, tuve un problema procesando tu mensaje. Intentá de nuevo.';
}
