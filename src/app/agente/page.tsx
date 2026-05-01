export default function AgentePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <p className="eyebrow mb-1">Configuración</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0 }}>
          Agente IA
        </h1>
      </div>
      <div className="card flex items-center justify-center" style={{ height: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink-2)', margin: '0 0 6px' }}>
            Configuración de Aurora
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            Personalidad · Reglas · Precios · Integraciones — próximamente
          </p>
        </div>
      </div>
    </div>
  );
}
