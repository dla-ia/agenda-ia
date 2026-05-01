/* global React, Icon, Avatar, Badge, TopBar */
const { useState: useStateConv, useEffect: useEffectConv, useRef: useRefConv } = React;

// Inbox / Conversaciones — vista del psicólogo monitoreando lo que hace su agente

const CONVOS = [
  { id: 1, name: "Mariana Costa", last: "🔗 link de seña enviado", time: "14:36", unread: 0, status: "agent", preview: "Acaba de reservar primera consulta · esperando pago" },
  { id: 2, name: "Sofía Pérez", last: "Pidió tarifa de jubilada", time: "13:14", unread: 1, status: "review", preview: "Esperando tu decisión sobre descuento" },
  { id: 3, name: "Tomás Ibáñez", last: "✓ Pagó seña $8.000", time: "12:48", unread: 0, status: "agent", preview: "Turno confirmado para mañana 11:00" },
  { id: 4, name: "Diego Romero", last: "Reagendó al jueves 11:00", time: "11:32", unread: 0, status: "agent" },
  { id: 5, name: "Camila Ruiz", last: "Confirmó turno por recordatorio", time: "ayer", unread: 0, status: "agent" },
  { id: 6, name: "Julián Vega", last: "¿Atendés OSDE?", time: "ayer", unread: 0, status: "agent" },
  { id: 7, name: "Florencia Méndez", last: "Genial, nos vemos!", time: "lun", unread: 0, status: "agent" },
];

