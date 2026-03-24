import { motion } from "motion/react";
import { 
  Database, 
  Bell, 
  Zap, 
  Users, 
  Shield, 
  CreditCard, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  ExternalLink,
  Flag
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { useFeatureFlags, FeatureFlag } from "@/src/contexts/FeatureFlagContext";

const tabs = [
  { id: "repos", label: "Repositories", icon: Database },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "agents", label: "Agents", icon: Zap },
  { id: "flags", label: "Feature Flags", icon: Flag },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: Trash2, color: "critical" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("repos");
  const { flags, toggleFlag } = useFeatureFlags();

  const featureFlagInfo: Record<FeatureFlag, { name: string; desc: string }> = {
    ENABLE_EXPERIMENTAL_ANALYTICS: {
      name: "Experimental Analytics",
      desc: "Enable new D3-based real-time incident visualization charts."
    },
    ENABLE_ADVANCED_SEARCH: {
      name: "Advanced Search",
      desc: "Unlock natural language querying for historical incident data."
    },
    ENABLE_BETA_RECOVERY_PLANS: {
      name: "Beta Recovery Plans",
      desc: "Access AI-generated multi-step recovery strategies (experimental)."
    },
    SHOW_DEVELOPER_TOOLS: {
      name: "Developer Tools",
      desc: "Show internal debug logs and system state in the dashboard."
    }
  };

  return (
    <div className="p-sp-4 max-w-5xl mx-auto relative">
      <h1 className="font-display text-2xl font-bold uppercase tracking-tighter mb-sp-4 px-1">Settings</h1>

      <div className="flex gap-sp-6">
        {/* Tabs Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-sp-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-sp-3 px-sp-4 py-sp-3 transition-all text-[11px] font-mono font-bold uppercase tracking-widest border border-transparent",
                activeTab === tab.id 
                  ? "bg-ink text-white border-blueprint" 
                  : "text-text-secondary hover:bg-bg-hover hover:text-ink",
                tab.color === "critical" && activeTab === tab.id && "bg-critical text-white border-blueprint",
                tab.color === "critical" && activeTab !== tab.id && "hover:text-critical hover:bg-critical/5"
              )}
            >
              <tab.icon className={cn("h-4 w-4", tab.color === "critical" ? "text-critical" : activeTab === tab.id ? "text-accent-neon" : "text-text-muted")} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "repos" && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <div className="coord-label -top-2 -left-2 bg-white px-1">// CONNECTED_REPOS //</div>
                <div className="flex items-center justify-between mb-sp-6">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest">Connected Repositories</h3>
                  <Button className="btn-neon h-8 px-4 text-[10px] font-bold uppercase tracking-tighter">
                    <Plus className="mr-2 h-3 w-3" /> Add Repository
                  </Button>
                </div>
                <div className="space-y-sp-4">
                  {[
                    { name: "org/api-service", status: "Connected", branch: "main", webhook: "Active" },
                    { name: "org/auth-service", status: "Connected", branch: "v2.1-stable", webhook: "Active" },
                    { name: "org/worker-node", status: "Connected", branch: "main", webhook: "Active" },
                  ].map((repo) => (
                    <div key={repo.name} className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                      <div className="flex items-center gap-sp-4">
                        <Database className="h-5 w-5 text-text-muted" />
                        <div>
                          <p className="text-[11px] font-mono font-bold uppercase">{repo.name}</p>
                          <p className="text-[9px] font-mono text-text-muted uppercase">Branch: {repo.branch} // Webhook: {repo.webhook}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-sp-3">
                        <Badge variant="resolved">Connected</Badge>
                        <Button variant="ghost" size="sm" className="font-mono text-[9px] uppercase font-bold text-text-muted hover:text-critical">Disconnect</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-sp-4 border-blueprint bg-accent-purple/5 border-dashed">
                <div className="flex gap-sp-4">
                  <Shield className="h-5 w-5 text-accent-purple shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1">GitLab Integration</h4>
                    <p className="text-[10px] font-mono text-text-secondary leading-relaxed uppercase font-bold">
                      Incident Autopilot requires read-only access to your repositories and pipelines. We never write code to your main branch without your explicit approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "agents" && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <div className="coord-label -top-2 -left-2 bg-white px-1">// AGENT_CONFIG //</div>
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-6">AI Agents Configuration</h3>
                <div className="space-y-sp-4">
                  {[
                    { name: "Log Analyzer", desc: "Master switch for Agent 1", status: true },
                    { name: "Commit Bisector", desc: "Master switch for Agent 2", status: true },
                    { name: "Code Context Reader", desc: "Master switch for Agent 3", status: true },
                    { name: "Owner Finder", desc: "Master switch for Agent 4", status: true },
                    { name: "Recovery Planner", desc: "Master switch for Agent 5", status: true },
                    { name: "Action Executor", desc: "Master switch for Agent 6", status: true },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                      <div>
                        <p className="text-[11px] font-mono font-bold uppercase">{agent.name}</p>
                        <p className="text-[9px] font-mono text-text-muted uppercase">{agent.desc}</p>
                      </div>
                      <div className="flex items-center gap-sp-3">
                        <div 
                          className={cn(
                            "h-5 w-10 border border-blueprint relative transition-all cursor-pointer",
                            agent.status ? "bg-accent-neon" : "bg-bg-card"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 h-3.5 w-3.5 border border-blueprint bg-white transition-all",
                            agent.status ? "right-0.5" : "left-0.5"
                          )} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-blueprint bg-white p-sp-6 relative">
                <div className="coord-label -top-2 -left-2 bg-white px-1">// THRESHOLDS //</div>
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-6">Confidence Thresholds</h3>
                <div className="space-y-sp-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-2">
                      <span className="text-text-secondary">Min confidence to show findings</span>
                      <span className="text-ink">60%</span>
                    </div>
                    <div className="h-2 w-full bg-bg-surface border border-blueprint overflow-hidden relative">
                      <div className="absolute inset-0 bg-ink w-[60%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-2">
                      <span className="text-text-secondary">Auto-dismiss threshold</span>
                      <span className="text-text-muted">Never</span>
                    </div>
                    <div className="h-2 w-full bg-bg-surface border border-blueprint overflow-hidden relative">
                      <div className="absolute inset-0 bg-text-muted w-[0%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "flags" && (
            <div className="space-y-sp-6">
              <div className="border-blueprint bg-white p-sp-6 relative">
                <div className="coord-label -top-2 -left-2 bg-white px-1">// FEATURE_FLAGS //</div>
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-6">Dynamic Feature Toggles</h3>
                <div className="space-y-sp-4">
                  {(Object.keys(flags) as FeatureFlag[]).map((flag) => (
                    <div key={flag} className="flex items-center justify-between p-sp-4 bg-bg-surface border border-border">
                      <div>
                        <p className="text-[11px] font-mono font-bold uppercase">{featureFlagInfo[flag].name}</p>
                        <p className="text-[9px] font-mono text-text-muted uppercase font-bold">{featureFlagInfo[flag].desc}</p>
                        <code className="text-[8px] font-mono text-accent-purple mt-1 block">{flag}</code>
                      </div>
                      <div className="flex items-center gap-sp-3">
                        <div 
                          onClick={() => toggleFlag(flag)}
                          className={cn(
                            "h-5 w-10 border border-blueprint relative transition-all cursor-pointer",
                            flags[flag] ? "bg-accent-neon" : "bg-bg-card"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 h-3.5 w-3.5 border border-blueprint bg-white transition-all",
                            flags[flag] ? "right-0.5" : "left-0.5"
                          )} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-sp-4 border-blueprint bg-accent-neon/5 border-dashed">
                <div className="flex gap-sp-4">
                  <Flag className="h-5 w-5 text-accent-neon shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1">Dynamic Configuration</h4>
                    <p className="text-[10px] font-mono text-text-secondary leading-relaxed uppercase font-bold">
                      Feature flags allow you to test new functionality safely. Changes are applied immediately and persisted to your local session.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="border-blueprint bg-critical/5 p-sp-6 relative border-dashed">
              <div className="coord-label -top-2 -left-2 bg-bg-base px-1 text-critical font-bold">// DANGER_ZONE //</div>
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-critical mb-sp-6">Danger Zone</h3>
              <div className="space-y-sp-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase text-critical">Delete Account</p>
                    <p className="text-[9px] font-mono text-text-muted uppercase font-bold">Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                  <Button className="bg-critical text-white border border-blueprint h-8 px-4 text-[10px] font-bold uppercase tracking-tighter">Delete Account</Button>
                </div>
                <div className="h-px bg-critical/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase text-critical">Clear All Data</p>
                    <p className="text-[9px] font-mono text-text-muted uppercase font-bold">This will permanently delete all incident history and logs.</p>
                  </div>
                  <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase font-bold text-critical border-critical/50 hover:bg-critical/10">Clear Data</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
