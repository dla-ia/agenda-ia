/* global React, Icon, Avatar, Badge, TopBar */
const { useState: useStateA } = React;

const HOURS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
const DAYS = ["Lun 4","Mar 5","Mié 6","Jue 7","Vie 8"];

const APPTS = [
  { day: 0, hour: "10:00", patient: "Joaquín M.", kind: "individual", status: "confirmed" },
  { day: 0, hour: "11:00", patient: "Pilar G.", kind: "individual", status: "confirmed" },
  { day: 0, hour: "15:00", patient: "Renata S.", kind: "individual", status: "confirmed" },
  { day: 0, hour: "17:00", patient: "Iván L.", kind: "individual", status: "confirmed" },
  { day: 1, hour: "10:00", patient: "Florencia M.", kind: "individual", status: "confirmed" },
  { day: 1, hour: "11:00", patient: "Tomás I.", kind: "primera", status: "paid" },
  { day: 1, hour: "15:00", patient: "Mariana C.", kind: "individual", status: "pending" },
  { day: 1, hour: "16:00", patient: "Camila R.", kind: "individual", status: "pending" },
  { day: 1, hour: "17:00", patient: "Diego R.", kind: "individual", status: "confirmed" },
  { day: 2, hour: "09:00", patient: "Luz A.", kind: "individual", status: "confirmed" },
  { day: 2, hour: "11:00", patient: "Bruno V.", kind: "primera", status: "paid" },
  { day: 2, hour: "16:00", patient: "Sofía P.", kind: "individual", status: "confirmed" },
  { day: 3, hour: "10:00", patient: "Martín O.", kind: "individual", status: "confirmed" },
  { day: 3, hour: "11:00", patient: "Diego R.", kind: "individual", status: "confirmed" },
  { day: 3, hour: "18:00", patient: "Antonia F.", kind: "individual", status: "confirmed" },
  { day: 4, hour: "10:00", patient: "Renata S.", kind: "individual", status: "confirmed" },
  { day: 4, hour: "11:00", patient: "Joaquín M.", kind: "individual", status: "confirmed" },
];

const BLOCKED = [{ day: 1, hour: "13:00", label: "Almuerzo" }, { day: 3, hour: "13:00", label: "Almuerzo" }];

const AgendaView = () => {
  const [selected, setSelected] = useStateA(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <TopBar
        title="Agenda"
        subtitle="Semana del 4 al 8 de mayo · 17 turnos · sincronizado con Google Calendar"
        right={
          <>
            <button className="btn btn-sm"><Icon name="google" size={14} /> Conectado</button>
            <button className="btn btn-sm"><Icon name="chevron" size={14} style={{ transform: "rotate(180deg)" }} /></button>
            <button className="btn btn-sm">Hoy</button>
            <button className="btn btn-sm"><Icon name="chevron" size={14} /></button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> Bloquear horario</button>
          </>
        }
      />
      <div className="scroll-styled" style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "60px repeat(5, 1fr)", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
            <div></div>
            {DAYS.map((d, i) => (
              <div key={i} style={{ padding: "12px 14px", borderLeft: "1px solid var(--line)", textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{d.split(" ")[0]}</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 2, color: i === 1 ? "var(--terracotta)" : "var(--ink)" }}>{d.split(" ")[1]}</div>
              </div>
            ))}
          </div>
          {/* Hours */}
          {HOURS.map(h => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "60px repeat(5, 1fr)", borderBottom: "1px solid var(--line)", minHeight: 56 }}>
              <div style={{ padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{h}</div>
              {DAYS.map((_, di) => {
                const a = APPTS.find(x => x.day === di && x.hour === h);
                const b = BLOCKED.find(x => x.day === di && x.hour === h);
                return (
                  <div key={di} style={{ borderLeft: "1px solid var(--line)", padding: 4, position: "relative" }}>
                    {a && <ApptCard appt={a} onClick={() => setSelected(a)} />}
                    {b && <BlockedCard label={b.label} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 12, color: "var(--ink-3)", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "#E8EFDC", border: "1px solid #CDD9B5" }} /> Confirmado
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "#F5E9CD", border: "1px solid #E5D2A0" }} /> Pendiente
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "#EFE0D2", border: "1px solid #D6C2B0" }} /> Seña pagada · primera consulta
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--bg-3)" }} /> Bloqueado
          </span>
        </div>
      </div>

      {selected && <ApptDetailModal appt={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const ApptCard = ({ appt, onClick }) => {
  const styles = {
    confirmed: { bg: "#E8EFDC", border: "#CDD9B5", text: "#4A5530" },
    pending: { bg: "#F5E9CD", border: "#E5D2A0", text: "#7A5C20" },
    paid: { bg: "#EFE0D2", border: "#D6C2B0", text: "#6B4A36" },
  }[appt.status];
  return (
    <button onClick={onClick} style={{
      width: "100%", height: "100%",
      background: styles.bg, border: `1px solid ${styles.border}`,
      borderRadius: 6, padding: "5px 7px", textAlign: "left",
      color: styles.text, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", gap: 1,
    }}>
      <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>{appt.patient}</div>
      <div style={{ fontSize: 10.5, opacity: 0.8 }}>{appt.kind === "primera" ? "1ª consulta" : "Sesión"}</div>
    </button>
  );
};

const BlockedCard = ({ label }) => (
  <div style={{ width: "100%", height: "100%", background: "var(--bg-3)", borderRadius: 6, padding: "5px 7px", display: "flex", alignItems: "center", color: "var(--ink-3)", fontSize: 11.5, fontStyle: "italic" }}>
    {label}
  </div>
);

const ApptDetailModal = ({ appt, onClose }) => (
  <div style={{ position: "absolute", inset: 0, background: "rgba(44, 36, 29, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={onClose}>
    <div className="card" style={{ width: 380, padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="h3">Detalle de turno</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar name={appt.patient} size="lg" />
          <div>
            <div className="h3">{appt.patient}</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{appt.kind === "primera" ? "Primera consulta" : "Sesión individual"}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 12px", fontSize: 13 }}>
          <span style={{ color: "var(--ink-3)" }}>Fecha</span><span>Martes 5 de mayo</span>
          <span style={{ color: "var(--ink-3)" }}>Hora</span><span className="mono">{appt.hour} – {(parseInt(appt.hour) + 1).toString().padStart(2,"0")}:00</span>
          <span style={{ color: "var(--ink-3)" }}>Modalidad</span><span>Presencial · Consultorio Palermo</span>
          <span style={{ color: "var(--ink-3)" }}>Pago</span><span>{appt.status === "paid" ? "Seña $8.000 ✓" : "Pendiente"}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button className="btn btn-sm" style={{ flex: 1 }}>Reagendar</button>
          <button className="btn btn-sm" style={{ flex: 1 }}>Ver chat</button>
          <button className="btn btn-sm btn-primary" style={{ flex: 1 }}>Confirmar</button>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { AgendaView });
