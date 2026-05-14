import { createClient } from '@supabase/supabase-js';
import { getCalendarClient } from './google-calendar';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Argentina = UTC-3, sin cambio horario
function toArgTime(utcDate: Date): Date {
  return new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
}

function formatFechaLegible(dateStr: string): string {
  // Parsear como mediodia UTC para evitar problemas de timezone en el día
  const d = new Date(dateStr + 'T12:00:00Z');
  return `${DIAS_SEMANA[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}

function formatHoraArg(utcDate: Date): string {
  const arg = toArgTime(utcDate);
  return `${String(arg.getUTCHours()).padStart(2, '0')}:${String(arg.getUTCMinutes()).padStart(2, '0')}`;
}

export const AGENT_TOOLS = [
  {
    name: 'get_disponibilidad',
    description:
      'Consulta los horarios libres para reservar un turno en una fecha específica. ' +
      'Usá esta herramienta cuando el paciente quiera saber qué días/horarios hay disponibles, ' +
      'o antes de confirmar una reserva.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fecha: {
          type: 'string',
          description: 'Fecha en formato YYYY-MM-DD. Ejemplo: 2026-05-05',
        },
      },
      required: ['fecha'],
    },
  },
  {
    name: 'crear_turno',
    description:
      'Reserva un turno para el paciente. ' +
      'IMPORTANTE: Solo llamá esta herramienta cuando el paciente haya confirmado explícitamente el día y horario exacto.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fecha_hora: {
          type: 'string',
          description:
            'Fecha y hora del turno en horario argentino. Formato: YYYY-MM-DDTHH:MM:00. Ejemplo: 2026-05-05T10:00:00',
        },
        nombre_paciente: {
          type: 'string',
          description: 'Nombre completo del paciente tal como lo proporcionó.',
        },
      },
      required: ['fecha_hora', 'nombre_paciente'],
    },
  },
  {
    name: 'ver_turnos_paciente',
    description:
      'Muestra los próximos turnos del paciente que está escribiendo. ' +
      'Usá esta herramienta cuando pregunte por sus turnos o quiera cancelar/reprogramar.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'cancelar_turno',
    description:
      'Cancela un turno existente. ' +
      'Solo llamá esta herramienta cuando el paciente haya confirmado que quiere cancelar ' +
      'y ya tengas el turno_id obtenido de ver_turnos_paciente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        turno_id: {
          type: 'string',
          description: 'ID UUID del turno a cancelar, obtenido de ver_turnos_paciente.',
        },
      },
      required: ['turno_id'],
    },
  },
];

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  profesionalId: string,
  telefono: string,
  conversacionId?: string
): Promise<unknown> {
  const supabase = getAdminClient();

  switch (toolName) {
    case 'get_disponibilidad': {
      const fecha = toolInput.fecha as string;

      const { data: prof } = await supabase
        .from('profesionales')
        .select('horario_inicio, horario_fin, dias_laborables, duracion_sesion_minutos')
        .eq('id', profesionalId)
        .single();

      if (!prof) return { error: 'No se encontró la configuración del profesional.' };

      // Verificar si es día laborable
      // JS: 0=domingo,1=lunes,...,6=sábado — igual que el schema (lunes=1..viernes=5, domingo=0)
      const fechaObjCheck = new Date(fecha + 'T12:00:00Z');
      const diaSemana = fechaObjCheck.getUTCDay();
      const diasLaborables: number[] = prof.dias_laborables || [1, 2, 3, 4, 5];

      if (!diasLaborables.includes(diaSemana)) {
        return {
          disponible: false,
          fecha_legible: formatFechaLegible(fecha),
          mensaje: `El ${formatFechaLegible(fecha)} no es un día laborable.`,
        };
      }

      // Turno horario 9-20 ART = 12-23 UTC (mismo día calendario)
      // Querying full UTC day captura todos los turnos del día laborable argentino
      const { data: turnosExistentes } = await supabase
        .from('turnos')
        .select('fecha_hora')
        .eq('profesional_id', profesionalId)
        .gte('fecha_hora', fecha + 'T00:00:00Z')
        .lte('fecha_hora', fecha + 'T23:59:59Z')
        .neq('estado', 'cancelado');

      const horasTomadas = new Set<string>();
      for (const t of turnosExistentes || []) {
        horasTomadas.add(formatHoraArg(new Date(t.fecha_hora)));
      }

      // Generar slots disponibles
      const duracion = prof.duracion_sesion_minutos || 50;
      const [hInicioStr] = (prof.horario_inicio || '09:00:00').split(':');
      const [hFinStr] = (prof.horario_fin || '20:00:00').split(':');
      const minInicio = parseInt(hInicioStr) * 60;
      const minFin = parseInt(hFinStr) * 60;

      const slots: string[] = [];
      for (let min = minInicio; min < minFin; min += duracion) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (!horasTomadas.has(slot)) slots.push(slot);
      }

      // Si es hoy, filtrar slots pasados
      const ahoraArg = toArgTime(new Date());
      const hoyStr = ahoraArg.toISOString().split('T')[0];
      const esHoy = fecha === hoyStr;
      const slotsFinales = esHoy
        ? slots.filter(s => {
            const [h, m] = s.split(':').map(Number);
            const aH = ahoraArg.getUTCHours();
            const aM = ahoraArg.getUTCMinutes();
            return h > aH || (h === aH && m > aM);
          })
        : slots;

      if (slotsFinales.length === 0) {
        return {
          disponible: false,
          fecha_legible: formatFechaLegible(fecha),
          mensaje: `No hay horarios disponibles para el ${formatFechaLegible(fecha)}.`,
        };
      }

      return {
        disponible: true,
        fecha,
        fecha_legible: formatFechaLegible(fecha),
        horarios_disponibles: slotsFinales,
      };
    }

    case 'crear_turno': {
      const fechaHoraArg = toolInput.fecha_hora as string; // "2026-05-05T10:00:00" (ART)
      const nombrePaciente = toolInput.nombre_paciente as string;

      // Convertir ART (UTC-3) a UTC con offset explícito.
      // El viejo `h + 3` desbordaba la hora (24+) para turnos después de las 21:00 ART.
      const fechaHoraDate = new Date(`${fechaHoraArg}-03:00`);
      if (isNaN(fechaHoraDate.getTime())) {
        return { success: false, error: 'No pude interpretar la fecha y hora del turno. Pedile al paciente que la repita.' };
      }
      if (fechaHoraDate.getTime() < Date.now()) {
        return { success: false, error: 'Esa fecha y hora ya pasó. Ofrecé un horario futuro al paciente.' };
      }
      const fechaHoraUTC = fechaHoraDate.toISOString();

      // Verificar solapamiento — el tool no validaba y permitía doble-booking
      // (la data route /api/data/agenda sí lo hacía: quedaba inconsistente).
      const datePart = fechaHoraArg.split('T')[0];
      const nuevoStart = fechaHoraDate.getTime();
      const nuevoEnd   = nuevoStart + 50 * 60 * 1000;
      const { data: turnosDelDia } = await supabase
        .from('turnos')
        .select('fecha_hora, duracion_minutos')
        .eq('profesional_id', profesionalId)
        .in('estado', ['pendiente', 'confirmado'])
        .gte('fecha_hora', `${datePart}T00:00:00Z`)
        .lte('fecha_hora', `${datePart}T23:59:59Z`);

      const haySolapamiento = (turnosDelDia ?? []).some(t => {
        const tStart = new Date(t.fecha_hora).getTime();
        const tEnd   = tStart + (t.duracion_minutos ?? 50) * 60 * 1000;
        return nuevoStart < tEnd && nuevoEnd > tStart;
      });
      if (haySolapamiento) {
        return { success: false, error: 'Ese horario ya está ocupado. Ofrecé otro horario al paciente.' };
      }

      // Buscar o crear paciente
      let { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('profesional_id', profesionalId)
        .eq('telefono', telefono)
        .maybeSingle();

      if (!paciente) {
        const { data } = await supabase
          .from('pacientes')
          .insert({ profesional_id: profesionalId, nombre: nombrePaciente, telefono })
          .select('id')
          .single();
        paciente = data;
      } else {
        await supabase.from('pacientes').update({ nombre: nombrePaciente }).eq('id', paciente.id);
      }

      const { data: turno, error } = await supabase
        .from('turnos')
        .insert({
          profesional_id: profesionalId,
          paciente_id: paciente!.id,
          fecha_hora: fechaHoraUTC,
          duracion_minutos: 50,
          estado: 'confirmado',
        })
        .select('id, fecha_hora')
        .single();

      if (error || !turno) {
        return { success: false, error: 'No se pudo crear el turno. El horario puede estar ocupado.' };
      }

      const arg = toArgTime(new Date(turno.fecha_hora));
      const fechaLegible =
        `${DIAS_SEMANA[arg.getUTCDay()]} ${arg.getUTCDate()} de ${MESES[arg.getUTCMonth()]} ` +
        `a las ${String(arg.getUTCHours()).padStart(2, '0')}:${String(arg.getUTCMinutes()).padStart(2, '0')}hs`;

      // Cerrar conversación para que el próximo mensaje empiece limpio
      if (conversacionId) {
        supabase.from('conversaciones').update({ estado: 'archivada' }).eq('id', conversacionId).then(() => {});
      }

      // Crear evento en Google Calendar (best-effort, no bloquea la confirmación)
      try {
        const { data: prof } = await supabase
          .from('profesionales')
          .select('google_calendar_token, nombre')
          .eq('id', profesionalId)
          .single();

        if (prof?.google_calendar_token) {
          const calendar = getCalendarClient(prof.google_calendar_token as object);
          const endTime = new Date(new Date(turno.fecha_hora).getTime() + 50 * 60 * 1000);
          await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: `Turno - ${nombrePaciente}`,
              description: `Turno agendado por Aurora vía WhatsApp.\nTeléfono: ${telefono}`,
              start: { dateTime: turno.fecha_hora, timeZone: 'America/Argentina/Buenos_Aires' },
              end:   { dateTime: endTime.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
            },
          });
        }
      } catch (calErr) {
        console.error('[Google Calendar] Error creando evento:', calErr);
      }

      return { success: true, turno_id: turno.id, fecha_confirmada: fechaLegible };
    }

    case 'ver_turnos_paciente': {
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id, nombre')
        .eq('profesional_id', profesionalId)
        .eq('telefono', telefono)
        .maybeSingle();

      if (!paciente) {
        return { tiene_turnos: false, mensaje: 'No encontré turnos registrados para tu número.' };
      }

      const { data: turnos } = await supabase
        .from('turnos')
        .select('id, fecha_hora, estado')
        .eq('profesional_id', profesionalId)
        .eq('paciente_id', paciente.id)
        .gte('fecha_hora', new Date().toISOString())
        .neq('estado', 'cancelado')
        .order('fecha_hora', { ascending: true })
        .limit(5);

      if (!turnos || turnos.length === 0) {
        return { tiene_turnos: false, nombre: paciente.nombre, mensaje: 'No tenés turnos próximos.' };
      }

      return {
        tiene_turnos: true,
        nombre: paciente.nombre,
        turnos: turnos.map(t => {
          const arg = toArgTime(new Date(t.fecha_hora));
          return {
            id: t.id,
            fecha_legible:
              `${DIAS_SEMANA[arg.getUTCDay()]} ${arg.getUTCDate()} de ${MESES[arg.getUTCMonth()]} ` +
              `a las ${String(arg.getUTCHours()).padStart(2, '0')}:${String(arg.getUTCMinutes()).padStart(2, '0')}hs`,
            estado: t.estado,
          };
        }),
      };
    }

    case 'cancelar_turno': {
      const turnoId = toolInput.turno_id as string;

      // El turno debe pertenecer al paciente que escribe — sin el filtro por
      // paciente_id, un paciente podía cancelar turnos de otros pacientes del
      // mismo profesional si conocía el turno_id (ej. vía prompt injection).
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('id')
        .eq('profesional_id', profesionalId)
        .eq('telefono', telefono)
        .maybeSingle();

      if (!paciente) {
        return { success: false, error: 'No encontré turnos registrados para tu número.' };
      }

      const { data: cancelado, error } = await supabase
        .from('turnos')
        .update({ estado: 'cancelado' })
        .eq('id', turnoId)
        .eq('profesional_id', profesionalId)
        .eq('paciente_id', paciente.id)
        .select('id');

      if (error || !cancelado || cancelado.length === 0) {
        return { success: false, error: 'No se pudo cancelar el turno.' };
      }

      return { success: true };
    }

    default:
      return { error: `Herramienta desconocida: ${toolName}` };
  }
}
