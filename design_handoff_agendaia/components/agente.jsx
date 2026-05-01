/* global React, Icon, Avatar, Badge, TopBar */
const { useState: useStateAg } = React;

const AgenteConfig = () => {
  const [tab, setTab] = useStateAg("personalidad");
  const tabs = [
    { id: "personalidad", label: "Personalidad" },
    { id: "agenda", label: "Reglas de agenda" },
    { id: "precios", label: "Precios y pagos" },
    { id: "integraciones", label: "Integraciones" },
    { id: "limites", label: "Cuándo derivarme" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar
        title="Agente IA"
        subtitle="Configurá cómo conversa, qué puede hacer solo y cuándo te avisa"
        right={<>
          <Badge kind="success" dot>Activo en WhatsApp</Badge>
          <button className="btn btn-sm">Vista previa</button>
          <button className="btn btn-primary btn-sm">Guardar</button>
        </>}
      />
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", padding: "0 32px", background: "var(--bg)", gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 14px", border: "none", background: "transparent",
            fontSize: 13.5, fontWeight: 500, cursor: "pointer",
            color: tab === t.id ? "var(--ink)" : "var(--ink-3)",
            borderBottom: tab === t.id ? "2px solid var(--terracotta)" : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>
      <div className="scroll-styled" style={{ flex: 1, overflow: "auto", padding: "24px 32px 32px" }}>
        {tab === "personalidad" && <Personalidad />}
        {tab === "agenda" && <ReglasAgenda />}
        {tab === "precios" && <Precios />}
        {tab === "integraciones" && <Integraciones />}
        {tab === "limites" && <Limites />}
      </div>
    </div>
  );
};

const Personalidad = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22 }}>
    <div className="card" style={{ padding: 22 }}>
      <h3 className="h3" style={{ marginBottom: 4 }}>Cómo se presenta tu agente</h3>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 18 }}>Pequeños ajustes cambian mucho el tono.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label className="field">
          <span>Nombre del asistente</span>
          <input className="input" defaultValue="Aurora" />
        </label>
        <div className="field">
          <span>Tono de conversación</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 4 }}>
            {[
              { id: "warm", label: "Cálido", desc: "Empático, suave" },
              { id: "direct", label: "Directo", desc: "Eficiente, claro" },
              { id: "casual", label: "Casual", desc: "Cercano, amable" },
            ].map((opt, i) => (
              <button key={opt.id} className="card" style={{
                padding: 12, textAlign: "left", cursor: "pointer",
                borderColor: i === 0 ? "var(--terracotta)" : "var(--line)",
                boxShadow: i === 0 ? "0 0 0 3px rgba(194, 106, 74, 0.12)" : "none",
                background: i === 0 ? "rgba(194, 106, 74, 0.04)" : "var(--surface-2)",
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Saludo inicial</span>
          <textarea className="input" rows={3} style={{ resize: "vertical", fontFamily: "inherit" }} defaultValue="Hola, qué lindo que te animes a dar este paso 🌱 Soy Aurora, la asistente de la Lic. Lucía Fernández. ¿Cómo te llamás?" />
        </label>
        <label className="field">
          <span>Frase de cierre</span>
          <input className="input" defaultValue="Cualquier duda, estoy por acá. Te espero el martes 🌿" />
        </label>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Cómo te ven los pacientes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="chat-bubble chat-out" style={{ maxWidth: "100%", whiteSpace: "pre-wrap" }}>
            Hola, qué lindo que te animes a dar este paso 🌱 Soy Aurora, la asistente de la Lic. Lucía Fernández. ¿Cómo te llamás?
            <span className="chat-meta"><span className="chat-time">14:32</span><span style={{ color: "#53BDEB", marginLeft: 2 }}>✓✓</span></span>
          </div>
          <div className="chat-bubble chat-out" style={{ maxWidth: "100%", whiteSpace: "pre-wrap" }}>
            Tengo estos espacios:{"\n\n"}• Mar 5/5 — 16:00{"\n"}• Mié 6/5 — 11:00{"\n"}• Jue 7/5 — 18:30
            <span className="chat-meta"><span className="chat-time">14:35</span><span style={{ color: "#53BDEB", marginLeft: 2 }}>✓✓</span></span>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <h3 className="h3" style={{ fontSize: 16, marginBottom: 10 }}>Frases que evita</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["diagnósticos", "pronósticos", "consejos médicos", "promesas de resultado"].map(t => (
            <span key={t} className="tag">{t} <Icon name="x" size={10} /></span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ToggleCard = ({ title, desc, on }) => {
  const [v, setV] = useStateAg(on);
  return (
    <div className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45 }}>{desc}</div>
      </div>
      <div onClick={() => setV(!v)} style={{
        width: 36, height: 20, borderRadius: 999, background: v ? "var(--terracotta)" : "var(--bg-3)",
        position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s",
      }}>
        <div style={{
          position: "absolute", top: 2, left: v ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%", background: "#FFF8F0",
          transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }} />
      </div>
    </div>
  );
};

const ReglasAgenda = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
    <div className="card" style={{ padding: 22 }}>
      <h3 className="h3" style={{ marginBottom: 14 }}>Disponibilidad</h3>
      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((d, i) => (
        <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--line)" : "none" }}>
          <div style={{ fontSize: 13.5, fontWeight: 450 }}>{d}</div>
          <div className="mono" style={{ fontSize: 13, color: "var(--ink-2)" }}>09:00 – 19:00</div>
          <button className="btn btn-ghost btn-sm">Editar</button>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ToggleCard title="Reagenda automática" desc="Mueve turnos sin preguntar si hay disponibilidad la misma semana" on={true} />
      <ToggleCard title="Confirma 24h antes" desc="Manda recordatorio y libera el turno si no responden" on={true} />
      <ToggleCard title="Lista de espera" desc="Si liberás un turno, lo ofrece a quienes esperan" on={false} />
      <ToggleCard title="Buffer entre sesiones" desc="Deja 10 minutos automáticamente entre turnos" on={true} />
    </div>
  </div>
);

const Precios = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
    <div className="card" style={{ padding: 22 }}>
      <h3 className="h3" style={{ marginBottom: 14 }}>Tarifas</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PriceRowC label="Primera consulta" price="18.000" duration="50 min" />
        <PriceRowC label="Sesión individual" price="15.000" duration="50 min" />
        <PriceRowC label="Sesión de pareja" price="22.000" duration="60 min" />
        <button className="btn btn-sm" style={{ alignSelf: "flex-start", marginTop: 6 }}><Icon name="plus" size={12} /> Agregar tarifa</button>
      </div>
    </div>
    <div className="card" style={{ padding: 22 }}>
      <h3 className="h3" style={{ marginBottom: 14 }}>Cobro de seña</h3>
      <label className="field" style={{ marginBottom: 14 }}>
        <span>Monto de seña</span>
        <input className="input" defaultValue="$ 8.000" />
      </label>
      <label className="field" style={{ marginBottom: 14 }}>
        <span>Vencimiento del link</span>
        <input className="input" defaultValue="2 horas" />
      </label>
      <ToggleCard title="Sin pago, sin reserva" desc="Libera el turno si no se pagó la seña antes del vencimiento" on={true} />
    </div>
  </div>
);

const PriceRowC = ({ label, price, duration }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface-2)" }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{duration}</div>
    </div>
    <div className="serif tabular" style={{ fontSize: 18, fontWeight: 500 }}>${price}</div>
    <button className="btn btn-ghost btn-sm"><Icon name="moreV" size={14} /></button>
  </div>
);

const Integraciones = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
    <IntegCard name="WhatsApp Business" desc="Mensajes vía Twilio · número +54 9 11 5847-2210" icon="phone" />
    <IntegCard name="Google Calendar" desc="Sincronización bidireccional · lucia@gmail.com" icon="calendar" />
    <IntegCard name="MercadoPago" desc="Cobro de señas · cuenta verificada" icon="wallet" />
    <IntegCard name="Resend" desc="Confirmaciones y recordatorios por email" icon="inbox" />
  </div>
);

const IntegCard = ({ name, desc, icon }) => (
  <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
    <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg-2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)", flexShrink: 0 }}>
      <Icon name={icon} size={17} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
        <Badge kind="success" dot>conectado</Badge>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45 }}>{desc}</div>
    </div>
    <button className="btn btn-ghost btn-sm">Configurar</button>
  </div>
);

