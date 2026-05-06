// QuestLoop — Streaks: heatmap + tier + milestone

import { useEffect, useState } from "react";
import { api } from "../lib/api";

const TIER_COLOR = { bronze: "#CD7F32", silver: "#A8B8C8", gold: "#F5C842", diamond: "#A5F3FC" };
const TIER_LABEL = { bronze: "Bronze", silver: "Silver", gold: "Gold", diamond: "Diamond" };

function HeatmapGrid({ heatmap }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        30-Day Activity
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {heatmap.map((day, i) => (
          <div
            key={i}
            title={`${day.date}: ${day.quest_count} quest${day.quest_count !== 1 ? "s" : ""}`}
            style={{
              width: 16, height: 16, borderRadius: 3,
              background: day.completed
                ? day.quest_count >= 3 ? "var(--accent)" : day.quest_count >= 2 ? "rgba(249,115,22,0.6)" : "rgba(249,115,22,0.3)"
                : "var(--bg-3)",
              border: "1px solid var(--border)",
              transition: "transform var(--transition)",
              cursor: "default",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--bg-3)", border: "1px solid var(--border)" }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>None</span>
        <div style={{ width: 12, height: 12, borderRadius: 2, background: "rgba(249,115,22,0.3)" }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>1 quest</span>
        <div style={{ width: 12, height: 12, borderRadius: 2, background: "var(--accent)" }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>3+ quests</span>
      </div>
    </div>
  );
}

function StreakCard({ streak, campaignId }) {
  const tierColor = TIER_COLOR[streak.tier] || "var(--text)";
  const progress  = streak.days_to_next_tier
    ? Math.max(0, 1 - streak.days_to_next_tier / 7)
    : 1;

  return (
    <div className="fade-up" style={{
      background: "var(--bg-1)", border: "1px solid var(--border)",
      borderTop: `2px solid ${tierColor}`, borderRadius: "var(--radius)", padding: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
            Campaign #{campaignId}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 48, fontWeight: 700, color: tierColor, lineHeight: 1 }}>
              {streak.current_streak}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--text-3)" }}>day streak</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
            color: tierColor, textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            {TIER_LABEL[streak.tier]}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
            {streak.streak_bonus_multiplier}x bonus
          </div>
        </div>
      </div>

      {/* Status flags */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {streak.completed_today && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)", background: "var(--green-dim)", padding: "3px 8px", borderRadius: 3 }}>
            ✓ DONE TODAY
          </span>
        )}
        {streak.is_at_risk && !streak.completed_today && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)", background: "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: 3 }}>
            ⚠ STREAK AT RISK
          </span>
        )}
        {streak.is_broken_today && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", background: "var(--bg-3)", padding: "3px 8px", borderRadius: 3 }}>
            STREAK RESET
          </span>
        )}
        {streak.milestone_reached && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", background: "var(--accent-dim)", padding: "3px 8px", borderRadius: 3, animation: "pulse-accent 2s infinite" }}>
            🔥 {streak.milestone_reached}-DAY MILESTONE
          </span>
        )}
      </div>

      {/* Tier progress bar */}
      {streak.next_tier && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
              → {TIER_LABEL[streak.next_tier]}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
              {streak.days_to_next_tier} days left
            </span>
          </div>
          <div style={{ height: 3, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${tierColor}, var(--accent))`,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      )}

      {/* Heatmap */}
      {streak.heatmap?.length > 0 && <HeatmapGrid heatmap={streak.heatmap} />}
    </div>
  );
}

export default function StreaksView() {
  const [streaks,    setStreaks]  = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [campaigns,  setCampaigns] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const camps = await api.exploreCampaigns();
        setCampaigns(camps);
        const results = await Promise.allSettled(
          camps.map(c => api.streakStatus(c.id).then(s => ({ ...s, campaign_id: c.id })))
        );
        setStreaks(results.filter(r => r.status === "fulfilled").map(r => r.value));
      } catch (_) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>LOADING STREAKS···</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
          My <span style={{ color: "var(--accent)" }}>Streaks</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 13 }}>Keep completing quests daily to climb tiers and earn bigger bonuses.</p>
      </div>

      {streaks.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 13 }}>
          Complete your first quest to start a streak.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {streaks.map((s, i) => (
          <StreakCard key={s.campaign_id} streak={s} campaignId={s.campaign_id} />
        ))}
      </div>
    </div>
  );
}