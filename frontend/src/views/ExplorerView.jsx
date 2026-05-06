// QuestLoop — Campaign feed + quest completion

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStore } from "../lib/store";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";

const TIER_COLOR = {
  bronze:  "#CD7F32",
  silver:  "#A8B8C8",
  gold:    "#F5C842",
  diamond: "#A5F3FC",
};

const QUEST_TYPE_LABEL = {
  follow_twitter: "Twitter Follow",
  retweet:        "Retweet",
  join_discord:   "Discord Join",
  visit_url:      "Visit URL",
  on_chain_tx:    "On-Chain Tx",
  nft_hold:       "NFT Hold",
  token_hold:     "Token Hold",
  invite_referral:"Referral",
  custom:         "Custom",
};

function lamportsToSol(lamports) {
  return (lamports / 1e9).toFixed(4);
}

function QuestCard({ quest, campaignId, onComplete }) {
  const [loading, setLoading]   = useState(false);
  const [claimed,  setClaimed]  = useState(quest.is_completed && quest.completion_status === "rewarded");
  const [pending,  setPending]  = useState(quest.is_completed && quest.completion_status === "pending");
  const [verified, setVerified] = useState(quest.is_completed && quest.completion_status === "verified");
  const { dispatch } = useStore();

  async function handleComplete() {
    setLoading(true);
    try {
      const result = await api.completeQuest(campaignId, quest.id, { proof_data: { oauth_token: "mvp-trust" } });
      if (result.status === "verified") {
        setVerified(true);
        dispatch({ type: "TOAST", payload: { message: `Quest verified! Claim your ${lamportsToSol(result.reward_lamports)} SOL.`, type: "success" } });
      } else {
        setPending(true);
        dispatch({ type: "TOAST", payload: { message: "Quest submitted for review.", type: "info" } });
      }
      onComplete?.(result);
    } catch (err) {
      dispatch({ type: "TOAST", payload: { message: err.detail || "Failed to complete quest.", type: "error" } });
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(completionId) {
    setLoading(true);
    try {
      const result = await api.claimReward(completionId);
      setClaimed(true);
      dispatch({ type: "TOAST", payload: { message: `🎉 ${lamportsToSol(result.reward_lamports)} SOL sent! Tx: ${result.tx_signature.slice(0, 8)}…`, type: "success" } });
    } catch (err) {
      dispatch({ type: "TOAST", payload: { message: err.detail || "Claim failed.", type: "error" } });
    } finally {
      setLoading(false);
    }
  }

  const stateColor = claimed ? "var(--green)" : verified ? "var(--accent)" : pending ? "var(--blue)" : "var(--border-hi)";

  return (
    <div style={{
      background: "var(--bg-2)", border: `1px solid ${stateColor}`,
      borderRadius: "var(--radius)", padding: "16px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, transition: "border-color var(--transition)",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--accent)", background: "var(--accent-dim)",
            padding: "2px 7px", borderRadius: 3,
          }}>
            {QUEST_TYPE_LABEL[quest.quest_type] || quest.quest_type}
          </span>
          {quest.is_repeatable && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--blue)", background: "var(--blue-dim)", padding: "2px 7px", borderRadius: 3 }}>
              ↻ REPEAT
            </span>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{quest.title}</div>
        {quest.description && <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{quest.description}</div>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
          {lamportsToSol(quest.reward_lamports)} SOL
        </div>

        {claimed && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)" }}>✓ CLAIMED</span>
        )}
        {pending && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--blue)" }}>PENDING REVIEW</span>
        )}
        {verified && !claimed && (
          <Button size="sm" loading={loading} onClick={() => handleClaim(quest._completionId)}>Claim</Button>
        )}
        {!claimed && !pending && !verified && (
          <Button size="sm" variant="outline" loading={loading} onClick={handleComplete}>Complete</Button>
        )}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, delay }) {
  const [expanded, setExpanded] = useState(false);
  const [streak,   setStreak]   = useState({ current_streak: campaign.user_streak, tier: campaign.user_tier });

  const timeLeft = () => {
    const diff = new Date(campaign.ends_at) - Date.now();
    if (diff <= 0) return "Ended";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}d ${h}h left`;
  };

  return (
    <div
      className="fade-up"
      style={{ animationDelay: `${delay}s`, marginBottom: 16 }}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          background: "var(--bg-1)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "20px 24px",
          cursor: "pointer", transition: "border-color var(--transition)",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hi)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--green)", background: "var(--green-dim)", padding: "3px 8px", borderRadius: 3,
              }}>LIVE</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>{timeLeft()}</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 4 }}>{campaign.title}</h3>
            {campaign.description && (
              <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{campaign.description}</p>
            )}
          </div>

          {/* Right stats */}
          <div style={{ display: "flex", gap: 24, flexShrink: 0, alignItems: "flex-start" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>POOL</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                {lamportsToSol(campaign.reward_pool_lamports)} SOL
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>STREAK</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: TIER_COLOR[campaign.user_tier] || "var(--text)" }}>
                🔥 {campaign.user_streak}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>QUESTS</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700 }}>
                {campaign.quests?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Expand indicator */}
        <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>{campaign.participant_count} participants</span>
          <span style={{ marginLeft: "auto" }}>{expanded ? "▲ hide quests" : "▼ show quests"}</span>
        </div>
      </div>

      {/* Quests */}
      {expanded && (
        <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {campaign.quests?.map(q => (
            <QuestCard key={q.id} quest={q} campaignId={campaign.id} />
          ))}
          {!campaign.quests?.length && (
            <div style={{ textAlign: "center", padding: 24, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>
              No active quests yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExploreView() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const totalPool = campaigns.reduce((s, c) => s + c.reward_pool_lamports, 0);
  const totalPart = campaigns.reduce((s, c) => s + c.participant_count, 0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.exploreCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError(err.detail || "Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)", letterSpacing: "0.1em" }}>LOADING CAMPAIGNS···</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Live <span style={{ color: "var(--accent)" }}>Quests</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 13 }}>Complete actions. Build streaks. Earn instantly.</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard label="Active Campaigns" value={campaigns.length} delay={0.05} />
        <StatCard label="Total Pool" value={parseFloat(lamportsToSol(totalPool))} unit="SOL" accent delay={0.10} />
        <StatCard label="Participants" value={totalPart} delay={0.15} />
      </div>

      {error && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", marginBottom: 16 }}>{error}</div>
      )}

      {campaigns.map((c, i) => (
        <CampaignCard key={c.id} campaign={c} delay={i * 0.05} />
      ))}

      {!loading && !campaigns.length && (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 13 }}>
          No live campaigns. Check back soon.
        </div>
      )}
    </div>
  );
}