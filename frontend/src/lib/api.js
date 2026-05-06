// QuestLoop — src/lib/api.js
// Typed API client with auth token injection and error normalisation

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `HTTP ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem("ql_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return null;

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.detail || json.message);
  return json;
}

const get  = (path)         => request(path);
const post = (path, body)   => request(path, { method: "POST",  body: JSON.stringify(body) });
const patch= (path, body)   => request(path, { method: "PATCH", body: JSON.stringify(body) });
const del  = (path)         => request(path, { method: "DELETE" });

export const api = {
  // Auth
  nonce:  (wallet_address)       => post("/auth/nonce",  { wallet_address }),
  verify: (wallet_address, signature) => post("/auth/verify", { wallet_address, signature }),

  // Campaigns (owner)
  createCampaign:  (body)        => post("/campaigns", body),
  listCampaigns:   (params = "") => get(`/campaigns${params}`),
  getCampaign:     (id)          => get(`/campaigns/${id}`),
  updateCampaign:  (id, body)    => patch(`/campaigns/${id}`, body),
  deleteCampaign:  (id)          => del(`/campaigns/${id}`),
  addQuest:        (cid, body)   => post(`/campaigns/${cid}/quests`, body),
  updateQuest:     (cid, qid, b) => patch(`/campaigns/${cid}/quests/${qid}`, b),
  deleteQuest:     (cid, qid)    => del(`/campaigns/${cid}/quests/${qid}`),

  // Explore (user)
  exploreCampaigns: (params = "")          => get(`/explore/campaigns${params}`),
  completeQuest:    (cid, qid, body)       => post(`/explore/campaigns/${cid}/quests/${qid}/complete`, body),
  claimReward:      (completion_id)        => post("/explore/claim", { completion_id }),

  // Streaks
  streakStatus:  (cid) => get(`/streaks/campaigns/${cid}`),
  milestone:     (cid) => get(`/streaks/campaigns/${cid}/milestone`),

  // Referrals
  referralLink:  (cid) => get(`/referrals/campaigns/${cid}/link`),
  referralStats: (cid) => get(`/referrals/campaigns/${cid}/stats`),
  resolveRef:    (cid, ref) => post(`/referrals/campaigns/${cid}/resolve?ref_code=${ref}`, {}),

  // Leaderboard
  campaignBoard: (cid, params = "") => get(`/leaderboard/campaigns/${cid}${params}`),
  globalBoard:   (params = "")      => get(`/leaderboard/global${params}`),
};