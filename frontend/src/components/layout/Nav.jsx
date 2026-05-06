// QuestLoop — Navigation bar

import { useStore } from "../../lib/store";
import { disconnectWallet } from "../../lib/wallet";
import Button from "../ui/Button";

const ROUTES = [
  { label: "Explore",    view: "explore" },
  { label: "My Streaks", view: "streaks" },
  { label: "Leaderboard",view: "leaderboard" },
  { label: "Dashboard",  view: "dashboard" },
];

export default function Nav({ currentView, onNavigate }) {
  const { state, dispatch } = useStore();

  const handleDisconnect = async () => {
    await disconnectWallet();
    dispatch({ type: "CLEAR_WALLET" });
  };

  const abbrev = (addr) =>
    addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : "";

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 56,
        background: "rgba(6,8,12,0.92)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => onNavigate("explore")}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "var(--accent)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#000" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.06em",
            color: "var(--text)",
          }}
        >
          QUEST<span style={{ color: "var(--accent)" }}>LOOP</span>
        </span>
      </div>

      {/* Routes */}
      <div style={{ display: "flex", gap: 4 }}>
        {ROUTES.map((r) => {
          const isActive = currentView === r.view;

          return (
            <button
              key={r.view}
              onClick={() => onNavigate(r.view)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "6px 14px",
                borderRadius: "var(--radius)",
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive ? "var(--accent)" : "var(--text-3)",
                background: isActive
                  ? "var(--accent-dim)"
                  : "transparent",
                transition: "all var(--transition)",
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Wallet */}
      {state.wallet ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--text-2)",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              padding: "5px 12px",
              borderRadius: "var(--radius)",
            }}
          >
            {abbrev(state.wallet.address)}
          </div>
          <Button variant="ghost" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => onNavigate("connect")}>
          Connect Wallet
        </Button>
      )}
    </nav>
  );
}