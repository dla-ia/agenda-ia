'use client';

import { useState } from 'react';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Turnos de ejemplo
const turnosSemana = [
  { id: '1', paciente: 'María González', dia: 1, hora: '09:00', estado: 'confirmado' },
  { id: '2', paciente: 'Carlos López', dia: 1, hora: '10:00', estado: 'pendiente' },
  { id: '3', paciente: 'Ana Martínez', dia: 1, hora: '11:00', estado: 'confirmado' },
  { id: '4', paciente: 'Jorge Pérez', dia: 1, hora: '14:00', estado: 'pendiente' },
  { id: '5', paciente: 'Laura Rodríguez', dia: 1, hora: '15:30', estado: 'confirmado' },
  { id: '6', paciente: 'Sofia García', dia: 2, hora: '09:30', estado: 'confirmado' },
  { id: '7', paciente: 'Miguel Torres', dia: 2, hora: '11:00', estado: 'pendiente' },
  { id: '8', paciente: 'Elena Ruiz', dia: 3, hora: '10:00', estado: 'confirmado' },
  { id: '9', paciente: 'Roberto Sánchez', dia: 3, hora: '14:30', estado: 'cancelado' },
  { id: '10', paciente: 'Patricia Díaz', dia: 4, hora: '09:00', estado: 'confirmado' },
];

export default function TurnosPage() {
  const [semanaActual, setSemanaActual] = useState(0);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTurnosPorDia = (dia: number) => {
    return turnosSemana.filter(t => t.dia === dia + semanaActual * 7);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
          <p className="text-gray-500">Gestión de agenda semanal</p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Nuevo turno
        </button>
      </div>

      {/* Navegación de semanas */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setSemanaActual(Math.max(0, semanaActual - 1))}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Semana anterior
        </button>
        <span className="text-lg font-medium text-gray-900">
          {semanaActual === 0 ? 'Esta semana' : `Semana +${semanaActual}`}
        </span>
        <button
          onClick={() => setSemanaActual(semanaActual + 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Semana siguiente →
        </button>
      </div>

      {/* Grid de días */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {diasSemana.map((dia, index) => {
          const turnos = getTurnosPorDia(index);
          return (
            <div key={dia} className="rounded-lg bg-white shadow-sm">
              <div className="border-b px-4 py-3">
                <h3 className="font-semibold text-gray-900">{dia}</h3>
                <p className="text-sm text-gray-500">{turnos.length} turnos</p>
              </div>
              <div className="p-4 space-y-2">
                {turnos.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin turnos</p>
                ) : (
                  turnos.map((turno) => (
                    <div
                      key={turno.id}
                      className={`rounded border p-2 text-sm ${getEstadoColor(turno.estado)}`}
                    >
                      <p className="font-medium">{turno.hora}</p>
                      <p className="truncate">{turno.paciente}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-green-100 border border-green-200"></span>
          <span className="text-gray-600">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-yellow-100 border border-yellow-200"></span>
          <span className="text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-red-100 border border-red-200"></span>
          <span className="text-gray-600">Cancelado</span>
        </div>
      </div>
    </div>
  );
}