const ConversacionesView = () => {
  const [sel, setSel] = useStateConv(1); // Sofía con caso de revisión
  const c = CONVOS[sel];
  const isReview = c.status === "review";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar
        title="Conversaciones"
        subtitle="Lo que está pasando en WhatsApp · 1 caso necesita tu decisión"
        right={<>
          <button className="btn btn-sm"><Icon name="search" size={14} /> Buscar</button>
          <Badge kind="ai" dot>agente al mando</Badge>
        </>}
      />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr 300px", overflow: "hidden" }}>
        {/* List */}
        <div className="scroll-styled" style={{ borderRight: "1px solid var(--line)", overflow: "auto", background: "var(--bg)" }}>
          <div style={{ padding: "10px 14px", display: "flex", gap: 6 }}>
            <button className="btn btn-sm" style={{ flex: 1, background: "var(--surface-2)" }}>Todas</button>
            <button className="btn btn-sm btn-ghost" style={{ flex: 1 }}>Revisar (1)</button>
          </div>
          {CONVOS.map((co, i) => (
            <div key={co.id} onClick={() => setSel(i)} style={{
              padding: "12px 16px", display: "flex", gap: 11, alignItems: "center",
              borderBottom: "1px solid var(--line)",
              background: sel === i ? "var(--surface)" : "transparent",
              borderLeft: sel === i ? "3px solid var(--terracotta)" : "3px solid transparent",
              cursor: "pointer",
            }}>
              <Avatar name={co.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 450 }}>{co.name}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{co.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  {co.status === "review" && <span className="badge-dot" style={{ background: "var(--terracotta)" }} />}
                  <span style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{co.last}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--chat-bg)" }}>
          <div style={{ padding: "10px 16px", background: "#F0EAE0", borderBottom: "1px solid #D9CDB8", display: "flex", alignItems: "center", gap: 11 }}>
            <Avatar name={c.name} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: "#7A6B5A", display: "flex", alignItems: "center", gap: 5 }}>
                <span className="badge-dot" style={{ background: "var(--sage)", width: 5, height: 5 }} />
                {isReview ? "agente esperando tu decisión" : "atendiendo automáticamente"}
              </div>
            </div>
            <button className="btn btn-sm">Tomar control</button>
          </div>

          <div className="scroll-styled" style={{ flex: 1, overflow: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6, background: "var(--chat-bg)" }}>
            <div style={{ alignSelf: "center", background: "rgba(255,255,255,0.7)", padding: "3px 11px", borderRadius: 8, fontSize: 11, color: "#5A4E42" }}>HOY</div>

            {isReview ? <>
              <Bub side="in" t="13:08">Hola! Soy Sofía, jubilada. Hace tiempo quiero retomar terapia.</Bub>
              <Bub side="out" t="13:08">Hola Sofía, qué bueno que escribís 🌱 Soy Aurora, asistente de la Lic. Lucía Fernández. ¿Es tu primera vez con ella?</Bub>
              <Bub side="in" t="13:11">Sí, primera vez. Quería consultar si tienen tarifa diferencial para jubilados.</Bub>
              <Bub side="out" t="13:14">Te entiendo. Voy a consultarle a Lucía si puede ofrecerte tarifa social y te confirmo en un ratito 🌿</Bub>
              <div style={{ alignSelf: "center", marginTop: 10 }}>
                <span className="ai-thinking"><Icon name="flag" size={10} /> El agente pausó la conversación · pedido de descuento</span>
              </div>
            </> : <>
              <Bub side="in" t="14:32">Hola! Quiero empezar terapia 🌿</Bub>
              <Bub side="out" t="14:32">Hola, qué lindo que te animes. Soy Aurora, asistente de Lucía. ¿Cómo te llamás?</Bub>
              <Bub side="in" t="14:33">Mariana, primera vez</Bub>
              <Bub side="out" t="14:34">Encantada Mariana. Tengo estos espacios:{"\n\n"}• Mar 5/5 — 16:00{"\n"}• Mié 6/5 — 11:00{"\n"}• Jue 7/5 — 18:30</Bub>
              <Bub side="in" t="14:36">Martes 16hs me viene perfecto</Bub>
              <Bub side="out" t="14:36">Listo, te reservé el martes 5/5 a las 16:00. Acá va el link de la seña 👇</Bub>
              <Bub side="out" t="14:36" link>🔗 mpago.la/seña-mariana</Bub>
            </>}
          </div>

          {isReview && (
            <div style={{ padding: 12, background: "var(--bg-2)", borderTop: "1px solid var(--line)", display: "flex", gap: 10, alignItems: "center" }}>
              <Icon name="sparkles" size={16} style={{ color: "var(--terracotta)" }} />
              <span style={{ fontSize: 13, color: "var(--ink-2)", flex: 1 }}>Sugerencia del agente: ofrecer 25% off (sesiones a $11.250)</span>
              <button className="btn btn-sm">Rechazar</button>
              <button className="btn btn-sm btn-primary">Aprobar y responder</button>
            </div>
          )}
        </div>

        {/* Right panel — context */}
        <div className="scroll-styled" style={{ borderLeft: "1px solid var(--line)", overflow: "auto", padding: 20, background: "var(--bg)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
            <Avatar name={c.name} size="lg" />
            <div className="h3" style={{ marginTop: 10 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">+54 9 11 5982-1101</div>
          </div>
          <div className="eyebrow" style={{ margin: "16px 0 8px" }}>Resumen del caso</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, padding: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10 }}>
            Paciente nueva. Es jubilada y consulta por <b>tarifa diferencial</b>. El agente identificó que esto requiere tu decisión según las reglas configuradas.
          </div>

          <div className="eyebrow" style={{ margin: "16px 0 8px" }}>Razonamiento del agente</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Reason label="Intención" value="solicitar descuento" pct={94} />
            <Reason label="Sentimiento" value="esperanzada" pct={81} />
            <Reason label="Urgencia" value="baja" pct={72} />
            <Reason label="Riesgo" value="ninguno" pct={97} />
          </div>

          <div className="eyebrow" style={{ margin: "16px 0 8px" }}>Acciones disponibles</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn btn-sm" style={{ justifyContent: "flex-start" }}><Icon name="calendar" size={13} /> Reservar turno</button>
            <button className="btn btn-sm" style={{ justifyContent: "flex-start" }}><Icon name="wallet" size={13} /> Generar link de seña</button>
            <button className="btn btn-sm" style={{ justifyContent: "flex-start" }}><Icon name="phone" size={13} /> Llamar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Bub = ({ side, t, children, link }) => (
  <div className={`chat-bubble chat-${side}`} style={{ whiteSpace: "pre-wrap", ...(link ? { background: "#F5F0DC", fontFamily: "var(--font-mono)", fontSize: 13 } : {}) }}>
    {children}
    <span className="chat-meta">
      <span className="chat-time">{t}</span>
      {side === "out" && <span style={{ color: "#53BDEB", marginLeft: 2 }}>✓✓</span>}
    </span>
  </div>
);

const Reason = ({ label, value, pct }) => (
  <div style={{ padding: "8px 10px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
      <span style={{ color: "var(--ink-3)" }}>{label}</span>
      <span className="mono" style={{ color: "var(--ink-3)" }}>{pct}%</span>
    </div>
    <div style={{ fontSize: 13, fontWeight: 500 }}>{value}</div>
    <div style={{ marginTop: 4, height: 3, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "var(--terracotta)" }} />
    </div>
  </div>
);

Object.assign(window, { ConversacionesView });
