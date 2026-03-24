import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Activity, ArrowRight, GitBranch, MoreHorizontal, Search, User } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { api, Incident } from "@/src/lib/api";
import { timeAgo } from "@/src/lib/format";

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const severities = ["ALL", "critical", "warning", "resolved", "info"];
  const statuses = ["ALL", "PENDING_APPROVAL", "ANALYZING", "RESOLVED", "DISMISSED", "ERROR"];
  const types = ["ALL", "CI/CD", "Runtime", "Infrastructure", "Database", "Performance"];

  useEffect(() => {
    api
      .listIncidents({ search: searchQuery || undefined, severity: severityFilter, status: statusFilter, limit: 200 })
      .then((resp) => {
        setIncidents(resp.items);
        setTotal(resp.total);
      })
      .catch(() => undefined);
  }, [searchQuery, severityFilter, statusFilter]);

  const filteredIncidents = useMemo(() => {
    if (typeFilter === "ALL") return incidents;
    return incidents.filter((incident) => (incident.type || "").toLowerCase() === typeFilter.toLowerCase());
  }, [incidents, typeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSeverityFilter("ALL");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const isFiltered = searchQuery !== "" || severityFilter !== "ALL" || statusFilter !== "ALL" || typeFilter !== "ALL";

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="coord-label -top-2 -left-2 bg-bg-base px-1">// INCIDENT_ARCHIVE //</div>

      <div className="flex flex-col gap-sp-4 mt-sp-1 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Incidents</h1>
            <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">Total_Count: {total} // Active: {incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "DISMISSED").length}</p>
          </div>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter">Manual Incident</Button>
        </div>

        <div className="flex flex-wrap items-end gap-sp-4 bg-bg-card p-sp-4 border border-border">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono font-bold uppercase text-text-muted tracking-widest">Severity</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-bg-base border border-border h-9 px-3 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink min-w-[140px] appearance-none cursor-pointer">
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono font-bold uppercase text-text-muted tracking-widest">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-bg-base border border-border h-9 px-3 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink min-w-[160px] appearance-none cursor-pointer">
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono font-bold uppercase text-text-muted tracking-widest">Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-bg-base border border-border h-9 px-3 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink min-w-[140px] appearance-none cursor-pointer">
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[240px]">
            <label className="text-[9px] font-mono font-bold uppercase text-text-muted tracking-widest">Search</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted group-focus-within:text-ink transition-colors" />
              <input type="text" placeholder="FILTER_BY_ID_SUMMARY..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-bg-base border border-border h-9 pl-9 pr-4 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink w-full" />
            </div>
          </div>

          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-3 text-[9px] font-mono font-bold uppercase text-critical hover:bg-critical/5">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-sp-4">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident, i) => (
            <motion.div key={incident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative border border-border bg-bg-card hover:shadow-[8px_8px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 transition-all">
              <div className="flex items-stretch">
                <div className={cn("w-1.5 shrink-0", incident.severity === "critical" ? "bg-critical" : incident.severity === "warning" ? "bg-warning" : incident.severity === "resolved" ? "bg-resolved" : "bg-info")} />

                <div className="flex-1 p-sp-4">
                  <div className="flex items-center justify-between mb-sp-3">
                    <div className="flex items-center gap-sp-3">
                      <span className="font-mono text-[10px] font-bold text-text-muted">#{incident.id}</span>
                      <Badge variant={(incident.severity || "info") as any} size="sm">
                        {incident.severity || "info"}
                      </Badge>
                      <div className="h-4 w-px bg-border" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary">{incident.type || "CI/CD"}</span>
                    </div>
                    <div className="flex items-center gap-sp-4">
                      <span className="font-mono text-[10px] font-bold text-text-muted uppercase">{timeAgo(incident.created_at || incident.triggered_at)}</span>
                      <MoreHorizontal className="h-4 w-4 text-text-muted cursor-pointer hover:text-ink" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold uppercase tracking-tighter mb-sp-4 group-hover:text-accent-purple transition-colors">{incident.title || incident.error_summary || `Incident ${incident.id}`}</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-sp-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase text-text-secondary">
                      <GitBranch className="h-3.5 w-3.5 text-text-muted" />
                      <span className="truncate">{incident.pipeline_ref || "main"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase text-text-secondary">
                      <Activity className="h-3.5 w-3.5 text-text-muted" />
                      <span>Status:</span>
                      <span className={cn("px-1.5 py-0.5 border border-blueprint", incident.status === "PENDING_APPROVAL" ? "text-warning bg-warning/5 border-warning" : incident.status === "RESOLVED" ? "text-resolved bg-resolved/5 border-resolved" : "text-ink")}>
                        {incident.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase text-text-secondary">
                      <User className="h-3.5 w-3.5 text-text-muted" />
                      <span>Owner:</span>
                      <span className="text-ink">@{incident.ownership?.primary_owner || "unassigned"}</span>
                    </div>
                    <div className="flex justify-end">
                      <Link to={`/incidents/${incident.id}`}>
                        <Button variant="ghost" size="sm" className="group/btn">
                          View Brief <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-sp-20 text-center border-2 border-dashed border-border bg-bg-card">
            <p className="font-mono text-[11px] font-bold text-text-muted uppercase tracking-widest">No incidents match current filters.</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-sp-8 flex items-center justify-between border-t border-border border-dashed">
        <div className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-[0.2em]">Showing {filteredIncidents.length} of {total} incidents</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Prev
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}