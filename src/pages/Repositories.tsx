import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Database, MoreVertical, Plug, RefreshCw, Search } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/lib/utils";
import { api, GitLabProjectSummary, Repository } from "@/src/lib/api";

export default function Repositories() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState("");
  const [discoveredProjects, setDiscoveredProjects] = useState<GitLabProjectSummary[]>([]);
  const [connectingProjectId, setConnectingProjectId] = useState<number | null>(null);

  const loadRepos = () => {
    api.listRepos().then(setRepos).catch(() => undefined);
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const filteredRepos = useMemo(() => {
    return repos.filter(
      (repo) =>
        repo.project_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.branch || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [repos, searchQuery]);

  const discoverProjects = async () => {
    setDiscoverError("");
    setDiscovering(true);
    try {
      const projects = await api.discoverRepos(discoverQuery);
      setDiscoveredProjects(projects);
      if (projects.length === 0) {
        setDiscoverError("No GitLab repositories found for this query.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch repositories from GitLab.";
      setDiscoverError(message);
      setDiscoveredProjects([]);
    } finally {
      setDiscovering(false);
    }
  };

  const connectProject = async (project: GitLabProjectSummary) => {
    setConnectingProjectId(project.id);
    setDiscoverError("");
    try {
      await api.createRepo({
        gitlab_project_id: project.id,
        project_path: project.path_with_namespace,
        project_name: project.name,
        project_url: project.web_url || undefined,
        branch: project.default_branch || "main",
        type: "Service",
      });
      await loadRepos();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect repository.";
      setDiscoverError(message);
    } finally {
      setConnectingProjectId(null);
    }
  };

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Repositories</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">Total_Connected: {repos.length}</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted group-focus-within:text-ink transition-colors" />
            <input
              type="text"
              placeholder="SEARCH_CONNECTED_REPOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-card border border-border h-9 pl-9 pr-4 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadRepos}>
            <RefreshCw className="mr-2 h-3 w-3" /> Sync
          </Button>
        </div>
      </div>

      <div className="border border-border bg-bg-card p-sp-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-sp-3">
          <input
            type="text"
            value={discoverQuery}
            onChange={(e) => setDiscoverQuery(e.target.value)}
            placeholder="SEARCH_GITLAB_PROJECTS (OPTIONAL)..."
            className="flex-1 bg-bg-surface border border-border h-10 px-3 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink"
          />
          <Button className="btn-neon h-10 px-4 text-[10px] font-bold uppercase tracking-tighter" onClick={discoverProjects} disabled={discovering}>
            <Plug className="mr-2 h-3.5 w-3.5" /> {discovering ? "Loading..." : "Find GitLab Repos"}
          </Button>
        </div>

        {!!discoverError && (
          <div className="mt-sp-3 text-[10px] font-mono font-bold uppercase text-critical border border-critical/30 bg-critical/5 px-3 py-2">
            {discoverError}
          </div>
        )}

        {discoveredProjects.length > 0 && (
          <div className="mt-sp-4 grid grid-cols-1 xl:grid-cols-2 gap-sp-3">
            {discoveredProjects.map((project) => (
              <div key={project.id} className="border border-border bg-bg-surface p-sp-3 flex items-center justify-between gap-sp-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase font-bold text-text-muted truncate">#{project.id}</p>
                  <p className="font-display text-lg font-bold tracking-tighter truncate">{project.path_with_namespace}</p>
                  <p className="font-mono text-[10px] uppercase text-text-muted truncate">
                    Branch: {project.default_branch || "main"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-8 text-[9px]"
                  onClick={() => connectProject(project)}
                  disabled={connectingProjectId === project.id}
                >
                  {connectingProjectId === project.id ? "Connecting..." : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sp-6">
        {filteredRepos.length > 0 ? (
          filteredRepos.map((repo, i) => (
            <motion.div
              key={repo.id}
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
                  <Badge variant={(repo.health || 100) >= 90 ? "resolved" : (repo.health || 100) >= 70 ? "warning" : "critical"} size="sm">
                    {(repo.health || 100) >= 90 ? "healthy" : (repo.health || 100) >= 70 ? "warning" : "critical"}
                  </Badge>
                  <MoreVertical className="h-4 w-4 text-text-muted cursor-pointer hover:text-ink" />
                </div>
              </div>

              <h3 className="font-display text-xl font-bold uppercase tracking-tighter mb-sp-2 italic">{repo.project_path}</h3>
              <div className="font-mono text-[10px] font-bold text-text-muted uppercase mb-sp-6 tracking-widest">
                {repo.type || "Service"} // {repo.branch || "main"}
              </div>

              <div className="space-y-sp-4 mb-sp-6">
                <div>
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-1.5">
                    <span className="text-text-secondary">Health Index</span>
                    <span className={cn((repo.health || 100) > 90 ? "text-resolved" : (repo.health || 100) > 70 ? "text-warning" : "text-critical")}>{repo.health || 100}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/10 overflow-hidden relative">
                    <div className={cn("absolute inset-0 transition-all duration-1000", (repo.health || 100) > 90 ? "bg-resolved" : (repo.health || 100) > 70 ? "bg-warning" : "bg-critical")} style={{ width: `${repo.health || 100}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sp-4">
                  <div className="p-sp-2 border border-border bg-bg-surface">
                    <div className="text-[9px] font-mono text-text-muted uppercase font-bold mb-1">Incidents</div>
                    <div className="text-lg font-display font-bold text-ink">{repo.active_incidents || 0}</div>
                  </div>
                  <div className="p-sp-2 border border-border bg-bg-surface">
                    <div className="text-[9px] font-mono text-text-muted uppercase font-bold mb-1">Agents</div>
                    <div className="text-lg font-display font-bold text-ink">{repo.agents || 0}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-sp-4 border-t border-border border-dashed">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[9px]"
                  onClick={async () => {
                    await api.testRepo(repo.id);
                  }}
                >
                  Test Connection <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[9px]"
                  onClick={async () => {
                    await api.deleteRepo(repo.id);
                    loadRepos();
                  }}
                >
                  Disconnect
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-sp-20 text-center border-2 border-dashed border-border bg-bg-card">
            <p className="font-mono text-[11px] font-bold text-text-muted uppercase tracking-widest">No connected repositories match query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
