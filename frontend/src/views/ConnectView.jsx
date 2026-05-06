// QuestLoop — Wallet connect / auth flow

import { useState } from "react";
import { api } from "../lib/api";
import { connectWallet, signMessage } from "../lib/wallet";
import { useStore } from "../lib/store";
import Button from "../components/ui/Button";

export default function ConnectView({ onSuccess }) {
  const { dispatch } = useStore();
  const [step, setStep]     = useState("idle");   // idle | connecting | signing | done | error
  const [error, setError]   = useState(null);

  const STEPS = {
    idle:       { label: "Initialising",     pct: 0   },
    connecting: { label: "Connecting wallet", pct: 25  },
    signing:    { label: "Signing message",  pct: 60  },
    verifying:  { label: "Verifying",        pct: 85  },
    done:       { label: "Authenticated",    pct: 100 },
  };

  async function handleConnect() {
    setError(null);
    try {
      setStep("connecting");
      const address = await connectWallet();

      setStep("signing");
      const { message } = await api.nonce(address);
      const signature   = await signMessage(message);

      setStep("verifying");
      const { access_token, wallet_id } = await api.verify(address, signature);
      localStorage.setItem("ql_token", access_token);

      dispatch({ type: "SET_WALLET", payload: { address, id: wallet_id }, token: access_token });
      setStep("done");
      setTimeout(() => onSuccess(), 600);
    } catch (err) {
      setError(err.message || "Connection failed");
      setStep("idle");
    }
  }

  const current = STEPS[step] || STEPS.idle;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div className="fade-up" style={{
        width: "100%", maxWidth: 420,
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 12, padding: 40,
        textAlign: "center",
      }}>
        {/* Logo mark */}
        <div style={{
          width: 56, height: 56, background: "var(--accent)",
          borderRadius: 10, margin: "0 auto 28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 32px var(--accent-glow)",
        }}>
          <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#000" />
          </svg>
        </div>

        <h1 style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.02em" }}>
          QuestLoop
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>
          Complete quests. Earn rewards.<br />Keep your streak alive.
        </p>

        {/* Progress bar */}
        {step !== "idle" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {current.label}
            </div>
            <div style={{ height: 2, background: "var(--bg-3)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{
                height: "100%", background: "var(--accent)",
                width: `${current.pct}%`, transition: "width 0.4s ease",
                boxShadow: "0 0 8px var(--accent)",
              }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            padding: "10px 14px", borderRadius: "var(--radius)", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <Button
          onClick={handleConnect}
          loading={step !== "idle" && step !== "done"}
          disabled={step === "done"}
          style={{ width: "100%" }}
          size="lg"
        >
          {step === "idle" ? "Connect Phantom" : step === "done" ? "✓ Connected" : "···"}
        </Button>

        <p style={{ marginTop: 16, fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
          No transaction required · Sign-only authentication
        </p>
      </div>
    </div>
  );
}