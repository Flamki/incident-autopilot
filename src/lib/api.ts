export type IncidentStatus =
  | "ANALYZING"
  | "AGENTS_RUNNING"
  | "PENDING_APPROVAL"
  | "EXECUTING"
  | "RESOLVED"
  | "DISMISSED"
  | "ERROR";

export interface Incident {
  id: string;
  user_id: string;
  repo_id: string;
  gitlab_pipeline_id?: number | null;
  gitlab_issue_iid?: number | null;
  gitlab_issue_url?: string | null;
  status: string;
  severity: string;
  pipeline_analysis: Record<string, any>;
  breaking_commit: Record<string, any>;
  code_context: Record<string, any>;
  ownership: Record<string, any>;
  recovery_plan: Record<string, any>;
  approved_by?: string | null;
  approved_at?: string | null;
  dismissed_by?: string | null;
  dismissed_at?: string | null;
  dismissed_reason?: string | null;
  triggered_at?: string | null;
  agents_completed_at?: string | null;
  resolved_at?: string | null;
  diagnosis_seconds?: number | null;
  resolution_seconds?: number | null;
  pipeline_ref?: string | null;
  pipeline_url?: string | null;
  error_type?: string | null;
  error_summary?: string | null;
  created_at?: string | null;
  title?: string | null;
  type?: string | null;
}

