// QuestLoop — Project owner: campaign builder + analytics

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useStore } from "../lib/store";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";

const QUEST_TYPES = [
  "follow_twitter","retweet","join_discord","visit_url",
  "on_chain_tx","nft_hold","token_hold","invite_referral","custom",
];
const VERIF_METHODS = ["oauth","on_chain","webhook","manual"];

function lamportsToSol(l) { return (l / 1e9).toFixed(4); }

function CampaignStatusBadge({ status }) {
  const map = {
    draft:  { color: "var(--text-3)",  bg: "var(--bg-3)",       label: "DRAFT"  },
    active: { color: "var(--green)",   bg: "var(--green-dim)",   label: "LIVE"   },
    paused: { color: "var(--blue)",    bg: "var(--blue-dim)",    label: "PAUSED" },
    ended:  { color: "var(--text-3)",  bg: "var(--bg-3)",        label: "ENDED"  },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em",
      color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 3,
    }}>{s.label}</span>
  );
}

function QuestBuilder({ quests, setQuests }) {
  const empty = { title: "", description: "", quest_type: "follow_twitter", verification_method: "oauth", reward_lamports: 0, is_repeatable: false };
  const [draft, setDraft] = useState(empty);

  const addQuest = () => {
    if (!draft.title.trim()) return;
    setQuests(prev => [...prev, { ...draft, id: Date.now(), sort_order: prev.length }]);
    setDraft(empty);
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div style={{ background: "var(--bg-2)", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Quests ({quests.length})
      </div>

      {/* Existing quests */}
      {quests.map((q, i) => (
        <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "var(--bg-1)" : "var(--bg)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 6px", borderRadius: 3 }}>{q.quest_type}</span>
          <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{q.title}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)" }}>{lamportsToSol(q.reward_lamports)} SOL</span>
          <button onClick={() => setQuests(prev => prev.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      ))}

      {/* New quest form */}
      <div style={{ padding: 16, background: "var(--bg)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Quest Title" value={draft.title} onChange={v => setDraft(p => ({ ...p, title: v }))} />
          <Field label="Reward (lamports)" value={draft.reward_lamports} type="number" onChange={v => setDraft(p => ({ ...p, reward_lamports: parseInt(v) || 0 }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Select label="Quest Type" value={draft.quest_type} options={QUEST_TYPES} onChange={v => setDraft(p => ({ ...p, quest_type: v }))} />
          <Select label="Verification" value={draft.verification_method} options={VERIF_METHODS} onChange={v => setDraft(p => ({ ...p, verification_method: v }))} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button size="sm" variant="outline" onClick={addQuest}>+ Add Quest</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "9px 12px",
          color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12,
          outline: "none", transition: "border-color var(--transition)",
        }}
        onFocus={e => e.target.style.borderColor = "var(--accent)"}
        onBlur={e  => e.target.style.borderColor = "var(--border)"}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "9px 12px",
          color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12,
          outline: "none", cursor: "pointer",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CampaignBuilder({ onCreated }) {
  const { dispatch } = useStore();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [quests,  setQuests]  = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", reward_pool_lamports: 0,
    referral_bonus_bps: 500, streak_bonus_bps: 1000,
    starts_at: "", ends_at: "",
  });

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.title || !form.starts_at || !form.ends_at) {
      dispatch({ type: "TOAST", payload: { message: "Title, start date, and end date are required.", type: "error" } });
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...form,
        reward_pool_lamports: parseInt(form.reward_pool_lamports) || 0,
        referral_bonus_bps:   parseInt(form.referral_bonus_bps) || 500,
        streak_bonus_bps:     parseInt(form.streak_bonus_bps) || 1000,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at:   new Date(form.ends_at).toISOString(),
        quests: quests.map(({ id, ...q }) => q),
      };
      await api.createCampaign(body);
      dispatch({ type: "TOAST", payload: { message: "Campaign created!", type: "success" } });
      setOpen(false);
      setForm({ title: "", description: "", reward_pool_lamports: 0, referral_bonus_bps: 500, streak_bonus_bps: 1000, starts_at: "", ends_at: "" });
      setQuests([]);
      onCreated?.();
    } catch (err) {
      dispatch({ type: "TOAST", payload: { message: err.detail || "Failed to create campaign.", type: "error" } });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      {!open ? (
        <Button onClick={() => setOpen(true)}>+ New Campaign</Button>
      ) : (
        <div className="fade-up" style={{
          background: "var(--bg-1)", border: "1px solid var(--border)",
          borderTop: "2px solid var(--accent)", borderRadius: "var(--radius)", padding: 24,
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
            New Campaign
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Title *" value={form.title} onChange={f("title")} required />
            <Field label="Description" value={form.description} onChange={f("description")} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Reward Pool (lamports)" value={form.reward_pool_lamports} type="number" onChange={f("reward_pool_lamports")} />
              <Field label="Referral Bonus (bps)" value={form.referral_bonus_bps} type="number" onChange={f("referral_bonus_bps")} />
              <Field label="Streak Bonus (bps)" value={form.streak_bonus_bps} type="number" onChange={f("streak_bonus_bps")} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Starts At *" value={form.starts_at} type="datetime-local" onChange={f("starts_at")} />
              <Field label="Ends At *"   value={form.ends_at}   type="datetime-local" onChange={f("ends_at")} />
            </div>

            <QuestBuilder quests={quests} setQuests={setQuests} />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button loading={loading} onClick={handleCreate}>Create Campaign</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsRow({ campaign }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.referralStats(campaign.id).then(setStats).catch(() => {});
  }, [campaign.id]);

  const handleActivate = async () => {
    try {
      await api.updateCampaign(campaign.id, { status: "active" });
      window.location.reload();
    } catch (err) {
      alert(err.detail || "Failed to activate.");
    }
  };

  return (
    <div className="fade-up" style={{
      background: "var(--bg-1)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CampaignStatusBadge status={campaign.status} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>{campaign.title}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {campaign.status === "draft" && (
            <Button size="sm" variant="outline" onClick={handleActivate}>Activate</Button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: "Pool",       value: `${lamportsToSol(campaign.reward_pool_lamports)} SOL` },
          { label: "Quests",     value: campaign.quest_count },
          { label: "Participants",value: campaign.participant_count },
          { label: "Referrals",  value: stats?.total_referred ?? "—" },
          { label: "Conversions",value: stats ? `${(stats.conversion_rate * 100).toFixed(0)}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardView() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    try { setCampaigns(await api.listCampaigns()); }
    catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalPool  = campaigns.reduce((s, c) => s + c.reward_pool_lamports, 0);
  const totalPart  = campaigns.reduce((s, c) => s + c.participant_count, 0);
  const activeCnt  = campaigns.filter(c => c.status === "active").length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Project <span style={{ color: "var(--accent)" }}>Dashboard</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 13 }}>Create campaigns, set quests, monitor performance.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
        <StatCard label="Campaigns" value={campaigns.length} delay={0.05} />
        <StatCard label="Active"    value={activeCnt}        delay={0.10} accent />
        <StatCard label="Participants" value={totalPart}     delay={0.15} />
        <StatCard label="Pool (SOL)" value={parseFloat(lamportsToSol(totalPool))} delay={0.20} accent />
      </div>

      <CampaignBuilder onCreated={load} />

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>LOADING···</div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-3)", fontFamily: "var(--mono)", fontSize: 13 }}>
          No campaigns yet. Create your first one above.
        </div>
      ) : (
        campaigns.map(c => <AnalyticsRow key={c.id} campaign={c} />)
      )}
    </div>
  );
}