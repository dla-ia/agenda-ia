/* global React, Icon, Avatar, Badge */
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

// Three conversation scripts depending on tone
const SCRIPTS = {
  warm: [
    { from: "patient", text: "Hola! Una amiga me pasó tu contacto. Estoy buscando empezar terapia 🌿", time: "14:32" },
    { from: "agent", text: "Hola, qué lindo que te animes a dar este paso 🌱 Soy la asistente de la Lic. Lucía Fernández. ¿Cómo te llamás?", time: "14:32" },
    { from: "patient", text: "Soy Mariana, tengo 28", time: "14:33" },
    { from: "agent", text: "Encantada, Mariana. ¿Es tu primera vez en terapia o ya hiciste antes?", time: "14:33" },
    { from: "patient", text: "Es la primera vez", time: "14:34" },
    { from: "agent", text: "Me alegra acompañarte. Lucía tiene disponibilidad esta semana — la primera consulta dura 50 min y tiene un valor de $18.000. Para reservar pedimos una seña de $8.000 por MercadoPago. ¿Te muestro horarios?", time: "14:34" },
    { from: "patient", text: "Dale, sí", time: "14:35" },
    { from: "agent", text: "Tengo estos espacios:\n\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30\n\n¿Cuál te queda mejor?", time: "14:35" },
    { from: "patient", text: "El martes 16hs me viene bien", time: "14:36" },
    { from: "agent", text: "Listo, te reservo el martes 5/5 a las 16:00. Te paso el link de pago de la seña 👇", time: "14:36" },
    { from: "agent", text: "🔗 mpago.la/seña-mariana", time: "14:36", isLink: true },
  ],
  direct: [
    { from: "patient", text: "Buenas, quiero sacar turno", time: "14:32" },
    { from: "agent", text: "Hola. Soy la asistente de la Lic. Lucía Fernández. ¿Tu nombre y si es primera vez?", time: "14:32" },
    { from: "patient", text: "Mariana, primera vez", time: "14:33" },
    { from: "agent", text: "Primera consulta: 50 min · $18.000. Seña $8.000 por MercadoPago. Horarios:\n\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30", time: "14:33" },
    { from: "patient", text: "Martes 16", time: "14:34" },
    { from: "agent", text: "Reservado: Mar 5/5 — 16:00. Link de seña abajo.", time: "14:34" },
    { from: "agent", text: "🔗 mpago.la/seña-mariana", time: "14:34", isLink: true },
  ],
  casual: [
    { from: "patient", text: "Holaaa, tenés lugar para empezar terapia?", time: "14:32" },
    { from: "agent", text: "Hola! Soy la asistente de Lucía 👋 Sí, hay lugar. ¿Cómo te llamás?", time: "14:32" },
    { from: "patient", text: "Mariana, 28 años", time: "14:33" },
    { from: "agent", text: "Bienvenida Mariana! ¿Primera vez en terapia o ya tenés experiencia?", time: "14:33" },
    { from: "patient", text: "Primera vez", time: "14:34" },
    { from: "agent", text: "Genial 🌟 La primera consulta dura 50 min y sale $18.000. Para apartar el turno te pedimos una seña de $8.000 por MP. Te mando los horarios libres?", time: "14:34" },
    { from: "patient", text: "Dale", time: "14:35" },
    { from: "agent", text: "Mirá:\n\n• Mar 5/5 — 16:00\n• Mié 6/5 — 11:00\n• Jue 7/5 — 18:30\n\n¿Cuál preferís?", time: "14:35" },
    { from: "patient", text: "Martes a las 4!", time: "14:36" },
    { from: "agent", text: "Listo Mariana 🙌 Te reservé el martes 5/5 a las 16:00. Acá va el link de la seña 👇", time: "14:36" },
    { from: "agent", text: "🔗 mpago.la/seña-mariana", time: "14:36", isLink: true },
  ],
};

