import { motion } from "motion/react";
import { 
  Book, 
  Search, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Code, 
  Terminal,
  ArrowRight,
  ExternalLink,
  Cpu,
  Database,
  Users
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";

const sections = [
  {
    title: "Getting Started",
    icon: Zap,
    items: [
      { title: "Introduction to Autopilot", desc: "How the autonomous OS works" },
      { title: "Quickstart Guide", desc: "Connect your first repository in 5 minutes" },
      { title: "Architecture Overview", desc: "Understanding the agent pool and cluster" },
    ]
  },
  {
    title: "Agent Pool",
    icon: Cpu,
    items: [
      { title: "Log Analyzer V4", desc: "Real-time log parsing and error detection" },
      { title: "Commit Bisector X", desc: "Automated root cause identification" },
      { title: "Recovery Strategist", desc: "AI-driven rollback and fix generation" },
    ]
  },
  {
    title: "Integrations",
    icon: Database,
    items: [
      { title: "GitLab Setup", desc: "Configuring webhooks and pipeline access" },
      { title: "Slack Notifications", desc: "Real-time incident alerts in your channels" },
      { title: "Custom Webhooks", desc: "Connecting your own monitoring tools" },
    ]
  },
  {
    title: "Security & Compliance",
    icon: ShieldCheck,
    items: [
      { title: "Data Privacy", desc: "How we handle your source code and logs" },
      { title: "RBAC & Permissions", desc: "Managing team access and roles" },
      { title: "Audit Logs", desc: "Tracking every action taken by agents" },
    ]
  }
];

export default function Docs() {
  return (
    <div className="p-sp-4 flex flex-col gap-sp-8 h-full relative max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center mt-sp-8 mb-sp-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-16 w-16 border-2 border-ink bg-bg-surface flex items-center justify-center mb-6 shadow-[8px_8px_0px_var(--color-border)]"
        >
          <Book className="h-8 w-8" />
        </motion.div>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tighter italic mb-4">Documentation</h1>
        <p className="text-[12px] font-mono text-text-muted uppercase font-bold tracking-widest max-w-xl leading-relaxed">
          Master the autonomous operating system. Learn how to configure agents, integrate repositories, and automate your incident response.
        </p>
        
        <div className="relative mt-12 w-full max-w-2xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-ink transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH_THE_KNOWLEDGE_BASE..."
            className="w-full bg-bg-card border-2 border-ink h-14 pl-12 pr-4 text-[12px] font-mono font-bold uppercase focus:outline-none focus:shadow-[8px_8px_0px_var(--color-border)] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-sp-8">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border bg-bg-card p-sp-8 relative group"
          >
            <div className="flex items-center gap-sp-4 mb-sp-8">
              <div className="h-10 w-10 border border-border bg-bg-surface flex items-center justify-center group-hover:bg-accent-neon transition-colors">
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tighter italic">{section.title}</h2>
            </div>

            <div className="space-y-sp-4">
              {section.items.map((item) => (
                <div 
                  key={item.title}
                  className="flex items-center justify-between p-sp-4 bg-bg-surface border border-transparent hover:border-border hover:bg-white transition-all cursor-pointer group/item"
                >
                  <div>
                    <h3 className="text-[11px] font-mono font-bold uppercase mb-1 group-hover/item:text-accent-purple transition-colors">{item.title}</h3>
                    <p className="text-[9px] font-mono text-text-muted uppercase font-bold">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover/item:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-sp-6 mt-8">
        <div className="p-sp-6 border border-border bg-bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Terminal className="h-24 w-24" />
          </div>
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-2">API Reference</h3>
          <p className="text-[10px] font-mono text-text-muted uppercase font-bold mb-4">Full documentation for our REST API and SDKs.</p>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-accent-purple hover:bg-transparent">
            Explore API <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
        
        <div className="p-sp-6 border border-border bg-bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Code className="h-24 w-24" />
          </div>
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-2">SDKs & Libraries</h3>
          <p className="text-[10px] font-mono text-text-muted uppercase font-bold mb-4">Official libraries for Node.js, Python, and Go.</p>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-accent-purple hover:bg-transparent">
            View Libraries <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>

        <div className="p-sp-6 border border-border bg-bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-24 w-24" />
          </div>
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-2">Community</h3>
          <p className="text-[10px] font-mono text-text-muted uppercase font-bold mb-4">Join our Discord and connect with other engineers.</p>
          <Button variant="ghost" size="sm" className="p-0 h-auto text-accent-purple hover:bg-transparent">
            Join Discord <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mt-12 py-sp-8 border-t border-border border-dashed flex items-center justify-between">
        <div className="font-mono text-[10px] text-text-muted uppercase font-bold tracking-[0.2em]">
          Last Updated: March 2026 // Version: 4.2.0-stable
        </div>
        <div className="flex gap-sp-6">
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase hover:text-ink cursor-pointer">Privacy</span>
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase hover:text-ink cursor-pointer">Terms</span>
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase hover:text-ink cursor-pointer">Support</span>
        </div>
      </div>
    </div>
  );
}
