'use client';

import { useState, useEffect } from 'react';

// Datos de ejemplo para el MVP
const turnosEjemplo = [
  { id: '1', paciente: 'María González', hora: '09:00', estado: 'confirmado' },
  { id: '2', paciente: 'Carlos López', hora: '10:00', estado: 'pendiente' },
  { id: '3', paciente: 'Ana Martínez', hora: '11:00', estado: 'confirmado' },
  { id: '4', paciente: 'Jorge Pérez', hora: '14:00', estado: 'pendiente' },
  { id: '5', paciente: 'Laura Rodríguez', hora: '15:30', estado: 'confirmado' },
];

const conversacionesRecientes = [
  { id: '1', paciente: 'María González', ultimoMensaje: 'Confirmo el turno para mañana', hora: '10:30' },
  { id: '2', paciente: 'Carlos López', ultimoMensaje: 'Tengo disponible el martes a las 14hs', hora: '09:15' },
  { id: '3', paciente: 'Ana Martínez', ultimoMensaje: 'Perfecto, nos vemos el viernes', hora: 'Ayer' },
];

export default function Dashboard() {
  const [fechaActual, setFechaActual] = useState('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setFechaActual(now.toLocaleDateString('es-AR', options));
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 capitalize">{fechaActual}</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Turnos hoy</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">5</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Confirmados</p>
          <p className="mt-2 text-3xl font-bold text-green-600">3</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pendientes</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">2</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pacientes</p>
          <p className="mt-2 text-3xl font-bold text-primary-600">24</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Turnos del día */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Turnos de hoy</h2>
          </div>
          <div className="divide-y">
            {turnosEjemplo.map((turno) => (
              <div key={turno.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {turno.paciente.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{turno.paciente}</p>
                    <p className="text-sm text-gray-500">{turno.hora}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getEstadoColor(turno.estado)}`}>
                  {turno.estado}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t px-6 py-4">
            <a href="/turnos" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Ver todos los turnos →
            </a>
          </div>
        </div>

        {/* Conversaciones recientes */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversaciones recientes</h2>
          </div>
          <div className="divide-y">
            {conversacionesRecientes.map((conv) => (
              <div key={conv.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{conv.paciente}</p>
                  <p className="text-sm text-gray-500 truncate">{conv.ultimoMensaje}</p>
                </div>
                <span className="text-xs text-gray-400">{conv.hora}</span>
              </div>
            ))}
          </div>
          <div className="border-t px-6 py-4">
            <a href="/conversaciones" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Ver todas las conversaciones →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}