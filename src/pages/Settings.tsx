import { useEffect, useState } from "react";
import { Bell, Database, Flag, Plus, Shield, Trash2, Users, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/lib/utils";
import { useFeatureFlags, FeatureFlag } from "@/src/contexts/FeatureFlagContext";
import { api, Repository, UserSettings } from "@/src/lib/api";

const tabs = [
  { id: "repos", label: "Repositories", icon: Database },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "agents", label: "Agents", icon: Zap },
  { id: "flags", label: "Feature Flags", icon: Flag },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2, color: "critical" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("repos");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [agentsEnabled, setAgentsEnabled] = useState<Record<string, any>>({ all: true });

  const { flags, toggleFlag } = useFeatureFlags();

  const load = () => {
    Promise.all([api.listRepos(), api.getSettings(), api.getAgentSettings()])
      .then(([reposResp, settingsResp, agentResp]) => {
        setRepos(reposResp);
        setSettings(settingsResp);
        setAgentsEnabled(agentResp.agents_enabled);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, []);

  const featureFlagInfo: Record<FeatureFlag, { name: string; desc: string }> = {
    ENABLE_EXPERIMENTAL_ANALYTICS: {
      name: "Experimental Analytics",
      desc: "Enable new real-time incident visualization charts.",
    },
    ENABLE_ADVANCED_SEARCH: {
      name: "Advanced Search",
      desc: "Unlock natural language querying for historical incident data.",
    },
    ENABLE_BETA_RECOVERY_PLANS: {
      name: "Beta Recovery Plans",
      desc: "Access AI-generated multi-step recovery strategies (experimental).",
    },
    SHOW_DEVELOPER_TOOLS: {
      name: "Developer Tools",
      desc: "Show internal debug logs and system state in the dashboard.",
    },
  };

  return (
    <div className="p-sp-4 max-w-5xl mx-auto relative">
      <h1 className="font-display text-2xl font-bold uppercase tracking-tighter mb-sp-4 px-1">Settings</h1>

      <div className="flex gap-sp-6">
        <div className="w-64 shrink-0 flex flex-col gap-sp-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-sp-3 px-sp-4 py-sp-3 transition-all text-[11px] font-mono font-bold uppercase tracking-widest border border-transparent",
                activeTab === tab.id ? "bg-ink text-white border-blueprint" : "text-text-secondary hover:bg-bg-hover hover:text-ink",
                tab.color === "critical" && activeTab === tab.id && "bg-critical text-white border-blueprint",
              )}
            >
              <tab.icon className={cn("h-4 w-4", tab.color === "critical" ? "text-critical" : activeTab === tab.id ? "text-accent-neon" : "text-text-muted")} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === "repos" && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <div className="flex items-center justify-between mb-sp-6">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest">Connected Repositories</h3>
                  <Button
                    className="btn-neon h-8 px-4 text-[10px] font-bold uppercase tracking-tighter"
                    onClick={async () => {
                      const now = Date.now();
                      await api.createRepo({ gitlab_project_id: now, project_path: `org/settings-added-${String(now).slice(-4)}` });
                      load();
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3" /> Add Repository
                  </Button>
                </div>
                <div className="space-y-sp-4">
                  {repos.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                      <div className="flex items-center gap-sp-4">
                        <Database className="h-5 w-5 text-text-muted" />
                        <div>
                          <p className="text-[11px] font-mono font-bold uppercase">{repo.project_path}</p>
                          <p className="text-[9px] font-mono text-text-muted uppercase">Branch: {repo.branch || "main"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-sp-3">
                        <Badge variant="resolved">Connected</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-[9px] uppercase font-bold text-text-muted hover:text-critical"
                          onClick={async () => {
                            await api.deleteRepo(repo.id);
                            load();
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && settings && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-6">Notification Preferences</h3>
                <div className="space-y-sp-4">
                  <div className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                    <div>
                      <p className="text-[11px] font-mono font-bold uppercase">Email Notifications</p>
                      <p className="text-[9px] font-mono text-text-muted uppercase">Incident alerts and approvals</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const updated = await api.updateNotificationSettings({ notification_email: !settings.notification_email });
                        setSettings({ ...settings, ...updated });
                      }}
                    >
                      {settings.notification_email ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                    <div>
                      <p className="text-[11px] font-mono font-bold uppercase">Slack Notifications</p>
                      <p className="text-[9px] font-mono text-text-muted uppercase">Push alerts to Slack webhook</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const updated = await api.updateNotificationSettings({ notification_slack: !settings.notification_slack });
                        setSettings({ ...settings, ...updated });
                      }}
                    >
                      {settings.notification_slack ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "agents" && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-6">AI Agents Configuration</h3>
                <div className="space-y-sp-4">
                  {["log_analyzer", "commit_bisector", "code_context", "owner_finder", "recovery_planner", "action_executor"].map((agent) => {
                    const status = agentsEnabled[agent] ?? true;
                    return (
                      <div key={agent} className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                        <div>
                          <p className="text-[11px] font-mono font-bold uppercase">{agent}</p>
                          <p className="text-[9px] font-mono text-text-muted uppercase">toggle agent execution</p>
                        </div>
                        <div
                          onClick={async () => {
                            const next = { ...agentsEnabled, [agent]: !status };
                            setAgentsEnabled(next);
                            await api.updateAgentSettings(next);
                          }}
                          className={cn("h-5 w-10 border border-blueprint relative transition-all cursor-pointer", status ? "bg-accent-neon" : "bg-bg-card")}
                        >
                          <div className={cn("absolute top-0.5 h-3.5 w-3.5 border border-blueprint bg-white transition-all", status ? "right-0.5" : "left-0.5")} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "flags" && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-6">Dynamic Feature Toggles</h3>
                <div className="space-y-sp-4">
                  {(Object.keys(flags) as FeatureFlag[]).map((flag) => (
                    <div key={flag} className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                      <div>
                        <p className="text-[11px] font-mono font-bold uppercase">{featureFlagInfo[flag].name}</p>
                        <p className="text-[9px] font-mono text-text-muted uppercase font-bold">{featureFlagInfo[flag].desc}</p>
                        <code className="text-[8px] font-mono text-accent-purple mt-1 block">{flag}</code>
                      </div>
                      <div
                        onClick={() => toggleFlag(flag)}
                        className={cn("h-5 w-10 border border-blueprint relative transition-all cursor-pointer", flags[flag] ? "bg-accent-neon" : "bg-bg-card")}
                      >
                        <div className={cn("absolute top-0.5 h-3.5 w-3.5 border border-blueprint bg-white transition-all", flags[flag] ? "right-0.5" : "left-0.5")} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="border-blueprint bg-critical/5 p-sp-6 relative border-dashed">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-critical mb-sp-6">Danger Zone</h3>
              <div className="space-y-sp-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase text-critical">Delete Account</p>
                    <p className="text-[9px] font-mono text-text-muted uppercase font-bold">Once deleted, this cannot be undone.</p>
                  </div>
                  <Button className="bg-critical text-white border border-blueprint h-8 px-4 text-[10px] font-bold uppercase tracking-tighter">Delete Account</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}