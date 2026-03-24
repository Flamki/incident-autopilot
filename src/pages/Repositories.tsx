import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  GitBranch, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Zap,
  History,
  ArrowRight
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const repos = [
  { 
    name: "org/api-service", 
    status: "healthy", 
    branch: "main", 
    lastCommit: "a1b2c3d", 
    lastCommitTime: "3 min ago", 
    health: 98,
    activeIncidents: 1,
    agents: 6,
    type: "Backend"
  },
  { 
    name: "org/auth-service", 
    status: "warning", 
    branch: "v2.1-stable", 
    lastCommit: "f4e5d6c", 
    lastCommitTime: "12 min ago", 
    health: 84,
    activeIncidents: 1,
    agents: 4,
    type: "Auth"
  },
  { 
    name: "org/worker-node", 
    status: "healthy", 
    branch: "main", 
    lastCommit: "b7a8c9d", 
    lastCommitTime: "1h ago", 
    health: 99,
    activeIncidents: 0,
    agents: 2,
    type: "Worker"
  },
  { 
    name: "org/web-client", 
    status: "healthy", 
    branch: "main", 
    lastCommit: "e1f2g3h", 
    lastCommitTime: "2h ago", 
    health: 96,
    activeIncidents: 0,
    agents: 3,
    type: "Frontend"
  },
  { 
    name: "org/db-proxy", 
    status: "critical", 
    branch: "main", 
    lastCommit: "i9j0k1l", 
    lastCommitTime: "4h ago", 
    health: 42,
    activeIncidents: 1,
    agents: 8,
    type: "Database"
  },
];

export default function Repositories() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepos = useMemo(() => {
    return repos.filter(repo => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Repositories</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">Total_Connected: 12 // Avg_Health: 84%</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted group-focus-within:text-ink transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH_REPOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-card border border-border h-9 pl-9 pr-4 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-3 w-3" /> Sync
          </Button>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter">
            <Plus className="mr-2 h-3.5 w-3.5" /> Add Repo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sp-6">
        {filteredRepos.length > 0 ? (
          filteredRepos.map((repo, i) => (
            <motion.div
              key={repo.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border bg-bg-card p-sp-6 relative group hover:shadow-[12px_12px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-sp-4">
                <div className="h-10 w-10 border border-border bg-bg-surface flex items-center justify-center group-hover:bg-accent-neon group-hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all">
                  <Database className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-sp-2">
                  <Badge variant={repo.status === "healthy" ? "resolved" : repo.status === "warning" ? "warning" : "critical"} size="sm">
                    {repo.status}
                  </Badge>
                  <MoreVertical className="h-4 w-4 text-text-muted cursor-pointer hover:text-ink" />
                </div>
              </div>

              <h3 className="font-display text-xl font-bold uppercase tracking-tighter mb-sp-2 italic">{repo.name}</h3>
              <div className="font-mono text-[10px] font-bold text-text-muted uppercase mb-sp-6 tracking-widest">{repo.type} // {repo.branch}</div>

              <div className="space-y-sp-4 mb-sp-6">
                <div>
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-1.5">
                    <span className="text-text-secondary">Health Index</span>
                    <span className={cn(
                      repo.health > 90 ? "text-resolved" : repo.health > 70 ? "text-warning" : "text-critical"
                    )}>{repo.health}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/10 overflow-hidden relative">
                    <div className={cn(
                      "absolute inset-0 transition-all duration-1000",
                      repo.health > 90 ? "bg-resolved" : repo.health > 70 ? "bg-warning" : "bg-critical"
                    )} style={{ width: `${repo.health}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sp-4">
                  <div className="p-sp-2 border border-border bg-bg-surface">
                    <div className="text-[9px] font-mono text-text-muted uppercase font-bold mb-1">Incidents</div>
                    <div className="text-lg font-display font-bold text-ink">{repo.activeIncidents}</div>
                  </div>
                  <div className="p-sp-2 border border-border bg-bg-surface">
                    <div className="text-[9px] font-mono text-text-muted uppercase font-bold mb-1">Agents</div>
                    <div className="text-lg font-display font-bold text-ink">{repo.agents}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-sp-4 border-t border-border border-dashed">
                <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-text-muted uppercase">
                  <History className="h-3 w-3" /> {repo.lastCommitTime}
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px]">
                  View Specs <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-sp-20 text-center border-2 border-dashed border-border bg-bg-card">
            <p className="font-mono text-[11px] font-bold text-text-muted uppercase tracking-widest">No_Repositories_Match_Query_"{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
