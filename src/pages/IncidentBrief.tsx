import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Share2, 
  X, 
  CheckCircle2, 
  Zap, 
  History, 
  Code, 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link, useParams, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const findings = [
  { 
    title: "1. Incident Summary", 
    color: "critical", 
    content: "A critical failure occurred in the api-service during the unit-test stage. The failure was triggered by a null pointer exception in the authentication middleware, preventing all user logins.",
    indicator: "ai"
  },
  { 
    title: "2. Error Classification", 
    color: "warning", 
    content: "Type: test_failure | Stage: test | Job: unit-tests | Confidence: 97%",
    indicator: "confidence",
    confidence: 97
  },
  { 
    title: "3. Breaking Commit", 
    color: "agent", 
    content: "Commit a1b2c3d: 'feat: add OAuth refresh' by @john.doe (4 minutes ago). This commit introduced the breaking change in src/middleware/auth.ts.",
    indicator: "confidence",
    confidence: 94
  },
  { 
    title: "4. Code Root Cause", 
    color: "agent", 
    content: "The breaking change is at line 42 of auth.ts, where a new property is accessed without a null check. AI Hypothesis: The property 'user.profile' is undefined for guest users.",
    indicator: "ai"
  },
  { 
    title: "5. Owner", 
    color: "info", 
    content: "@john.doe has 47 commits to this module in the last 90 days. Expertise score: 9.2/10.",
    indicator: "confidence",
    confidence: 87
  },
  { 
    title: "6. Recovery Plan", 
    color: "ai", 
    content: "1. Rollback commit a1b2c3d\n2. Create GitLab issue with root cause analysis\n3. Notify @john.doe for manual fix",
    indicator: "ai"
  },
  { 
    title: "7. Impact Assessment", 
    color: "critical", 
    content: "Affected services: api-service, web-client. User impact: 100% of login attempts failing. Blast radius: High.",
    indicator: "ai"
  },
];

