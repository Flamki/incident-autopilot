import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Shield, 
  Zap, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Github,
  Twitter,
  Activity,
  Award
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const team = [
  { 
    name: "John Doe", 
    role: "Senior SRE", 
    email: "john.doe@org.com", 
    expertise: ["api-service", "auth-service", "k8s"], 
    score: 9.2,
    incidents: 42,
    status: "online",
    initials: "JD"
  },
  { 
    name: "Jane Smith", 
    role: "Platform Engineer", 
    email: "jane.smith@org.com", 
    expertise: ["worker-node", "db-proxy", "terraform"], 
    score: 8.7,
    incidents: 28,
    status: "online",
    initials: "JS"
  },
  { 
    name: "Bob Wilson", 
    role: "DevOps Engineer", 
    email: "bob.wilson@org.com", 
    expertise: ["web-client", "gateway", "monitoring"], 
    score: 7.9,
    incidents: 15,
    status: "offline",
    initials: "BW"
  },
  { 
    name: "Alice Jones", 
    role: "Security Engineer", 
    email: "alice.jones@org.com", 
    expertise: ["auth-service", "db-proxy", "vault"], 
    score: 9.5,
    incidents: 34,
    status: "online",
    initials: "AJ"
  },
  { 
    name: "Charlie Brown", 
    role: "SRE Associate", 
    email: "charlie.brown@org.com", 
    expertise: ["gateway", "api-service", "logs"], 
    score: 6.8,
    incidents: 12,
    status: "online",
    initials: "CB"
  },
];

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeam = useMemo(() => {
    return team.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Team</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">Active_Members: 12 // Avg_Expertise: 8.4</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted group-focus-within:text-ink transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH_TEAM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-card border border-border h-9 pl-9 pr-4 text-[10px] font-mono font-bold uppercase focus:outline-none focus:border-ink w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-3 w-3" /> Filters
          </Button>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter">
            <Plus className="mr-2 h-3.5 w-3.5" /> Invite Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sp-6">
        {filteredTeam.length > 0 ? (
          filteredTeam.map((member, i) => (
            <motion.div
              key={member.email}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border bg-bg-card p-sp-6 relative group hover:shadow-[12px_12px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-sp-4">
                <div className="h-14 w-14 border-2 border-ink bg-bg-surface flex items-center justify-center text-lg font-display font-black relative">
                  {member.initials}
                  <div className={cn(
                    "absolute -bottom-1 -right-1 h-3.5 w-3.5 border-2 border-ink rounded-full",
                    member.status === "online" ? "bg-resolved" : "bg-text-muted"
                  )} />
                </div>
                <div className="flex flex-col items-end gap-sp-2">
                  <Badge variant="info" size="sm">{member.role}</Badge>
                  <MoreVertical className="h-4 w-4 text-text-muted cursor-pointer hover:text-ink" />
                </div>
              </div>

              <h3 className="font-display text-xl font-bold uppercase tracking-tighter mb-sp-1 italic">{member.name}</h3>
              <div className="font-mono text-[10px] font-bold text-text-muted uppercase mb-sp-6 tracking-widest">{member.email}</div>

              <div className="space-y-sp-4 mb-sp-6">
                <div>
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase mb-1.5">
                    <span className="text-text-secondary">Expertise Score</span>
                    <span className="text-accent-purple">{member.score}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-border/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-accent-purple" style={{ width: `${member.score * 10}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {member.expertise.map((skill) => (
                    <span key={skill} className="px-1.5 py-0.5 border border-border bg-bg-surface text-[9px] font-mono font-bold uppercase tracking-widest text-text-secondary">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-sp-4">
                  <div className="p-sp-2 border border-border bg-bg-surface">
                    <div className="text-[9px] font-mono text-text-muted uppercase font-bold mb-1">Incidents</div>
                    <div className="text-lg font-display font-bold text-ink">{member.incidents}</div>
                  </div>
                  <div className="p-sp-2 border border-border bg-bg-surface">
                    <div className="text-[9px] font-mono text-text-muted uppercase font-bold mb-1">Status</div>
                    <div className={cn(
                      "text-[10px] font-mono font-bold uppercase",
                      member.status === "online" ? "text-resolved" : "text-text-muted"
                    )}>{member.status}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-sp-4 border-t border-border border-dashed">
                <div className="flex gap-2">
                  <Github className="h-4 w-4 text-text-muted hover:text-ink cursor-pointer" />
                  <Twitter className="h-4 w-4 text-text-muted hover:text-ink cursor-pointer" />
                  <Mail className="h-4 w-4 text-text-muted hover:text-ink cursor-pointer" />
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px]">
                  View Profile <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-sp-20 text-center border-2 border-dashed border-border bg-bg-card">
            <p className="font-mono text-[11px] font-bold text-text-muted uppercase tracking-widest">No_Team_Members_Match_Query_"{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
