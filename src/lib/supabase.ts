import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de la base de datos
export interface Profesional {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  especialidad: string;
  duracion_sesion_minutos: number;
  horario_inicio: string;
  horario_fin: string;
  dias_laborables: number[];
  google_calendar_token?: object;
  google_calendar_refresh_token?: string;
  google_calendar_id?: string;
  twilio_phone_sid?: string;
  twilio_auth_token?: string;
  twilio_account_sid?: string;
  mercado_pago_access_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Paciente {
  id: string;
  profesional_id: string;
  nombre: string;
  telefono: string;
  email?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface Turno {
  id: string;
  profesional_id: string;
  paciente_id?: string;
  fecha_hora: string;
  duracion_minutos: number;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado' | 'no_asistio';
  google_event_id?: string;
  notas?: string;
  recordatorio_enviado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: string;
  turno_id?: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado';
  mercado_pago_payment_id?: string;
  mercado_pago_preference_id?: string;
  fecha_pago?: string;
  created_at: string;
  updated_at: string;
}

export interface ListaEspera {
  id: string;
  profesional_id: string;
  paciente_id: string;
  fecha_alta: string;
  preferencia_horaria: 'mañana' | 'tarde' | 'cualquier';
  dias_disponibles: number[];
  activo: boolean;
  notified_at?: string;
  created_at: string;
}

export interface Conversacion {
  id: string;
  profesional_id: string;
  paciente_id?: string;
  telefono: string;
  ultimo_mensaje?: string;
  ultimo_mensaje_at: string;
  estado: 'activa' | 'archivada';
  created_at: string;
  updated_at: string;
}

export interface Mensaje {
  id: string;
  conversacion_id: string;
  contenido: string;
  direccion: 'entrante' | 'saliente';
  twilio_message_sid?: string;
  created_at: string;
}