export default function IncidentBrief() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-bg-base bg-grid-dots relative">
      <div className="coord-label top-4 left-4">// INCIDENT_BRIEF_ID: {id || "1042"} //</div>
      
      {/* Header */}
      <header className="p-sp-12 border-b border-border bg-bg-card flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-sp-12">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="font-mono text-[10px] uppercase font-bold text-text-muted hover:text-ink">
              <ArrowLeft className="mr-2 h-3 w-3" /> Back_to_Incidents
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-sp-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-tighter leading-none">Incident #{id || "1042"}</h2>
            <Badge variant="critical" size="md">CRITICAL</Badge>
            <Badge variant="warning" size="md" pulse>PENDING_APPROVAL</Badge>
          </div>
          <div className="flex items-center gap-sp-2 text-[9px] font-mono text-text-muted uppercase font-bold tracking-widest">
            <span>api-service</span>
            <span className="text-border">/</span>
            <span>main</span>
            <span className="text-border">/</span>
            <span>job: unit-tests</span>
          </div>
        </div>

        <div className="flex items-center gap-sp-3">
          <Button variant="outline" size="sm" className="font-mono text-[10px] uppercase font-bold border-blueprint">
            <Share2 className="mr-2 h-3 w-3" /> Share
          </Button>
          <Button variant="ghost" size="sm" className="font-mono text-[10px] uppercase font-bold text-text-muted hover:text-critical">
            <X className="mr-2 h-3 w-3" /> Dismiss
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex gap-sp-12 p-sp-12 overflow-hidden relative">
        {/* Left Column: AI Findings */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-sp-12">
          {findings.map((finding, i) => (
            <motion.div
              key={finding.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn(
                "border-blueprint bg-white relative overflow-hidden group",
                finding.color === "critical" && "border-l-[6px] border-l-critical",
                finding.color === "warning" && "border-l-[6px] border-l-warning",
                finding.color === "agent" && "border-l-[6px] border-l-accent-purple",
                finding.color === "ai" && "border-l-[6px] border-l-ink",
                finding.color === "info" && "border-l-[6px] border-l-resolved",
              )}>
                <div className="flex items-center justify-between mb-sp-4">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">{finding.title}</h3>
                  {finding.indicator === "ai" ? (
                    <Badge variant="ai">Claude_3.5_Sonnet</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-text-muted uppercase font-bold">Confidence</span>
                      <Badge variant={finding.confidence! > 90 ? "resolved" : "warning"}>
                        {finding.confidence}%
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-mono text-ink leading-relaxed whitespace-pre-line uppercase font-bold">
                  {finding.content}
                </div>
                {finding.confidence && (
                  <div className="mt-sp-4 h-1.5 w-full bg-bg-surface border border-blueprint overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${finding.confidence}%` }}
                      className={cn("h-full", finding.confidence > 90 ? "bg-resolved" : "bg-warning")}
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
          
          {/* Timeline */}
          <div className="pt-sp-16 pb-sp-16">
            <div className="flex items-center gap-sp-6 mb-sp-12">
              <div className="coord-label relative top-0 left-0">// AGENT_TIMELINE //</div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tighter">Agent Timeline</h3>
            </div>
            <div className="space-y-sp-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border before:border-dashed before:border-ink/20">
              {[
                { time: "10:42:01", agent: "Log Analyzer", action: "Detected pipeline failure in api-service", color: "critical" },
                { time: "10:42:15", agent: "Commit Bisector", action: "Identified 3 potential breaking commits", color: "warning" },
                { time: "10:42:45", agent: "Code Context Reader", action: "Analyzed diff for commit a1b2c3d", color: "accent-purple" },
                { time: "10:43:12", agent: "Recovery Planner", action: "Generated rollback plan", color: "ink" },
              ].map((item, i) => (
                <div key={i} className="flex gap-sp-6 relative">
                  <div className={cn("h-6 w-6 border-blueprint bg-white z-10 shrink-0 flex items-center justify-center", `border-${item.color}`)}>
                    <div className={cn("h-2 w-2", `bg-${item.color}`)} />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-text-muted mb-1 uppercase font-bold tracking-widest">{item.time}</p>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-ink">{item.agent}</p>
                    <p className="text-[10px] font-mono text-text-secondary uppercase font-bold">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Approval Card */}
        <div className="w-[400px] shrink-0">
          <div className="sticky top-0 space-y-sp-12">
            <div className="border-blueprint bg-ink text-white p-sp-12 relative shadow-[8px_8px_0px_rgba(204,255,0,0.3)]">
              <div className="coord-label -top-2 -left-2 bg-ink text-white px-1">// SUPERVISED_APPROVAL //</div>
              <div className="flex items-center gap-sp-3 mb-sp-4">
                <div className="h-8 w-8 border border-accent-neon bg-accent-neon flex items-center justify-center">
                  <Zap className="h-5 w-5 text-ink" />
                </div>
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-neon">Ready_to_Act</h3>
              </div>
              
              <div className="space-y-sp-4 mb-sp-8">
                <div className="p-sp-3 bg-white/5 border border-white/20">
                  <p className="text-[9px] text-white/40 uppercase font-bold mb-1 tracking-widest">Action_Planned</p>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-neon shrink-0 mt-0.5" />
                    <p className="text-[10px] font-mono uppercase font-bold">Create GitLab Issue + Assign to @john.doe</p>
                  </div>
                </div>
                
                <div className="p-sp-3 bg-white/5 border border-white/20">
                  <p className="text-[9px] text-white/40 uppercase font-bold mb-1 tracking-widest">Recovery_Step</p>
                  <div className="flex items-start gap-2">
                    <History className="h-4 w-4 text-accent-neon shrink-0 mt-0.5" />
                    <p className="text-[10px] font-mono uppercase font-bold">Rollback commit a1b2c3d in main branch</p>
                  </div>
                </div>
              </div>

              <div className="space-y-sp-3">
                <Button className="w-full btn-neon h-12 text-[12px] font-bold uppercase tracking-widest">
                  Approve & Execute <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 hover:text-critical">
                  <X className="mr-2 h-4 w-4" /> Dismiss Incident
                </Button>
              </div>

              <p className="mt-sp-6 text-[8px] font-mono text-white/30 uppercase text-center">
                No action has been taken. Your approval is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
