'use client';

import { useState } from 'react';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    nombre: 'Dr. Diego',
    email: 'diego@ejemplo.com',
    telefono: '+54 9 11 1234-5678',
    especialidad: 'Psicología clínica',
    duracionSesion: 50,
    horarioInicio: '09:00',
    horarioFin: '20:00',
    diasLaborables: [1, 2, 3, 4, 5],
    googleCalendarConectado: false,
    twilioConectado: false,
    mercadoPagoConectado: false,
    recordatorios: true,
    recordatorioHoras: 24,
  });

  const dias = [
    { valor: 0, nombre: 'Domingo' },
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
  ];

  const toggleDia = (dia: number) => {
    setConfig(prev => ({
      ...prev,
      diasLaborables: prev.diasLaborables.includes(dia)
        ? prev.diasLaborables.filter(d => d !== dia)
        : [...prev.diasLaborables, dia].sort()
    }));
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Ajustes del profesional y del sistema</p>
      </div>

      <div className="space-y-6">
        {/* Datos del profesional */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Datos del profesional</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={config.nombre}
                  onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  value={config.telefono}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                <input
                  type="text"
                  value={config.especialidad}
                  onChange={(e) => setConfig({ ...config, especialidad: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Horarios</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duración de sesión</label>
                <select
                  value={config.duracionSesion}
                  onChange={(e) => setConfig({ ...config, duracionSesion: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={50}>50 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inicio</label>
                <input
                  type="time"
                  value={config.horarioInicio}
                  onChange={(e) => setConfig({ ...config, horarioInicio: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fin</label>
                <input
                  type="time"
                  value={config.horarioFin}
                  onChange={(e) => setConfig({ ...config, horarioFin: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Días laborables</label>
              <div className="flex gap-2">
                {dias.map((dia) => (
                  <button
                    key={dia.valor}
                    onClick={() => toggleDia(dia.valor)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      config.diasLaborables.includes(dia.valor)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {dia.nombre.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Integraciones */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Integraciones</h2>
          </div>
          <div className="divide-y">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900">Google Calendar</p>
                <p className="text-sm text-gray-500">Sincronización de turnos</p>
              </div>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium ${
                config.googleCalendarConectado
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                {config.googleCalendarConectado ? 'Conectado' : 'Conectar'}
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900">WhatsApp (Twilio)</p>
                <p className="text-sm text-gray-500">Mensajes de pacientes</p>
              </div>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium ${
                config.twilioConectado
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                {config.twilioConectado ? 'Conectado' : 'Conectar'}
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900">MercadoPago</p>
                <p className="text-sm text-gray-500">Cobro de señas</p>
              </div>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium ${
                config.mercadoPagoConectado
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                {config.mercadoPagoConectado ? 'Conectado' : 'Conectar'}
              </button>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Recordatorios automáticos</p>
                <p className="text-sm text-gray-500">Enviar recordatorio antes del turno</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, recordatorios: !config.recordatorios })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  config.recordatorios ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  config.recordatorios ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            {config.recordatorios && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Enviar con</label>
                <select
                  value={config.recordatorioHoras}
                  onChange={(e) => setConfig({ ...config, recordatorioHoras: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={12}>12 horas antes</option>
                  <option value={24}>24 horas antes</option>
                  <option value={48}>48 horas antes</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end">
          <button className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}