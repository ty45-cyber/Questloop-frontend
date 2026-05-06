// QuestLoop — Button

export default function Button({
  children, onClick, variant = "primary",
  size = "md", disabled = false, loading = false, style = {},
}) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, border: "none", cursor: disabled || loading ? "not-allowed" : "pointer",
    fontFamily: "var(--mono)", fontWeight: 600, letterSpacing: "0.04em",
    borderRadius: "var(--radius)", transition: "all var(--transition)",
    opacity: disabled ? 0.45 : 1, outline: "none",
    ...style,
  };

  const sizes = {
    sm: { padding: "6px 14px", fontSize: 11 },
    md: { padding: "10px 20px", fontSize: 12 },
    lg: { padding: "14px 28px", fontSize: 13 },
  };

  const variants = {
    primary: {
      background: "var(--accent)", color: "#000",
      boxShadow: "0 0 0 0 var(--accent-glow)",
    },
    ghost: {
      background: "transparent", color: "var(--text-2)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "transparent", color: "var(--red)",
      border: "1px solid rgba(239,68,68,0.3)",
    },
    outline: {
      background: "var(--accent-dim)", color: "var(--accent)",
      border: "1px solid rgba(249,115,22,0.3)",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onMouseEnter={e => {
        if (variant === "primary") e.currentTarget.style.boxShadow = "0 0 16px var(--accent-glow)";
        if (variant === "ghost")   e.currentTarget.style.borderColor = "var(--border-hi)";
        if (variant === "outline") e.currentTarget.style.background = "rgba(249,115,22,0.2)";
      }}
      onMouseLeave={e => {
        if (variant === "primary") e.currentTarget.style.boxShadow = "0 0 0 0 var(--accent-glow)";
        if (variant === "ghost")   e.currentTarget.style.borderColor = "var(--border)";
        if (variant === "outline") e.currentTarget.style.background = "var(--accent-dim)";
      }}
    >
      {loading ? <span style={{ opacity: 0.6 }}>···</span> : children}
    </button>
  );
}