const Limites = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
    <div className="card" style={{ padding: 22 }}>
      <h3 className="h3" style={{ marginBottom: 6 }}>Cuándo te paso la conversación</h3>
      <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.5 }}>
        Tu agente es prudente. Ante estas señales deja de responder y te avisa para que tomes la posta.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <LimitRow icon="shield" label="Mención de crisis o autolesión" desc="Comparte línea de ayuda y te llama de inmediato" required />
        <LimitRow icon="flag" label="Pedidos de descuento o tarifa social" desc="Te consulta antes de aceptar" />
        <LimitRow icon="clock" label="Horarios fuera de lo configurado" desc="Te pregunta antes de bloquear" />
        <LimitRow icon="users" label="Consultas clínicas específicas" desc="Te deriva la pregunta sin responder" required />
      </div>
    </div>
    <div className="card" style={{ padding: 20, background: "linear-gradient(180deg, var(--surface) 0%, var(--bg-2) 100%)" }}>
      <div style={{ color: "var(--terracotta)", marginBottom: 8 }}><Icon name="shield" size={18} /></div>
      <h3 className="h3" style={{ fontSize: 16, marginBottom: 8 }}>Protocolo de crisis</h3>
      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 14 }}>
        Si detectamos riesgo, el agente envía la línea 135 (CABA) o 0800-345-1435, deja la conversación marcada y te notifica por SMS y email.
      </div>
      <button className="btn btn-sm">Editar protocolo</button>
    </div>
  </div>
);

const LimitRow = ({ icon, label, desc, required }) => (
  <div style={{ display: "flex", gap: 12, padding: 12, background: "var(--bg-2)", borderRadius: 10, alignItems: "flex-start" }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--surface-2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--terracotta)", flexShrink: 0 }}>
      <Icon name={icon} size={14} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 500 }}>
        {label}
        {required && <span className="badge badge-warn" style={{ fontSize: 10 }}>obligatorio</span>}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div>
    </div>
  </div>
);

Object.assign(window, { AgenteConfig });
