'use client';

import { useState } from 'react';

const pacientes = [
  { id: '1', nombre: 'María González', telefono: '+54 9 11 1234-5678', email: 'maria@gmail.com', ultimoTurno: '2026-04-25', proximoTurno: '2026-04-30' },
  { id: '2', nombre: 'Carlos López', telefono: '+54 9 11 2345-6789', email: 'carlos@gmail.com', ultimoTurno: '2026-04-20', proximoTurno: '2026-05-02' },
  { id: '3', nombre: 'Ana Martínez', telefono: '+54 9 11 3456-7890', email: 'ana@gmail.com', ultimoTurno: '2026-04-28', proximoTurno: null },
  { id: '4', nombre: 'Jorge Pérez', telefono: '+54 9 11 4567-8901', email: 'jorge@gmail.com', ultimoTurno: '2026-04-15', proximoTurno: '2026-05-01' },
  { id: '5', nombre: 'Laura Rodríguez', telefono: '+54 9 11 5678-9012', email: 'laura@gmail.com', ultimoTurno: '2026-04-22', proximoTurno: '2026-04-29' },
  { id: '6', nombre: 'Sofia García', telefono: '+54 9 11 6789-0123', email: 'sofia@gmail.com', ultimoTurno: '2026-04-18', proximoTurno: null },
  { id: '7', nombre: 'Miguel Torres', telefono: '+54 9 11 7890-1234', email: 'miguel@gmail.com', ultimoTurno: '2026-04-10', proximoTurno: '2026-05-03' },
  { id: '8', nombre: 'Elena Ruiz', telefono: '+54 9 11 8901-2345', email: 'elena@gmail.com', ultimoTurno: '2026-04-27', proximoTurno: '2026-05-05' },
];

export default function PacientesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string | null>(null);

  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.telefono.includes(busqueda)
  );

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const pacienteActual = pacientes.find(p => p.id === pacienteSeleccionado);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">{pacientes.length} pacientes registrados</p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Nuevo paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de pacientes */}
        <div className="rounded-lg bg-white shadow-sm lg:col-span-1">
          <div className="divide-y">
            {pacientesFiltrados.map((paciente) => (
              <button
                key={paciente.id}
                onClick={() => setPacienteSeleccionado(paciente.id)}
                className={`w-full px-4 py-4 text-left hover:bg-gray-50 ${
                  pacienteSeleccionado === paciente.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">{paciente.nombre.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{paciente.nombre}</p>
                    <p className="text-sm text-gray-500">{paciente.telefono}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del paciente */}
        <div className="rounded-lg bg-white shadow-sm lg:col-span-2">
          {pacienteActual ? (
            <>
              <div className="border-b px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-medium text-primary-600">{pacienteActual.nombre.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{pacienteActual.nombre}</h2>
                    <p className="text-gray-500">{pacienteActual.telefono}</p>
                    <p className="text-gray-500">{pacienteActual.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Último turno</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatFecha(pacienteActual.ultimoTurno)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Próximo turno</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatFecha(pacienteActual.proximoTurno)}</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Editar
                  </button>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Ver historial
                  </button>
                  <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                    Agendar turno
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              <p>Seleccioná un paciente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}