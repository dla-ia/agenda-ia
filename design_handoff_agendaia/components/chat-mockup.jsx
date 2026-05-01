/* global React, Icon, Avatar, Badge */
const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

// WhatsApp mockup en iPhone — la vista del paciente

const SCRIPTS = {
  warm: [
    { from: "in", t: "14:32", text: "Hola! Una amiga me pasó tu contacto. Estoy buscando empezar terapia 🌿" },
    { from: "out", t: "14:32", text: "Hola, qué lindo que te animes a dar este paso 🌱 Soy Aurora, asistente de la Lic. Lucía Fernández. ¿Cómo te llamás?" },
    { from: "in", t: "14:33", text: "Soy Mariana, tengo 28" },
    { from: "out", t: "14:33", text: "Encantada, Mariana. ¿Es tu primera vez en terapia?" },
    { from: "in", t: "14:34", text: "Sí, primera vez" },
    { from: "out", t: "14:34", text: "Me alegra acompañarte 🌿 La primera consulta con Lucía dura 50 min y tiene un valor de $18.000. Para reservar pedimos una seña de $8.000 por MercadoPago. ¿Te muestro horarios?" },
    { from: "in", t: "14:35", text: "Dale" },
    { from: "out", t: "14:35", text: "Tengo estos espacios:\n\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30" },
    { from: "in", t: "14:36", text: "El martes 16hs me viene perfecto" },
    { from: "out", t: "14:36", text: "Listo Mariana, te reservé el martes 5/5 a las 16:00 🌱 Acá va el link de la seña 👇" },
    { from: "out", t: "14:36", text: "🔗 mpago.la/sena-mariana", link: true },
  ],
  direct: [
    { from: "in", t: "14:32", text: "Buenas, quiero sacar turno" },
    { from: "out", t: "14:32", text: "Hola. Soy Aurora, asistente de la Lic. Fernández. ¿Tu nombre y si es primera vez?" },
    { from: "in", t: "14:33", text: "Mariana, primera vez" },
    { from: "out", t: "14:33", text: "Primera consulta: 50 min · $18.000. Seña $8.000 por MP.\n\nDisponibles:\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30" },
    { from: "in", t: "14:34", text: "Martes 16" },
    { from: "out", t: "14:34", text: "Reservado: Mar 5/5 — 16:00. Link de seña abajo." },
    { from: "out", t: "14:34", text: "🔗 mpago.la/sena-mariana", link: true },
  ],
  casual: [
    { from: "in", t: "14:32", text: "Holaa, tenés lugar para empezar terapia?" },
    { from: "out", t: "14:32", text: "Hola! Soy Aurora 👋 Sí, hay lugar. ¿Cómo te llamás?" },
    { from: "in", t: "14:33", text: "Mariana, 28" },
    { from: "out", t: "14:33", text: "Bienvenida Mariana! ¿Primera vez en terapia?" },
    { from: "in", t: "14:34", text: "Primera vez" },
    { from: "out", t: "14:34", text: "Genial 🌟 La primera dura 50 min y sale $18.000. Para apartar el turno te pedimos $8.000 de seña por MP. Te mando los horarios?" },
    { from: "in", t: "14:35", text: "Dale" },
    { from: "out", t: "14:35", text: "Mirá:\n\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30\n\n¿Cuál preferís?" },
    { from: "in", t: "14:36", text: "Martes a las 4!" },
    { from: "out", t: "14:36", text: "Listo Mariana 🙌 Te reservé el martes 5/5 a las 16:00. Acá va el link 👇" },
    { from: "out", t: "14:36", text: "🔗 mpago.la/sena-mariana", link: true },
  ],
};

const ChatMockup = ({ tone = "warm", autoplay = true }) => {
  const script = SCRIPTS[tone] || SCRIPTS.warm;
  const [count, setCount] = useStateW(autoplay ? 2 : script.length);
  const [typing, setTyping] = useStateW(false);
  const [paused, setPaused] = useStateW(!autoplay);
  const scrollRef = useRefW(null);

  useEffectW(() => { setCount(autoplay ? 2 : script.length); setPaused(!autoplay); }, [tone]);

  useEffectW(() => {
    if (paused || count >= script.length) return;
    const next = script[count];
    const isAgent = next.from === "out";
    setTyping(isAgent);
    const t = setTimeout(() => {
      setTyping(false);
      setCount(c => c + 1);
    }, isAgent ? 1500 : 800);
    return () => clearTimeout(t);
  }, [count, paused, tone]);

  useEffectW(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [count, typing]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--chat-bg)", overflow: "hidden" }}>
      {/* WhatsApp header */}
      <div style={{ padding: "10px 14px 10px 6px", background: "#F0EAE0", borderBottom: "1px solid #D9CDB8", display: "flex", alignItems: "center", gap: 9 }}>
        <Icon name="chevron" size={20} style={{ transform: "rotate(180deg)", color: "#5A4E42" }} />
        <Avatar name="Lucía Fernández" size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1F1A14" }}>Lic. Lucía Fernández</div>
          <div style={{ fontSize: 11, color: "#7A6B5A" }}>en línea</div>
        </div>
        <Icon name="phone" size={18} style={{ color: "#5A4E42" }} />
        <Icon name="moreV" size={18} style={{ color: "#5A4E42" }} />
      </div>

      <div ref={scrollRef} className="chat-area scroll-styled" style={{ flex: 1, overflow: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ alignSelf: "center", background: "rgba(255,255,255,0.7)", padding: "3px 11px", borderRadius: 8, fontSize: 11, color: "#5A4E42", marginBottom: 6 }}>HOY</div>

        {script.slice(0, count).map((m, i) => (
          <div key={i} className={`chat-bubble chat-${m.from}`} style={{ whiteSpace: "pre-wrap", ...(m.link ? { background: "#F5F0DC", fontFamily: "var(--font-mono)", fontSize: 13 } : {}) }}>
            {m.text}
            <span className="chat-meta">
              <span className="chat-time">{m.t}</span>
              {m.from === "out" && <span style={{ color: "#53BDEB", marginLeft: 2 }}>✓✓</span>}
            </span>
          </div>
        ))}

        {typing && (
          <div className="chat-bubble chat-out" style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#7A6B5A", animation: "dot 1.2s 0ms infinite" }} />
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#7A6B5A", animation: "dot 1.2s 150ms infinite" }} />
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#7A6B5A", animation: "dot 1.2s 300ms infinite" }} />
          </div>
        )}
      </div>

      <div style={{ padding: "8px 10px", background: "#F0EAE0", display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #D9CDB8" }}>
        <Icon name="plus" size={20} style={{ color: "#5A4E42" }} />
        <div style={{ flex: 1, background: "#FFF", borderRadius: 20, padding: "8px 14px", fontSize: 13, color: "#9E8E7A" }}>Mensaje</div>
        <button onClick={() => { if (paused) { setCount(0); setPaused(false); } else setPaused(true); }}
          style={{ background: "var(--terracotta)", border: "none", width: 34, height: 34, borderRadius: 999, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name={paused ? "play" : "pause"} size={13} />
        </button>
      </div>
    </div>
  );
};

if (typeof document !== "undefined" && !document.getElementById("chat-kf")) {
  const s = document.createElement("style");
  s.id = "chat-kf";
  s.textContent = `@keyframes dot { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-3px); opacity: 1; } }`;
  document.head.appendChild(s);
}

Object.assign(window, { ChatMockup });
