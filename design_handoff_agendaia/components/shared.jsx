/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// ===== Icons (stroke-based, minimal) =====
const Icon = ({ name, size = 16, stroke = 1.6, ...props }) => {
  const paths = {
    home: <><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-4.4A8 8 0 1 1 21 12z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.5c2.5.4 4.5 2.4 4.5 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14zM5 15l.7 2.1L8 18l-2.3.9L5 21l-.7-2.1L2 18l2.3-.9L5 15z" /></>,
    check: <><path d="M5 12l4 4 10-10" /></>,
    x: <><path d="M6 6l12 12M18 6L6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <><path d="M9 6l6 6-6 6" /></>,
    chevronDown: <><path d="M6 9l6 6 6-6" /></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    money: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 10v.01M18 14v.01" /></>,
    phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></>,
    send: <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
    paperclip: <><path d="M21 12.5L12.5 21a5.5 5.5 0 0 1-7.8-7.8l9-9a3.7 3.7 0 0 1 5.2 5.2l-9 9a1.8 1.8 0 1 1-2.6-2.6L15 8" /></>,
    moreV: <><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>,
    calCheck: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" /></>,
    google: <><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 5v5h-5" /></>,
    wallet: <><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2H5a2 2 0 0 0 0 4h16v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><circle cx="17" cy="13" r="1.2" fill="currentColor" /></>,
    book: <><path d="M4 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4V4z" /><path d="M20 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7V4z" /></>,
    inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" /></>,
    flag: <><path d="M4 21V4M4 4h13l-2 4 2 4H4" /></>,
    shield: <><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    pause: <><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></>,
    play: <><path d="M6 4l14 8-14 8V4z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

// ===== Avatar =====
const Avatar = ({ name = "?", size = "md", color }) => {
  const initials = name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const cls = size === "lg" ? "avatar avatar-lg" : size === "sm" ? "avatar avatar-sm" : "avatar";
  const palette = ["#D6BFA6", "#C4A586", "#B5A188", "#A8957A", "#C9B89A", "#D4B5A0"];
  const bg = color || palette[(name.charCodeAt(0) || 0) % palette.length];
  return <div className={cls} style={{ background: bg, color: "#3A2D22" }}>{initials}</div>;
};

// ===== Logo =====
const Logo = ({ size = 22 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: "linear-gradient(135deg, #C26A4A 0%, #A95838 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
    }}>
      <svg width={size*0.55} height={size*0.55} viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v9l5 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </div>
    <span style={{ fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em", color: "var(--ink)" }}>
      AgendaIA
    </span>
  </div>
);

// ===== Sidebar =====
const Sidebar = ({ active, onNav }) => {
  const items = [
    { id: "dashboard", label: "Resumen", icon: "home" },
    { id: "chats", label: "Conversaciones", icon: "chat", count: 3 },
    { id: "agenda", label: "Agenda", icon: "calendar" },
    { id: "pacientes", label: "Pacientes", icon: "users" },
    { id: "agente", label: "Agente IA", icon: "sparkles" },
  ];
  return (
    <aside className="sidebar">
      <div style={{ padding: "0 6px 18px 8px" }}><Logo /></div>

      <div style={{ padding: "6px 8px 4px", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Menú</div>
      {items.map(it => (
        <div key={it.id} className={`nav-item ${active === it.id ? "active" : ""}`} onClick={() => onNav?.(it.id)}>
          <Icon name={it.icon} size={16} />
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <div className="card" style={{ padding: 12, marginBottom: 10, background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span className="badge-dot" style={{ background: "var(--sage)" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-2)" }}>Agente activo</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.45 }}>
          Atendiendo en WhatsApp · respuesta promedio 12s
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px" }}>
        <Avatar name="Lucía Fernández" size="sm" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Lic. Lucía Fernández</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Plan Independiente</div>
        </div>
      </div>
    </aside>
  );
};

// ===== Top bar =====
const TopBar = ({ title, subtitle, right }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "22px 32px 18px", borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
    <div>
      <h1 className="h2" style={{ marginBottom: 4 }}>{title}</h1>
      {subtitle && <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{subtitle}</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {right}
    </div>
  </div>
);

// ===== Badges helpers =====
const Badge = ({ kind = "default", children, dot }) => {
  const cls = kind === "default" ? "badge" : `badge badge-${kind}`;
  return (
    <span className={cls}>
      {dot && <span className="badge-dot" style={{ background: "currentColor" }} />}
      {children}
    </span>
  );
};

Object.assign(window, { Icon, Avatar, Logo, Sidebar, TopBar, Badge });
