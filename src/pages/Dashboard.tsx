import { motion } from "motion/react";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  Search, 
  ArrowRight, 
  Activity, 
  Zap, 
  History, 
  Code, 
  Users, 
  TrendingUp, 
  ExternalLink,
  Database,
  ChevronRight,
  Terminal,
  Cpu,
  ShieldAlert
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useFeatureFlags } from "@/src/contexts/FeatureFlagContext";

const incidents = [
  { 
    id: "1042", 
    title: "Pipeline failure — api-service — test stage", 
    severity: "critical", 
    status: "PENDING APPROVAL", 
    time: "3 min ago", 
    repo: "org/api-service", 
    branch: "main", 
    commit: "a1b2c3d", 
    owner: "@john.doe", 
    progress: 4, 
    totalAgents: 6 
  },
  { 
    id: "1041", 
    title: "High error rate — auth-service — production", 
    severity: "warning", 
    status: "ANALYZING", 
    time: "12 min ago", 
    repo: "org/auth-service", 
    branch: "v2.1-stable", 
    commit: "f4e5d6c", 
    owner: "@jane.smith", 
    progress: 2, 
    totalAgents: 6 
  },
  { 
    id: "1040", 
    title: "Memory leak — worker-node — staging", 
    severity: "resolved", 
    status: "RESOLVED", 
    time: "1h ago", 
    repo: "org/worker-node", 
    branch: "feature/new-queue", 
    commit: "b7a8c9d", 
    owner: "@bob.wilson", 
    progress: 6, 
    totalAgents: 6 
  },
];

const stats = [
  { label: "Active Incidents", value: "2", sub: "1 Critical", color: "critical" },
  { label: "Pending Approval", value: "1", sub: "Awaiting 1-tap", color: "warning" },
  { label: "Agents Running", value: "6", sub: "Parallel analysis", color: "agent" },
  { label: "MTTR (30d)", value: "87s", sub: "Avg resolution", color: "resolved" },
];

