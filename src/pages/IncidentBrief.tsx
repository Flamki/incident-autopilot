import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ExternalLink, History, Share2, X } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { api, AgentRun, Incident } from "@/src/lib/api";

export default function IncidentBrief() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [isRunningAgents, setIsRunningAgents] = useState(false);

  const loadIncident = async (incidentId: string) => {
    const [incidentResp, runsResp] = await Promise.all([api.getIncident(incidentId), api.incidentAgents(incidentId)]);
    setIncident(incidentResp);
    setAgentRuns(runsResp);
  };

  useEffect(() => {
    if (!id) return;
    loadIncident(id).catch(() => undefined);
  }, [id]);

  const findings = useMemo(() => {
    if (!incident) return [];
    return [
      {
        title: "1. Incident Summary",
        color: "critical",
        content: incident.error_summary || "Analysis is in progress.",
      },
      {
        title: "2. Error Classification",
        color: "warning",
        content: `Type: ${incident.error_type || "unknown"} | Status: ${incident.status} | Severity: ${incident.severity}`,
      },
      {
        title: "3. Breaking Commit",
        color: "agent",
        content:
          incident.breaking_commit?.breaking_commit_sha
            ? `Commit ${incident.breaking_commit.breaking_commit_sha}: ${incident.breaking_commit.commit_message || "(no message)"}`
            : "No breaking commit identified yet.",
      },
      {
        title: "4. Code Root Cause",
        color: "agent",
        content: incident.code_context?.root_cause_hypothesis || "No code context available yet.",
      },
      {
        title: "5. Owner",
        color: "info",
        content: incident.ownership?.primary_owner ? `@${incident.ownership.primary_owner} (expertise ${incident.ownership.expertise_score || "n/a"})` : "Owner not assigned yet.",
      },
      {
        title: "6. Recovery Plan",
        color: "ai",
        content: Array.isArray(incident.recovery_plan?.steps)
          ? incident.recovery_plan.steps.join("\n")
          : incident.recovery_plan?.reasoning || "Recovery plan pending.",
      },
    ];
  }, [incident]);

  const handleApprove = async () => {
    if (!id) return;
    const updated = await api.approveIncident(id);
    setIncident(updated);
  };

  const handleDismiss = async () => {
    if (!id) return;
    const updated = await api.dismissIncident(id, "Dismissed by operator");
    setIncident(updated);
  };

  const handleRunAgents = async () => {
    if (!id) return;
    setIsRunningAgents(true);
    try {
      const updated = await api.runIncidentAgents(id);
      setIncident(updated);
      await loadIncident(id);
    } finally {
      setIsRunningAgents(false);
    }
  };

  if (!incident) {
    return <div className="p-sp-8 font-mono text-[11px] uppercase text-text-muted">Loading incident brief...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-bg-base bg-grid-dots relative">
      <div className="coord-label top-4 left-4">// INCIDENT_BRIEF_ID: {id} //</div>

      <header className="p-sp-12 border-b border-border bg-bg-card flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-sp-12">
          <Link to="/incidents">
            <Button variant="ghost" size="sm" className="font-mono text-[10px] uppercase font-bold text-text-muted hover:text-ink">
              <ArrowLeft className="mr-2 h-3 w-3" /> Back_to_Incidents
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-sp-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tighter leading-none">Incident #{id}</h2>
            <Badge variant={(incident.severity || "warning") as any} size="md">
              {(incident.severity || "warning").toUpperCase()}
            </Badge>
            <Badge variant="warning" size="md" pulse>
              {incident.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-sp-3">
          <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase font-bold border-blueprint">
            <Share2 className="mr-2 h-3 w-3" /> Share
          </Button>
          <Button variant="ghost" size="sm" className="font-mono text-[10px] uppercase font-bold text-text-muted hover:text-critical" onClick={handleDismiss}>
            <X className="mr-2 h-3 w-3" /> Dismiss
          </Button>
        </div>
      </header>

      <div className="flex-1 flex gap-sp-12 p-sp-12 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-sp-12">
          {findings.map((finding, i) => (
            <motion.div key={finding.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card
                className={cn(
                  "border-blueprint bg-white relative overflow-hidden group p-sp-6",
                  finding.color === "critical" && "border-l-[6px] border-l-critical",
                  finding.color === "warning" && "border-l-[6px] border-l-warning",
                  finding.color === "agent" && "border-l-[6px] border-l-accent-purple",
                  finding.color === "ai" && "border-l-[6px] border-l-ink",
                  finding.color === "info" && "border-l-[6px] border-l-resolved",
                )}
              >
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mb-sp-3">{finding.title}</h3>
                <div className="text-[11px] font-mono text-ink leading-relaxed whitespace-pre-line uppercase font-bold">{finding.content}</div>
              </Card>
            </motion.div>
          ))}

          <div className="pt-sp-8 pb-sp-16">
            <h3 className="font-display text-xl font-bold uppercase tracking-tighter mb-sp-6">Agent Timeline</h3>
            <div className="space-y-sp-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border before:border-dashed before:border-ink/20">
              {agentRuns.map((run) => (
                <div key={run.id} className="flex gap-sp-6 relative">
                  <div className="h-6 w-6 border-blueprint bg-white z-10 shrink-0 flex items-center justify-center border-accent-purple">
                    <div className={cn("h-2 w-2", run.status === "completed" ? "bg-resolved" : run.status === "failed" ? "bg-critical" : "bg-warning")} />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-text-muted mb-1 uppercase font-bold tracking-widest">{run.started_at || "--"}</p>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-ink">{run.agent_name}</p>
                    <p className="text-[10px] font-mono text-text-secondary uppercase font-bold">status: {run.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[380px] shrink-0">
          <div className="sticky top-0 space-y-sp-12">
            <div className="border-blueprint bg-ink text-white p-sp-12 relative shadow-[8px_8px_0px_rgba(204,255,0,0.3)]">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-neon mb-sp-4">Ready_to_Act</h3>
              <div className="space-y-sp-4 mb-sp-8">
                <div className="p-sp-3 bg-white/5 border border-white/20">
                  <p className="text-[9px] text-white/40 uppercase font-bold mb-1 tracking-widest">Recovery Recommendation</p>
                  <p className="text-[10px] font-mono uppercase font-bold">{incident.recovery_plan?.recommendation || "pending"}</p>
                </div>
                <div className="p-sp-3 bg-white/5 border border-white/20">
                  <p className="text-[9px] text-white/40 uppercase font-bold mb-1 tracking-widest">GitLab Issue</p>
                  <p className="text-[10px] font-mono uppercase font-bold break-all">{incident.gitlab_issue_url || "will be created on approval"}</p>
                </div>
              </div>

              <div className="space-y-sp-3">
                <Button variant="outline" className="w-full text-[10px] font-mono font-bold uppercase tracking-widest" onClick={handleRunAgents} disabled={isRunningAgents}>
                  {isRunningAgents ? "Running Agents..." : "Run Agent Chain"}
                </Button>
                <Button className="w-full btn-neon h-12 text-[12px] font-bold uppercase tracking-widest" onClick={handleApprove}>
                  Approve & Execute <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
                {incident.gitlab_issue_url && (
                  <Button variant="outline" className="w-full text-[10px] font-mono font-bold uppercase tracking-widest" onClick={() => window.open(incident.gitlab_issue_url!, "_blank")}>
                    Open Issue <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" className="w-full text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-critical" onClick={handleDismiss}>
                  <X className="mr-2 h-4 w-4" /> Dismiss Incident
                </Button>
              </div>

              <p className="mt-sp-6 text-[8px] font-mono text-white/30 uppercase text-center">No automated action happens without explicit approval.</p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => navigate("/incidents")}> 
              <History className="mr-2 h-4 w-4" /> Back to Incident List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
