// QuestLoop — StatCard: animated number display

import { useEffect, useRef, useState } from "react";

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (typeof target !== "number") return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

export default function StatCard({ label, value, unit = "", accent = false, delay = 0 }) {
  const animated = useCountUp(typeof value === "number" ? value : 0);
  const display  = typeof value === "number" ? animated.toLocaleString() : value;

  return (
    <div
      className="fade-up"
      style={{
        animationDelay: `${delay}s`,
        background: "var(--bg-2)",
        border: `1px solid ${accent ? "rgba(249,115,22,0.25)" : "var(--border)"}`,
        borderTop: `2px solid ${accent ? "var(--accent)" : "var(--border-hi)"}`,
        padding: "20px 24px",
        borderRadius: "var(--radius)",
      }}
    >
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>
        {display}
        {unit && <span style={{ fontSize: 14, color: "var(--text-3)", marginLeft: 6 }}>{unit}</span>}
      </div>
    </div>
  );
}