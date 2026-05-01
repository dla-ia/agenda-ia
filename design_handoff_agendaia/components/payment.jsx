/* global React, ChatMockup */
const { useState: useStateMP, useEffect: useEffectMP } = React;

// MercadoPago-ish payment screen (genérico, no pixel-copy)
const PaymentScreen = () => {
  const [paid, setPaid] = useStateMP(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F4F4F8", overflow: "hidden" }}>
      <div style={{ background: "#1F2C5C", color: "white", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 999, background: "#FFE600", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#1F2C5C" }}>$</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Pagar con MercadoPago</div>
      </div>

      <div className="scroll-styled" style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 11, color: "#737373", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Estás pagando</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2C5C", marginBottom: 4 }}>Seña · Primera consulta con Lic. Lucía Fernández</div>
          <div style={{ fontSize: 12, color: "#737373", marginBottom: 14 }}>Mar 5/5 · 16:00 · 50 minutos</div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #E5E5E5" }}>
            <span style={{ fontSize: 13, color: "#525252" }}>Total a pagar</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "#1F2C5C" }}>$8.000</span>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#1F2C5C" }}>Método de pago</div>
          {[
            { label: "Dinero en cuenta", sub: "$45.230 disponibles", on: true },
            { label: "Tarjeta de débito Visa", sub: "•••• 4521", on: false },
            { label: "Tarjeta de crédito", sub: "Hasta 6 cuotas", on: false },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 2 ? "1px solid #EEE" : "none" }}>
              <div style={{ width: 16, height: 16, borderRadius: 999, border: m.on ? "5px solid #009EE3" : "1.5px solid #C4C4C4" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#262626" }}>{m.label}</div>
                <div style={{ fontSize: 11.5, color: "#737373" }}>{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {paid ? (
          <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 12, padding: 18, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: "#4CAF50", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24 }}>✓</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1B5E20", marginBottom: 4 }}>¡Pago realizado!</div>
            <div style={{ fontSize: 12, color: "#2E7D32" }}>Te llegará la confirmación a WhatsApp</div>
          </div>
        ) : (
          <button onClick={() => setPaid(true)} style={{
            width: "100%", padding: "13px 16px", background: "#009EE3", color: "white",
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Pagar $8.000</button>
        )}

        <div style={{ fontSize: 10.5, color: "#9CA3AF", textAlign: "center", marginTop: 14, lineHeight: 1.45 }}>
          Pago seguro con cifrado de extremo a extremo<br />Operación protegida por MercadoPago
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PaymentScreen });
