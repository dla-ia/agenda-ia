'use client';

import { useState } from 'react';

const conversaciones = [
  {
    id: '1',
    paciente: 'María González',
    telefono: '+54 9 11 1234-5678',
    ultimoMensaje: 'Confirmo el turno para mañana a las 9hs',
    ultimoMensajeAt: '2026-04-29T10:30:00',
    estado: 'activa',
    mensajes: [
      { id: '1', contenido: 'Hola, quería saber si hay turno disponible', direccion: 'entrante', created_at: '2026-04-29T10:00:00' },
      { id: '2', contenido: '¡Hola María! Sí, tenemos disponibilidad. ¿Qué día te conviene?', direccion: 'saliente', created_at: '2026-04-29T10:01:00' },
      { id: '3', contenido: 'Tengo libre el martes o miércoles por la mañana', direccion: 'entrante', created_at: '2026-04-29T10:05:00' },
      { id: '4', contenido: 'Perfecto, el martes a las 9hs o el miércoles a las 10hs. ¿Cuál te va?', direccion: 'saliente', created_at: '2026-04-29T10:06:00' },
      { id: '5', contenido: 'El martes a las 9hs me va bien. Confirmo.', direccion: 'entrante', created_at: '2026-04-29T10:30:00' },
    ]
  },
  {
    id: '2',
    paciente: 'Carlos López',
    telefono: '+54 9 11 2345-6789',
    ultimoMensaje: 'Tengo disponible el martes a las 14hs',
    ultimoMensajeAt: '2026-04-29T09:15:00',
    estado: 'activa',
    mensajes: [
      { id: '1', contenido: 'Buenas, necesito un turno', direccion: 'entrante', created_at: '2026-04-29T09:00:00' },
      { id: '2', contenido: '¡Hola Carlos! ¿Qué día y horario te viene mejor?', direccion: 'saliente', created_at: '2026-04-29T09:01:00' },
      { id: '3', contenido: 'Tengo disponible el martes a las 14hs', direccion: 'entrante', created_at: '2026-04-29T09:15:00' },
    ]
  },
  {
    id: '3',
    paciente: 'Ana Martínez',
    telefono: '+54 9 11 3456-7890',
    ultimoMensaje: 'Perfecto, nos vemos el viernes',
    ultimoMensajeAt: '2026-04-28T16:20:00',
    estado: 'archivada',
    mensajes: [
      { id: '1', contenido: 'Hola, tengo que cancelar mi turno del viernes', direccion: 'entrante', created_at: '2026-04-28T15:00:00' },
      { id: '2', contenido: '¡Hola Ana! No hay problema. ¿Querés reprogramar?', direccion: 'saliente', created_at: '2026-04-28T15:01:00' },
      { id: '3', contenido: 'Sí, puedo el lunes que viene', direccion: 'entrante', created_at: '2026-04-28T15:30:00' },
      { id: '4', contenido: 'Te reservo el lunes a las 11hs. Confirmado.', direccion: 'saliente', created_at: '2026-04-28T15:31:00' },
      { id: '5', contenido: 'Perfecto, nos vemos el viernes', direccion: 'entrante', created_at: '2026-04-28T16:20:00' },
    ]
  },
];

export default function ConversacionesPage() {
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activa' | 'archivada'>('todas');

  const conversacionesFiltradas = conversaciones.filter(c => 
    filtroEstado === 'todas' ? true : c.estado === filtroEstado
  );

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const horas = diff / (1000 * 60 * 60);
    
    if (horas < 1) return 'Hace unos minutos';
    if (horas < 24) return `Hace ${Math.floor(horas)}h`;
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const convActual = conversaciones.find(c => c.id === conversacionSeleccionada);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Conversaciones</h1>
        <p className="text-gray-500">Chat con pacientes via WhatsApp</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFiltroEstado('todas')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filtroEstado === 'todas' 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFiltroEstado('activa')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filtroEstado === 'activa' 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Activas
        </button>
        <button
          onClick={() => setFiltroEstado('archivada')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filtroEstado === 'archivada' 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Archivadas
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de conversaciones */}
        <div className="rounded-lg bg-white shadow-sm lg:col-span-1">
          <div className="divide-y">
            {conversacionesFiltradas.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setConversacionSeleccionada(conv.id)}
                className={`w-full px-4 py-4 text-left hover:bg-gray-50 ${
                  conversacionSeleccionada === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{conv.paciente}</p>
                  <span className="text-xs text-gray-400">{formatFecha(conv.ultimoMensajeAt)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 truncate">{conv.ultimoMensaje}</p>
                <p className="mt-1 text-xs text-gray-400">{conv.telefono}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle de conversación */}
        <div className="rounded-lg bg-white shadow-sm lg:col-span-2">
          {convActual ? (
            <>
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">{convActual.paciente}</h2>
                <p className="text-sm text-gray-500">{convActual.telefono}</p>
              </div>
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {convActual.mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direccion === 'entrante' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.direccion === 'entrante'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-primary-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.contenido}</p>
                      <p className={`text-xs mt-1 ${msg.direccion === 'entrante' ? 'text-gray-500' : 'text-primary-200'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribir mensaje..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              <p>Seleccioná una conversación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}