/* global React, Icon, Avatar, Badge, TopBar */
const { useState: useStateP } = React;

const PATIENTS = [
  { name: "Mariana Costa", phone: "+54 9 11 5089-2341", since: "May 2026", sessions: 1, next: "Mar 5/5 · 16:00", status: "primera", last: "Pidió primera consulta", lastTime: "hace 4 min" },
  { name: "Tomás Ibáñez", phone: "+54 9 11 4422-7890", since: "May 2026", sessions: 1, next: "Mar 5/5 · 11:00", status: "active", last: "Pagó seña $8.000", lastTime: "hace 18 min" },
  { name: "Sofía Pérez", phone: "+54 9 11 5982-1101", since: "Ene 2026", sessions: 18, next: "Mié 6/5 · 16:00", status: "review", last: "Pidió tarifa de jubilada", lastTime: "hace 32 min" },
  { name: "Diego Romero", phone: "+54 9 11 3344-9921", since: "Mar 2025", sessions: 47, next: "Jue 7/5 · 11:00", status: "active", last: "Reagendó turno", lastTime: "hace 1 h" },
  { name: "Florencia Méndez", phone: "+54 9 11 6711-2245", since: "Feb 2026", sessions: 14, next: "Mar 5/5 · 10:00", status: "active", last: "Confirmó turno", lastTime: "hace 3 h" },
  { name: "Camila Ruiz", phone: "+54 9 11 5567-3318", since: "Sep 2025", sessions: 23, next: "Mar 5/5 · 16:00", status: "active", last: "Recordatorio enviado", lastTime: "ayer" },
  { name: "Julián Vega", phone: "+54 9 11 2211-5544", since: "Nov 2025", sessions: 12, next: "—", status: "pause", last: "Consulta sobre obra social", lastTime: "ayer" },
];

const PacientesView = () => {
  const [sel, setSel] = useStateP(2);
  const p = PATIENTS[sel];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar
        title="Pacientes"
        subtitle={`${PATIENTS.length} activos · 2 nuevos este mes`}
        right={<>
          <button className="btn btn-sm"><Icon name="search" size={14} /> Buscar</button>
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> Agregar</button>
        </>}
      />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr", overflow: "hidden" }}>
        <div className="scroll-styled" style={{ borderRight: "1px solid var(--line)", overflow: "auto", background: "var(--bg)" }}>
          {PATIENTS.map((pt, i) => (
            <div key={i} onClick={() => setSel(i)} className="row-hover" style={{
              padding: "12px 18px", display: "flex", gap: 11, alignItems: "center",
              borderBottom: "1px solid var(--line)",
              background: sel === i ? "var(--surface)" : "transparent",
              borderLeft: sel === i ? "3px solid var(--terracotta)" : "3px solid transparent",
              cursor: "pointer",
            }}>
              <Avatar name={pt.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 450, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pt.name}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", flexShrink: 0 }}>{pt.lastTime}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {pt.status === "review" && <span className="badge-dot" style={{ background: "var(--terracotta)", flexShrink: 0 }} />}
                  {pt.status === "primera" && <span className="badge-dot" style={{ background: "var(--olive)", flexShrink: 0 }} />}
                  <span style={{ fontSize: 11.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pt.last}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="scroll-styled" style={{ overflow: "auto", padding: 28 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 22 }}>
            <Avatar name={p.name} size="lg" />
            <div style={{ flex: 1 }}>
              <h2 className="h2" style={{ marginBottom: 4 }}>{p.name}</h2>
              <div style={{ fontSize: 13, color: "var(--ink-3)" }}><span className="mono">{p.phone}</span> · paciente desde {p.since} · {p.sessions} {p.sessions === 1 ? "sesión" : "sesiones"}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm"><Icon name="chat" size={13} /> WhatsApp</button>
              <button className="btn btn-primary btn-sm"><Icon name="calendar" size={13} /> Reservar</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
            <MiniStat label="Próximo turno" value={p.next} />
            <MiniStat label="Sesiones totales" value={p.sessions.toString()} />
            <MiniStat label="Asistencia" value="94%" />
            <MiniStat label="Pagos al día" value="✓" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="h3" style={{ fontSize: 16 }}>Conversación reciente</h3>
                <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>respondida por agente</span>
              </div>
              <div style={{ background: "var(--chat-bg)", padding: 14, display: "flex", flexDirection: "column", gap: 6, minHeight: 220 }}>
                <div className="chat-bubble chat-in">Hola, soy jubilada y quería consultar si tienen tarifa diferencial</div>
                <div className="chat-bubble chat-out">Hola, gracias por escribir. Voy a consultarle a Lucía si puede ofrecerte una tarifa social y te respondo en un rato 🌿
                  <span className="chat-meta"><span className="chat-time">10:43</span><span style={{ color: "#53BDEB", marginLeft: 2 }}>✓✓</span></span>
                </div>
                <div style={{ alignSelf: "center", marginTop: 4 }}>
                  <span className="ai-thinking"><Icon name="flag" size={10} /> agente esperando tu decisión</span>
                </div>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", gap: 8, borderTop: "1px solid var(--line)" }}>
                <button className="btn btn-sm" style={{ flex: 1 }}>Rechazar</button>
                <button className="btn btn-sm" style={{ flex: 1, background: "var(--olive)", color: "#FAF6EE", borderColor: "#5A6034" }}>Aprobar 30% off</button>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
                <h3 className="h3" style={{ fontSize: 16 }}>Historial</h3>
              </div>
              <div>
                {[
                  { date: "Mar 5/5", txt: "Turno reservado 16:00", icon: "calendar" },
                  { date: "Lun 28/4", txt: "Sesión completada · seña $6.000", icon: "check" },
                  { date: "Mié 23/4", txt: "Reagendó por motivos laborales", icon: "refresh" },
                  { date: "Lun 21/4", txt: "Sesión completada", icon: "check" },
                  { date: "Lun 14/4", txt: "Sesión completada", icon: "check" },
                  { date: "Lun 7/4", txt: "Sesión completada", icon: "check" },
                ].map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, padding: "10px 18px", borderBottom: i < 5 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 60 }}>{h.date}</span>
                    <Icon name={h.icon} size={13} style={{ color: "var(--ink-3)" }} />
                    <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{h.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 18, marginTop: 18 }}>
            <h3 className="h3" style={{ fontSize: 16, marginBottom: 10 }}>Notas privadas</h3>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, padding: 14, background: "var(--bg-2)", borderRadius: 10, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              Ansiedad generalizada · disparadores laborales. Avanza en exposición gradual. Próxima sesión: revisar tareas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="card" style={{ padding: 14 }}>
    <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
    <div className="serif" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>{value}</div>
  </div>
);

Object.assign(window, { PacientesView });