const ChatView = ({ tone = "warm", showReasoning = true, autoplay = true }) => {
  const script = SCRIPTS[tone] || SCRIPTS.warm;
  const [count, setCount] = useStateC(autoplay ? 2 : script.length);
  const [typing, setTyping] = useStateC(false);
  const [paused, setPaused] = useStateC(!autoplay);
  const scrollRef = useRefC(null);

  useEffectC(() => {
    if (paused) return;
    if (count >= script.length) return;
    const next = script[count];
    const isAgent = next.from === "agent";
    setTyping(isAgent);
    const t = setTimeout(() => {
      setTyping(false);
      setCount(c => c + 1);
    }, isAgent ? 1700 : 900);
    return () => clearTimeout(t);
  }, [count, paused, tone]);

  useEffectC(() => { setCount(autoplay ? 2 : script.length); }, [tone]);

  useEffectC(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [count, typing]);

  const restart = () => { setCount(0); setPaused(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--chat-bg)" }}>
      {/* WhatsApp-ish header (generic, not green) */}
      <div style={{ padding: "10px 14px", background: "#F0EAE0", borderBottom: "1px solid #D9CDB8", display: "flex", alignItems: "center", gap: 11 }}>
        <Icon name="chevron" size={18} style={{ transform: "rotate(180deg)", color: "#5A4E42" }} />
        <Avatar name="Lucía Fernández" size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1F1A14" }}>Lic. Lucía Fernández · Psicóloga</div>
          <div style={{ fontSize: 11.5, color: "#7A6B5A", display: "flex", alignItems: "center", gap: 5 }}>
            <span className="badge-dot" style={{ background: "var(--sage)", width: 5, height: 5, borderRadius: 999 }} />
            respondiendo con asistente IA
          </div>
        </div>
        <Icon name="phone" size={18} style={{ color: "#5A4E42" }} />
        <Icon name="moreV" size={18} style={{ color: "#5A4E42" }} />
      </div>

      {/* Day separator */}
      <div ref={scrollRef} className="chat-area scroll-styled" style={{ flex: 1, overflow: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ alignSelf: "center", background: "rgba(255,255,255,0.7)", padding: "3px 11px", borderRadius: 8, fontSize: 11, color: "#5A4E42", marginBottom: 6, boxShadow: "0 1px 0.5px rgba(0,0,0,0.1)" }}>HOY</div>

        {script.slice(0, count).map((m, i) => (
          <ChatBubble key={i} msg={m} prev={script[i-1]} showReasoning={showReasoning && m.from === "agent"} />
        ))}

        {typing && (
          <div className="chat-bubble chat-out" style={{ display: "flex", alignItems: "center", gap: 4, padding: "9px 12px" }}>
            <Dot delay={0} /><Dot delay={150} /><Dot delay={300} />
          </div>
        )}

        {showReasoning && count >= script.length && (
          <div style={{ alignSelf: "center", marginTop: 12 }}>
            <div className="ai-thinking" style={{ background: "rgba(255,255,255,0.8)" }}>
              <Icon name="sparkles" size={10} />
              turno reservado · seña pendiente · sincronizado con Google Calendar
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{ padding: "8px 10px", background: "#F0EAE0", display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #D9CDB8" }}>
        <Icon name="plus" size={20} style={{ color: "#5A4E42" }} />
        <div style={{ flex: 1, background: "#FFF", borderRadius: 20, padding: "8px 14px", fontSize: 13.5, color: "#9E8E7A", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1 }}>El agente está al mando…</span>
          <Icon name="paperclip" size={16} />
        </div>
        <button onClick={paused ? restart : () => setPaused(true)} style={{ background: "var(--terracotta)", border: "none", width: 36, height: 36, borderRadius: 999, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name={paused ? "play" : "pause"} size={14} />
        </button>
      </div>
    </div>
  );
};

const Dot = ({ delay }) => (
  <span style={{
    width: 6, height: 6, borderRadius: 999, background: "#7A6B5A", display: "inline-block",
    animation: `dot 1.2s ${delay}ms infinite ease-in-out`,
  }} />
);

const ChatBubble = ({ msg, showReasoning }) => {
  const isAgent = msg.from === "agent";
  const cls = isAgent ? "chat-bubble chat-out" : "chat-bubble chat-in";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isAgent ? "flex-end" : "flex-start", maxWidth: "85%", alignSelf: isAgent ? "flex-end" : "flex-start" }}>
      <div className={cls} style={{ whiteSpace: "pre-wrap", ...(msg.isLink ? { background: "#F5F0DC", fontFamily: "var(--font-mono)", fontSize: 13 } : {}) }}>
        {msg.text}
        <span className="chat-meta">
          <span className="chat-time">{msg.time}</span>
          {isAgent && <span style={{ color: "#53BDEB", fontSize: 12, marginLeft: 1 }}>✓✓</span>}
        </span>
      </div>
    </div>
  );
};

// Inject keyframes once
if (typeof document !== "undefined" && !document.getElementById("chat-kf")) {
  const s = document.createElement("style");
  s.id = "chat-kf";
  s.textContent = `@keyframes dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-3px); opacity: 1; } }`;
  document.head.appendChild(s);
}

Object.assign(window, { ChatView });
