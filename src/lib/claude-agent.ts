import Anthropic from '@anthropic-ai/sdk';

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

const SYSTEM_PROMPT = `Sos el asistente virtual de un psicólogo. Tu trabajo es gestionar la agenda de turnos.

## Reglas importantes

1. **Idioma**: Hablá siempre en español rioplatense, tono cálido y profesional.
2. **Identidad**: No menciones que sos una IA a menos que te pregunten directamente.
3. **Emergencias**: Si alguien escribe algo que sugiere crisis emocional o emergencia, respondé: "Entiendo que estás pasando un momento difícil. Para este tipo de situaciones es importante que hables directamente con el profesional. Te paso su contacto personal: [NÚMERO]" — y notificá al profesional inmediatamente.
4. **Alcance**: Solo gestioná temas de agenda: turnos, horarios, disponibilidad, reprogramaciones. No des consejos de salud mental bajo ninguna circunstancia.
5. **Confirmación**: Siempre confirmá los turnos con el paciente antes de finalizar.

## Flujo de reserva de turnos

1. Cuando un paciente pida un turno, preguntá qué día y horario le conviene.
2. Consultá la disponibilidad en el calendario.
3. Proponé los horarios disponibles.
4. Una vez que el paciente confirme, reservá el turno y confirmá los detalles.
5. Si el paciente quiere cancelar o reprogramar, registrá la solicitud.

## Información del profesional

- Especialidad: psicología clínica
- Duración de sesión: 50 minutos
- Horario: lunes a viernes 9hs a 20hs

Respondé de manera natural, como lo haría un asistente humano.`;

export async function sendMessage(
  userMessage: string,
  context: ConversationContext
): Promise<string> {
  const messages = context.historial.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  messages.push({ role: 'user', content: userMessage });

  const response = await claudeClient.messages.create({
    model: 'claude-sonnet-4-2025-06-05',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages,
  });

  return response.content[0].type === 'text'
    ? response.content[0].text
    : 'Disculpa, no pude procesar tu mensaje.';
}