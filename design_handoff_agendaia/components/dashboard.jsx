/* global React, Icon, Avatar, Badge, TopBar */
const { useState: useStateD } = React;

const SAMPLE_ACTIVITY = [
  { id: 1, time: "hace 4 min", type: "booked", patient: "Mariana Costa", desc: "Reservó turno · Mar 5/5 · 16:00", confidence: 96, action: null },
  { id: 2, time: "hace 18 min", type: "paid", patient: "Tomás Ibáñez", desc: "Pagó seña $8.000 · MercadoPago", confidence: null, action: null },
  { id: 3, time: "hace 32 min", type: "needs-review", patient: "Sofía Pérez", desc: "Pidió descuento por jubilada — espero tu respuesta", confidence: 62, action: "review" },
  { id: 4, time: "hace 1 h", type: "rescheduled", patient: "Diego Romero", desc: "Reagendó turno · Jue 7/5 · 11:00", confidence: 91, action: null },
  { id: 5, time: "hace 2 h", type: "reminder", patient: "Camila Ruiz", desc: "Envió recordatorio 24h previo", confidence: null, action: null },
  { id: 6, time: "hace 3 h", type: "info", patient: "Julián Vega", desc: "Respondió consulta sobre obra social", confidence: 88, action: null },
];

const TodayList = [
  { time: "10:00", patient: "Florencia Méndez", kind: "Sesión individual", status: "confirmado", first: false },
  { time: "11:00", patient: "Tomás Ibáñez", kind: "Primera consulta", status: "seña pagada", first: true },
  { time: "13:00", patient: "—", kind: "Almuerzo", status: "bloqueado", first: false },
  { time: "15:00", patient: "Mariana Costa", kind: "Sesión individual", status: "confirmado", first: false },
  { time: "16:00", patient: "Camila Ruiz", kind: "Sesión individual", status: "pendiente confirmar", first: false },
  { time: "17:00", patient: "Diego Romero", kind: "Sesión individual", status: "confirmado", first: false },
];

