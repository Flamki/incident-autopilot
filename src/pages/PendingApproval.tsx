import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, ExternalLink, History, MessageSquare, ShieldCheck, XCircle, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link } from "react-router-dom";
import { api, Incident } from "@/src/lib/api";
import { timeAgo } from "@/src/lib/format";

export default function PendingApproval() {
  const [items, setItems] = useState<Incident[]>([]);

  const load = () => {
    api.listIncidents({ status: "PENDING_APPROVAL", limit: 100 }).then((resp) => setItems(resp.items)).catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Pending Approval</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">Awaiting_Human_Intervention: {items.length}</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <Button variant="outline" size="sm">
            <History className="mr-2 h-3 w-3" /> History
          </Button>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter" onClick={async () => {
            for (const item of items) {
              await api.approveIncident(item.id);
            }
            load();
          }}>
            Approve All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-sp-8">
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="border-2 border-ink bg-bg-card shadow-[12px_12px_0px_var(--color-border)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-warning" />

            <div className="p-sp-6">
              <div className="flex items-center justify-between mb-sp-6">
                <div className="flex items-center gap-sp-4">
                  <Badge variant="warning" size="md">PENDING_APPROVAL</Badge>
                  <span className="font-mono text-[11px] font-bold text-text-muted">#{item.id}</span>
                  <div className="h-4 w-px bg-border" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">{item.pipeline_ref || "main"}</span>
                </div>
                <div className="flex items-center gap-sp-2 text-[11px] font-mono font-bold text-text-muted">
                  <Clock className="h-3.5 w-3.5" /> {timeAgo(item.created_at || item.triggered_at)}
                </div>
              </div>

              <h2 className="font-display text-2xl font-bold uppercase tracking-tighter mb-sp-6 italic">{item.title || item.error_summary || `Incident ${item.id}`}</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-sp-6 mb-sp-8">
                <div className="p-sp-4 border border-border bg-bg-surface relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-accent-purple" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Confidence Score</span>
                  </div>
                  <div className="text-3xl font-display font-black text-ink">{Math.round((item.pipeline_analysis?.confidence || 0.8) * 100)}%</div>
                  <div className="mt-2 h-1.5 w-full bg-border/20 overflow-hidden relative">
                    <div className="absolute inset-0 bg-accent-purple" style={{ width: `${Math.round((item.pipeline_analysis?.confidence || 0.8) * 100)}%` }} />
                  </div>
                </div>

                <div className="lg:col-span-2 p-sp-4 border border-border bg-bg-surface relative">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-resolved" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Proposed Action</span>
                  </div>
                  <p className="text-[11px] font-mono font-bold text-text-secondary leading-relaxed uppercase">{item.recovery_plan?.reasoning || item.recovery_plan?.recommendation || "Recovery plan pending."}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-sp-6 border-t border-border border-dashed">
                <div className="flex items-center gap-sp-4">
                  <Link to={`/incidents/${item.id}`}>
                    <Button variant="ghost" size="sm">
                      View Full Brief <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-3 w-3" /> Discuss
                  </Button>
                </div>
                <div className="flex items-center gap-sp-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-critical border-critical/50 hover:bg-critical/10"
                    onClick={async () => {
                      await api.dismissIncident(item.id, "Rejected by operator");
                      load();
                    }}
                  >
                    <XCircle className="mr-2 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    className="btn-neon h-10 px-6 text-[11px] font-bold uppercase tracking-tighter"
                    onClick={async () => {
                      await api.approveIncident(item.id);
                      load();
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Approve_&_Execute
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}