// QuestLoop — Toast notification

import { useEffect } from "react";
import { useStore } from "../../lib/store";

export default function Toast() {
  const { state, dispatch } = useStore();
  const { toast } = state;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_TOAST" }), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  const colors = {
    success: "var(--green)",
    error:   "var(--red)",
    info:    "var(--accent)",
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "var(--bg-2)",
      border: `1px solid ${colors[toast.type] || "var(--border-hi)"}`,
      borderLeft: `3px solid ${colors[toast.type] || "var(--accent)"}`,
      padding: "12px 18px",
      borderRadius: "var(--radius)",
      fontFamily: "var(--mono)",
      fontSize: 12,
      color: "var(--text)",
      maxWidth: 360,
      animation: "fadeUp 0.25s ease both",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      {toast.message}
    </div>
  );
}