const Dashboard = ({ showReasoning = true }) => {
  const [filter, setFilter] = useStateD("todo");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar
        title="Buen día, Lucía"
        subtitle="Martes 5 de mayo · Tu agente atendió 14 conversaciones desde anoche"
        right={
          <>
            <button className="btn btn-sm"><Icon name="search" size={14} /> Buscar</button>
            <button className="btn btn-sm"><Icon name="bell" size={14} /></button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> Nuevo turno</button>
          </>
        }
      />

      <div className="scroll-styled" style={{ flex: 1, overflow: "auto", padding: "20px 32px 32px" }}>
        {/* Metric strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          <MetricCard label="Turnos esta semana" value="23" delta="+4 vs semana pasada" trend="up" sub="9 confirmados · 14 reservados" />
          <MetricCard label="Señas cobradas" value="$184.000" delta="+12%" trend="up" sub="Mayo · 23 pagos" />
          <MetricCard label="Tasa de no-show" value="6%" delta="−3 pts" trend="up" sub="Promedio 30 días" />
          <MetricCard label="Tiempo ahorrado" value="11 h" delta="este mes" trend="neutral" sub="vs. gestión manual" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          {/* Activity feed */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 className="h3">Lo que hizo tu agente</h3>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>Últimas 24 horas · {SAMPLE_ACTIVITY.length} acciones</div>
              </div>
              <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg-2)", borderRadius: 10 }}>
                {[
                  { id: "todo", label: "Todo" },
                  { id: "review", label: "Revisar", n: 1 },
                  { id: "auto", label: "Automático" },
                ].map(t => (
                  <button key={t.id} onClick={() => setFilter(t.id)}
                    style={{
                      border: "none", background: filter === t.id ? "var(--surface-2)" : "transparent",
                      padding: "5px 11px", borderRadius: 7, fontSize: 12.5, fontWeight: 500,
                      color: filter === t.id ? "var(--ink)" : "var(--ink-2)",
                      boxShadow: filter === t.id ? "var(--shadow-sm)" : "none",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                    {t.label}
                    {t.n && <span style={{ background: "var(--terracotta)", color: "white", fontSize: 10, padding: "0 5px", borderRadius: 999 }}>{t.n}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {SAMPLE_ACTIVITY.map(a => (
                <ActivityRow key={a.id} item={a} showReasoning={showReasoning} />
              ))}
            </div>
          </div>

          {/* Today schedule + quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 className="h3">Agenda de hoy</h3>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>6 turnos · próximo en 47 min</div>
                </div>
                <button className="btn btn-ghost btn-sm"><Icon name="calendar" size={14} /></button>
              </div>
              <div>
                {TodayList.map((t, i) => <TodayRow key={i} {...t} />)}
              </div>
            </div>

            <div className="card" style={{ padding: 16, background: "linear-gradient(180deg, var(--surface) 0%, var(--bg-2) 100%)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--terracotta)", flexShrink: 0, border: "1px solid var(--line)" }}>
                  <Icon name="sparkles" size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)", marginBottom: 3 }}>Sugerencia del agente</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                    Tenés <b>3 turnos sin confirmar</b> para mañana. ¿Mando recordatorio temprano para reducir no-show?
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                    <button className="btn btn-sm btn-primary">Mandar a las 9:00</button>
                    <button className="btn btn-sm btn-ghost">Después</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, delta, trend, sub }) => (
  <div className="card" style={{ padding: 16 }}>
    <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
    <div className="metric-number" style={{ marginBottom: 4 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      {trend === "up" && <span className="delta-up" style={{ fontWeight: 500 }}>↑ {delta}</span>}
      {trend === "down" && <span className="delta-down" style={{ fontWeight: 500 }}>↓ {delta}</span>}
      {trend === "neutral" && <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>{delta}</span>}
    </div>
    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>
  </div>
);

const ActivityRow = ({ item, showReasoning }) => {
  const iconMap = {
    booked: { icon: "calCheck", color: "var(--sage)" },
    paid: { icon: "wallet", color: "var(--olive)" },
    "needs-review": { icon: "flag", color: "var(--terracotta)" },
    rescheduled: { icon: "refresh", color: "var(--ink-3)" },
    reminder: { icon: "bell", color: "var(--ink-3)" },
    info: { icon: "chat", color: "var(--ink-3)" },
  };
  const { icon, color } = iconMap[item.type] || iconMap.info;
  return (
    <div className="row-hover" style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--line)", alignItems: "flex-start" }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        <Icon name={icon} size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{item.patient}</span>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>· {item.time}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.4 }}>{item.desc}</div>
        {showReasoning && item.confidence != null && (
          <div className="ai-thinking" style={{ marginTop: 8 }}>
            <Icon name="sparkles" size={10} />
            confianza {item.confidence}% · {item.confidence > 80 ? "ejecutado solo" : "requiere revisión"}
          </div>
        )}
      </div>
      {item.action === "review" && (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-sm">Ver</button>
          <button className="btn btn-sm btn-primary">Responder</button>
        </div>
      )}
    </div>
  );
};

const TodayRow = ({ time, patient, kind, status, first }) => {
  const statusKind = status === "seña pagada" ? "success" : status === "confirmado" ? "default" : status === "pendiente confirmar" ? "warn" : "info";
  return (
    <div className="row-hover" style={{ display: "flex", gap: 14, padding: "10px 18px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
      <div className="tabular" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink-2)", width: 44 }}>{time}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 450 }}>
          {patient}
          {first && <span className="badge badge-info" style={{ fontSize: 10 }}>nuevo</span>}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{kind}</div>
      </div>
      <Badge kind={statusKind}>{status}</Badge>
    </div>
  );
};

Object.assign(window, { Dashboard });