export default function Dashboard() {
  const { isFeatureEnabled } = useFeatureFlags();
  const showDevTools = isFeatureEnabled('SHOW_DEVELOPER_TOOLS');

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">System Overview</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">Status: Operational // Active_Agents: 6</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <Button variant="outline" size="sm">
            <History className="mr-2 h-3 w-3" /> Event Log
          </Button>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter">
            <Zap className="mr-2 h-3.5 w-3.5" /> Force Scan
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sp-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-border bg-bg-card p-sp-4 relative group hover:shadow-[8px_8px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            <div className="text-[10px] font-mono font-bold text-text-muted uppercase mb-1 tracking-widest">{stat.label}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-display font-black text-ink">{stat.value}</div>
              <Badge 
                variant={stat.color as any} 
                className={cn(
                  "border-blueprint",
                  stat.color === "critical" && "border-critical",
                  stat.color === "warning" && "border-warning",
                  stat.color === "agent" && "border-accent-purple",
                  stat.color === "resolved" && "border-resolved"
                )}
              >
                {stat.sub}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-sp-4 flex-1 min-h-0">
        {/* Active Incidents Feed */}
        <div className="lg:col-span-2 flex flex-col gap-sp-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-sp-2">
              <Activity className="h-4 w-4 text-accent-purple" />
              <h2 className="font-display text-lg font-bold uppercase tracking-tighter italic">Active Incidents</h2>
            </div>
            <Link to="/incidents">
              <Button variant="ghost" size="sm" className="text-[9px] h-7">View All <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Link>
          </div>

          <div className="flex flex-col gap-sp-3 overflow-y-auto pr-2 custom-scrollbar">
            {incidents.map((incident, i) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative border border-border bg-bg-card p-sp-3 hover:bg-bg-surface transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-accent-purple"
              >
                <div className="flex items-center justify-between mb-sp-1">
                  <div className="flex items-center gap-sp-2">
                    <Badge variant={incident.severity as any} size="sm" className="h-4 text-[8px]">{incident.severity}</Badge>
                    <span className="font-mono text-[9px] font-bold text-text-muted">ID_{incident.id}</span>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-text-muted uppercase italic">{incident.time}</span>
                </div>
                <h3 className="font-display text-base font-bold uppercase tracking-tighter mb-sp-2 group-hover:text-accent-purple transition-colors truncate">{incident.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sp-3 text-[9px] font-mono font-bold text-text-secondary uppercase">
                    <span className="flex items-center gap-1 opacity-70"><Database className="h-3 w-3" /> {incident.repo}</span>
                    <span className="flex items-center gap-1 opacity-70"><Users className="h-3 w-3" /> {incident.owner}</span>
                  </div>
                  <Link to={`/incidents/${incident.id}`}>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-[8px] font-bold uppercase">Analyze</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Health & Agents */}
        <div className="flex flex-col gap-sp-4">
          <div className="border border-border bg-bg-card p-sp-4 relative">
            <div className="coord-label -top-2 -right-2 bg-bg-card px-1">// HEALTH_INDEX //</div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-sp-4 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-resolved" /> Cluster Integrity
            </h3>
            <div className="space-y-sp-3">
              {[
                { label: "API_GATEWAY", value: 98, status: "healthy" },
                { label: "AUTH_SERVICE", value: 84, status: "warning" },
                { label: "DB_CLUSTER", value: 99, status: "healthy" },
                { label: "WORKER_NODES", value: 92, status: "healthy" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[9px] font-mono font-bold uppercase mb-1">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className={cn(item.status === "warning" ? "text-warning" : "text-resolved")}>{item.value}%</span>
                  </div>
                  <div className="h-1 w-full bg-border/10 overflow-hidden relative">
                    <div className={cn(
                      "absolute inset-0",
                      item.status === "warning" ? "bg-warning" : "bg-resolved"
                    )} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-bg-card p-sp-4 relative flex-1">
            <div className="coord-label -top-2 -right-2 bg-bg-card px-1">// AGENT_POOL //</div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-sp-4 flex items-center gap-2">
              <Zap className="h-3 w-3 text-accent-neon" /> Active Agents
            </h3>
            <div className="space-y-sp-2">
              {[
                "LOG_ANALYZER_V4",
                "COMMIT_BISECTOR_X",
                "CONTEXT_READER_S1",
                "OWNER_INDEXER",
                "RECOVERY_STRATEGIST",
                "ACTION_EXECUTOR"
              ].map((agent) => (
                <div key={agent} className="flex items-center justify-between p-sp-2 border border-blueprint bg-bg-surface">
                  <span className="text-[9px] font-mono font-bold uppercase text-ink">{agent}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-resolved animate-pulse" />
                    <span className="text-[8px] font-mono font-bold text-resolved uppercase">Active</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-sp-4 text-[9px] border border-blueprint">
              Manage Agents <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Developer Tools Panel */}
      {showDevTools && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-2 border-accent-purple bg-accent-purple/5 p-sp-4 relative overflow-hidden"
        >
          <div className="coord-label -top-2 -left-2 bg-accent-purple text-white px-2 font-mono text-[9px] font-bold uppercase tracking-widest">
            // DEV_TOOLS_ACTIVE //
          </div>
          <div className="flex items-center justify-between mb-sp-4">
            <div className="flex items-center gap-sp-3">
              <Terminal className="h-4 w-4 text-accent-purple" />
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-purple">System Debug Console</h3>
            </div>
            <div className="flex items-center gap-sp-4 text-[9px] font-mono font-bold uppercase text-text-secondary">
              <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU: 12%</span>
              <span className="flex items-center gap-1"><Database className="h-3 w-3" /> MEM: 1.2GB</span>
              <span className="flex items-center gap-1 text-resolved"><ShieldAlert className="h-3 w-3" /> SEC_OK</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-sp-4">
            <div className="bg-ink p-sp-3 font-mono text-[9px] text-accent-neon leading-relaxed h-32 overflow-y-auto custom-scrollbar border border-accent-purple/30">
              <p>[19:01:09] INF: Initializing agent_pool_v4...</p>
              <p>[19:01:10] INF: WebSocket connected to cluster_01</p>
              <p>[19:01:12] WRN: Latency spike detected in auth_service</p>
              <p>[19:01:15] INF: LogAnalyzer starting analysis on ID_1042</p>
              <p>[19:01:18] INF: Feature flags synchronized with local_storage</p>
              <p>[19:01:22] DBG: Memory allocation for worker_node_03 optimized</p>
              <p>[19:01:25] INF: System state: OPERATIONAL</p>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-sp-3">
              <div className="border border-accent-purple/30 p-sp-3 bg-white/50">
                <p className="text-[9px] font-mono font-bold uppercase text-text-muted mb-2">Active Context</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-mono uppercase"><span>Session_ID</span><span className="text-ink">AS_9921_X</span></div>
                  <div className="flex justify-between text-[8px] font-mono uppercase"><span>User_Role</span><span className="text-ink">SRE_ENG_01</span></div>
                  <div className="flex justify-between text-[8px] font-mono uppercase"><span>Env_Target</span><span className="text-ink">PROD_CLUSTER</span></div>
                </div>
              </div>
              <div className="border border-accent-purple/30 p-sp-3 bg-white/50">
                <p className="text-[9px] font-mono font-bold uppercase text-text-muted mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-6 text-[8px] border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10">Flush Cache</Button>
                  <Button variant="outline" className="h-6 text-[8px] border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10">Reset State</Button>
                  <Button variant="outline" className="h-6 text-[8px] border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10">Dump Logs</Button>
                  <Button variant="outline" className="h-6 text-[8px] border-accent-purple/50 text-accent-purple hover:bg-accent-purple/10">Kill Agents</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
