// QuestLoop — Leaderboard: campaign + global

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStore } from "../lib/store";

const TIER_COLOR  = { bronze: "#CD7F32", silver: "#A8B8C8", gold: "#F5C842", diamond: "#A5F3FC" };
const RANK_MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function lamportsToSol(l) { return (l / 1e9).toFixed(4); }

function abbrev(addr) { return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : "—"; }

function LeaderboardTable({ entries, selfAddress }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "grid", gridTemplateColumns: "48px 1fr 120px 80px",
        background: "var(--bg-2)", borderBottom: "1px solid var(--border)",
        padding: "10px 16px",
      }}>
        {["#", "Wallet", "Earned", "Streak"].map(h => (
          <div key={h} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
        ))}
      </div>

      {entries.map((entry, i) => {
        const isSelf = entry.wallet_address === selfAddress;
        return (
          <div
            key={i}
            className="fade-up"
            style={{
              animationDelay: `${i * 0.03}s`,
              display: "grid", gridTemplateColumns: "48px 1fr 120px 80px",
              padding: "12px 16px", alignItems: "center",
              borderBottom: "1px solid var(--border)",
              background: isSelf ? "rgba(249,115,22,0.05)" : i % 2 === 0 ? "var(--bg-1)" : "var(--bg)",
              borderLeft: isSelf ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: entry.rank <= 3 ? "var(--accent)" : "var(--text-3)" }}>
              {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `conic-gradient(${TIER_COLOR[entry.tier] || "var(--border-hi)"} 0%, var(--bg-3) 60%)`,
                border: `2px solid ${TIER_COLOR[entry.tier] || "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontFamily: "var(--mono)", color: TIER_COLOR[entry.tier],
                flexShrink: 0,
              }}>
                {entry.tier?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: isSelf ? "var(--accent)" : "var(--text)" }}>
                  {entry.display_name || abbrev(entry.wallet_address)}
                  {isSelf && <span style={{ marginLeft: 6, fontSize: 9, color: "var(--accent)" }}>YOU</span>}
                </div>
                {entry.quests_completed !== undefined && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
                    {entry.quests_completed} quests
                  </div>
                )}
              </div>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
              {lamportsToSol(entry.total_earned_lamports)} SOL
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: TIER_COLOR[entry.tier] || "var(--text)" }}>
              🔥 {entry.streak_count ?? "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeaderboardView() {
  const { state } = useStore();
  const [tab,        setTab]        = useState("global");
  const [campaigns,  setCampaigns]  = useState([]);
  const [selectedCid,setSelectedCid]= useState(null);
  const [board,      setBoard]      = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    api.exploreCampaigns().then(c => { setCampaigns(c); if (c[0]) setSelectedCid(c[0].id); }).catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true); setBoard(null);
      try {
        if (tab === "global") {
          setBoard(await api.globalBoard());
        } else if (selectedCid) {
          setBoard(await api.campaignBoard(selectedCid));
        }
      } catch (_) {} finally { setLoading(false); }
    }
    load();
  }, [tab, selectedCid]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Leader<span style={{ color: "var(--accent)" }}>board</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 13 }}>Real-time rankings across all campaigns.</p>
      </div>

      {/* Tab + campaign selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        {["global", "campaign"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "var(--accent-dim)" : "transparent",
            border: `1px solid ${tab === t ? "rgba(249,115,22,0.35)" : "var(--border)"}`,
            color: tab === t ? "var(--accent)" : "var(--text-3)",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "7px 16px", borderRadius: "var(--radius)", cursor: "pointer",
            transition: "all var(--transition)",
          }}>
            {t === "global" ? "Global" : "By Campaign"}
          </button>
        ))}

        {tab === "campaign" && campaigns.length > 0 && (
          <select
            value={selectedCid || ""}
            onChange={e => setSelectedCid(Number(e.target.value))}
            style={{
              background: "var(--bg-2)", border: "1px solid var(--border)",
              color: "var(--text)", fontFamily: "var(--mono)", fontSize: 11,
              padding: "7px 12px", borderRadius: "var(--radius)", cursor: "pointer",
            }}
          >
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        )}

        {board && (
          <div style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
            {board.self_rank && <span style={{ color: "var(--accent)" }}>Your rank: #{board.self_rank} · </span>}
            {(board.total_participants || board.total_wallets || 0).toLocaleString()} total
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 48, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>
          LOADING···
        </div>
      )}

      {board && !loading && (
        <LeaderboardTable
          entries={board.entries || []}
          selfAddress={state.wallet?.address}
        />
      )}
    </div>
  );
}