export interface IncidentListResponse {
  items: Incident[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentRun {
  id: string;
  incident_id: string;
  agent_name: string;
  agent_index: number;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  claude_tokens?: number | null;
  error_message?: string | null;
  output_snapshot?: Record<string, any> | null;
}

export interface Repository {
  id: string;
  user_id: string;
  gitlab_project_id: number;
  project_path: string;
  project_name: string;
  project_url?: string | null;
  webhook_id?: number | null;
  webhook_secret?: string | null;
  is_active: boolean;
  created_at?: string | null;
  health?: number;
  branch?: string;
  active_incidents?: number;
  agents?: number;
  type?: string;
}

export interface GitLabProjectSummary {
  id: number;
  path_with_namespace: string;
  name: string;
  web_url?: string | null;
  default_branch?: string | null;
}

export interface User {
  id: string;
  gitlab_user_id: number;
  username: string;
  email?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  role: string;
  email: string;
  expertise: string[];
  score: number;
  incidents: number;
  status: string;
  initials: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notification_email: boolean;
  notification_slack: boolean;
  slack_webhook_url?: string | null;
  min_confidence: number;
  lookback_hours: number;
  agents_enabled: Record<string, any>;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  created_at?: string | null;
}

export interface AnalyticsSummary {
  mttr_seconds: number;
  incident_count_30d: number;
  active_incidents: number;
  pending_approval: number;
  resolved_incidents: number;
  automation_rate: number;
  agent_accuracy: number;
  trends: { name: string; incidents: number; mttr: number }[];
  severity_distribution: { name: string; value: number; color: string }[];
}

export interface AgentMetricsResponse {
  items: {
    agent_name: string;
    runs: number;
    success_rate: number;
    avg_duration_ms: number;
    total_tokens: number;
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SocialProviderRequest {
  provider: "google" | "github";
  email?: string;
  full_name?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8000";
const TOKEN_KEY = "autopilot_jwt";

const rawWsBaseUrl = (import.meta.env.VITE_WS_BASE_URL as string | undefined) || "";
const WS_BASE_URL =
  rawWsBaseUrl.toLowerCase() === "disabled"
    ? ""
    : (rawWsBaseUrl || API_BASE_URL.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://")).replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_BASE_URL.replace(/\/$/, "");
}

export function getWsBaseUrl() {
  return WS_BASE_URL;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 140);
    throw new Error(`Invalid API response: expected JSON, got ${contentType || "unknown"} (${preview})`);
  }

  return (await response.json()) as T;
}

export const api = {
  signup: (payload: SignupRequest) => apiFetch<SignupResponse>("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: LoginRequest) => apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  socialSignup: (payload: SocialProviderRequest) => apiFetch<SignupResponse>("/auth/social/signup", { method: "POST", body: JSON.stringify(payload) }),
  socialLogin: (payload: SocialProviderRequest) => apiFetch<AuthResponse>("/auth/social/login", { method: "POST", body: JSON.stringify(payload) }),
  refresh: () => apiFetch<{ token: string }>("/auth/refresh", { method: "POST" }),
  logout: () => apiFetch<void>("/auth/logout", { method: "DELETE" }),

  me: () => apiFetch<User>("/me"),
  team: () => apiFetch<TeamMember[]>("/me/team"),
  inviteTeam: (payload: { email: string; role: string }) => apiFetch<{ message: string }>("/me/team/invite", {
    method: "POST",
    body: JSON.stringify(payload),
  }),

  listIncidents: (params?: { search?: string; status?: string; severity?: string; repo_id?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status && params.status !== "ALL") query.set("status", params.status);
    if (params?.severity && params.severity !== "ALL") query.set("severity", params.severity);
    if (params?.repo_id) query.set("repo_id", params.repo_id);
    if (typeof params?.limit === "number") query.set("limit", String(params.limit));
    if (typeof params?.offset === "number") query.set("offset", String(params.offset));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<IncidentListResponse>(`/incidents${suffix}`);
  },
  getIncident: (id: string) => apiFetch<Incident>(`/incidents/${id}`),
  approveIncident: (id: string) => apiFetch<Incident>(`/incidents/${id}/approve`, { method: "PATCH" }),
  runIncidentAgents: (id: string) => apiFetch<Incident>(`/incidents/${id}/run`, { method: "POST" }),
  dismissIncident: (id: string, reason?: string) =>
    apiFetch<Incident>(`/incidents/${id}/dismiss`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  reopenIncident: (id: string) => apiFetch<Incident>(`/incidents/${id}/reopen`, { method: "PATCH" }),
  incidentAgents: (id: string) => apiFetch<AgentRun[]>(`/incidents/${id}/agents`),
  retryAgent: (id: string, agent_name: string) =>
    apiFetch<AgentRun>(`/incidents/${id}/retry-agent`, { method: "POST", body: JSON.stringify({ agent_name }) }),

  listRepos: () => apiFetch<Repository[]>("/repos"),
  discoverRepos: (search?: string) => {
    const query = new URLSearchParams();
    if (search && search.trim()) query.set("search", search.trim());
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<GitLabProjectSummary[]>(`/repos/discover${suffix}`);
  },
  createRepo: (payload: Partial<Repository> & { gitlab_project_id: number; project_path?: string }) =>
    apiFetch<Repository>("/repos", { method: "POST", body: JSON.stringify(payload) }),
  deleteRepo: (id: string) => apiFetch<void>(`/repos/${id}`, { method: "DELETE" }),
  testRepo: (id: string) => apiFetch<{ status: string; latency: number }>(`/repos/${id}/test`),
  repoIncidents: (id: string) => apiFetch<Incident[]>(`/repos/${id}/incidents`),

  getSettings: () => apiFetch<UserSettings>("/settings"),
  updateSettings: (payload: Partial<UserSettings>) => apiFetch<UserSettings>("/settings", { method: "PUT", body: JSON.stringify(payload) }),
  getAgentSettings: () => apiFetch<{ agents_enabled: Record<string, any> }>("/settings/agents"),
  updateAgentSettings: (agents_enabled: Record<string, any>) =>
    apiFetch<{ agents_enabled: Record<string, any> }>("/settings/agents", {
      method: "PUT",
      body: JSON.stringify({ agents_enabled }),
    }),
  getNotificationSettings: () => apiFetch<{ notification_email: boolean; notification_slack: boolean; slack_webhook_url?: string | null }>("/settings/notifications"),
  updateNotificationSettings: (payload: { notification_email?: boolean; notification_slack?: boolean; slack_webhook_url?: string | null }) =>
    apiFetch<{ notification_email: boolean; notification_slack: boolean; slack_webhook_url?: string | null }>("/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  analyticsSummary: () => apiFetch<AnalyticsSummary>("/analytics/summary"),
  analyticsAgents: () => apiFetch<AgentMetricsResponse>("/analytics/agents"),
};
