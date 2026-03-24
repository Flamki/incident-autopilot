import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  ArrowRight, Play, CheckCircle2, Zap, Shield, BarChart2, Users, 
  Code, Search, History, Cpu, Terminal, Globe, Layers, 
  AlertTriangle, MessageSquare, GitBranch, Eye, FileText,
  ChevronRight, ExternalLink, Github, Twitter
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import HeroScene from "@/src/components/3d/HeroScene";
import { Logo } from "@/src/components/Logo";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const agents = [
  { 
    icon: Search, 
    name: "Log Analyzer", 
    color: "critical", 
    desc: "Ingests millions of log lines in milliseconds. Identifies the needle in the haystack.",
    spec: "NLP-V4 // LOG_PARSER"
  },
  { 
    icon: History, 
    name: "Commit Bisector", 
    color: "warning", 
    desc: "Traverses your git history to find the exact delta that triggered the regression.",
    spec: "GIT_ENGINE // CONFIDENCE_98%"
  },
  { 
    icon: Code, 
    name: "Context Reader", 
    color: "agent", 
    desc: "Reads the surrounding code of the breaking change to understand side effects.",
    spec: "AST_WALKER // SEMANTIC_MAP"
  },
  { 
    icon: Users, 
    name: "Owner Finder", 
    color: "info", 
    desc: "Calculates expertise scores based on git blame, past PRs, and domain knowledge.",
    spec: "TEAM_GRAPH // EXPERTISE_INDEX"
  },
  { 
    icon: Zap, 
    name: "Recovery Planner", 
    color: "ai", 
    desc: "Drafts a step-by-step recovery plan with rollback commands and verification tests.",
    spec: "STRATEGY_GEN // RECOVERY_V2"
  },
  { 
    icon: CheckCircle2, 
    name: "Action Executor", 
    color: "resolved", 
    desc: "Automates the boring stuff: Jira tickets, Slack updates, and PagerDuty resolution.",
    spec: "OPS_AUTOMATOR // API_BRIDGE"
  },
];


const LogoComponent = () => (
  <Logo />
);

const LiveFeed = () => {
  const [logs, setLogs] = useState([
    "INITIALIZING_CORE_SYSTEMS...",
    "CONNECTING_TO_GITLAB_API...",
    "SCANNING_INFRASTRUCTURE_NODES...",
    "READY_FOR_INCIDENT_DETECTION."
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = [
        "ANOMALY_DETECTED_IN_CLUSTER_04",
        "AGENT_LOG_ANALYZER_STARTED",
        "ROOT_CAUSE_PROBABILITY_94%",
        "RECOVERY_PLAN_V2_GENERATED",
        "AWAITING_HUMAN_CONFIRMATION",
        "SYSTEM_OPTIMIZATION_COMPLETE"
      ];
      setLogs(prev => [...prev.slice(1), newLogs[Math.floor(Math.random() * newLogs.length)]]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] text-accent-neon space-y-1">
      {logs.map((log, i) => (
        <div key={i} className={cn("flex gap-2", i === logs.length - 1 ? "opacity-100" : "opacity-40")}>
          <span className="shrink-0">[{new Date().toLocaleTimeString()}]</span>
          <span className="truncate">{log}</span>
        </div>
      ))}
    </div>
  );
};

export default function Landing() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-base text-ink selection:bg-accent-neon/30 bg-grid-dots relative overflow-x-hidden">
      {/* System Status Bar */}
      <div className="bg-ink text-white h-8 flex items-center justify-between px-sp-6 md:px-sp-12 font-mono text-[9px] uppercase tracking-[0.3em] fixed top-0 left-0 right-0 z-[60]">
        <div className="flex items-center gap-4">
          <span className="text-accent-neon flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-neon animate-pulse" />
            STATUS: OPERATIONAL
          </span>
          <span className="opacity-40 hidden sm:inline">LATENCY: 12MS</span>
          <span className="opacity-40 hidden sm:inline">UPTIME: 99.999%</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-40 hidden md:inline">REGION: ASIA-EAST1</span>
          <span className="text-accent-purple">INCIDENT_OS_V1.0.4</span>
        </div>
      </div>

      {/* Blueprint Grid Lines - Global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute left-[5%] top-0 h-full w-px border-l border-border-muted/30 border-dashed" />
        <div className="absolute right-[5%] top-0 h-full w-px border-l border-border-muted/30 border-dashed" />
        <div className="absolute top-[10%] left-0 w-full h-px border-t border-border-muted/30 border-dashed" />
        <div className="absolute bottom-[10%] left-0 w-full h-px border-t border-border-muted/30 border-dashed" />
      </div>

      {/* Nav */}
      <nav className="fixed top-8 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-md border-b-2 border-ink h-24 flex items-center justify-between px-sp-6 md:px-sp-20">
        <LogoComponent />
        
        <div className="hidden lg:flex items-center gap-sp-8 text-[11px] font-mono font-bold uppercase tracking-widest text-text-secondary">
          <a href="#story" className="hover:text-ink transition-colors relative group">
            The Story
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-neon transition-all group-hover:w-full" />
          </a>
          <a href="#how-it-works" className="hover:text-ink transition-colors relative group">
            The Blueprint
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-neon transition-all group-hover:w-full" />
          </a>
          <a href="#agents" className="hover:text-ink transition-colors relative group">
            The Squad
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-neon transition-all group-hover:w-full" />
          </a>
        </div>

        <div className="flex items-center gap-sp-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-mono text-[11px] uppercase tracking-widest hidden sm:flex">Login</Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="btn-neon font-mono text-[11px] uppercase tracking-widest px-8 h-12">Launch OS</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-sp-6 md:px-sp-20 min-h-screen flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] opacity-30 pointer-events-none">
          <HeroScene />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl z-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border-2 border-ink bg-bg-card mb-sp-12 shadow-[4px_4px_0px_var(--color-border)]">
            <div className="h-2.5 w-2.5 rounded-full bg-resolved animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em]">Core_System: Online</span>
          </div>

          <h1 className="font-display text-7xl md:text-[140px] font-black leading-[0.75] tracking-tighter uppercase mb-sp-16 italic">
            Incidents <br />
            <span className="text-accent-purple not-italic">Are Dead.</span><br />
            <span className="relative inline-block">
              Long Live AI.
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute -bottom-4 left-0 h-6 bg-accent-neon -z-10" 
              />
            </span>
          </h1>
          
          <p className="text-2xl md:text-4xl text-text-secondary max-w-4xl mx-auto mb-sp-20 font-medium leading-tight">
            The autonomous operating system for <span className="text-ink font-bold underline decoration-accent-purple decoration-4 underline-offset-8">mission-critical</span> incident response.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-sp-8">
            <Link to="/login">
              <Button className="btn-neon h-24 px-16 text-2xl font-black uppercase tracking-tighter flex items-center gap-6 group">
                <Zap className="h-10 w-10 fill-current transition-transform group-hover:rotate-12" /> 
                Initialize OS
              </Button>
            </Link>
            <Button variant="outline" className="h-24 px-16 text-2xl font-black uppercase tracking-tighter border-2 border-ink bg-white hover:bg-bg-hover flex items-center gap-6 shadow-[4px_4px_0px_var(--color-border)]">
              <Play className="h-8 w-8 fill-ink" /> System Demo
            </Button>
          </div>
        </motion.div>

        {/* Live Terminal Overlay */}
        <div className="absolute bottom-10 left-10 hidden xl:block w-80">
          <div className="border-2 border-ink p-4 bg-ink/90 backdrop-blur-md shadow-[8px_8px_0px_var(--color-accent-purple)]">
            <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
              <span className="font-mono text-[10px] uppercase font-bold text-white">Live_Telemetry</span>
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
            </div>
            <LiveFeed />
          </div>
        </div>

        {/* Floating Blueprint Elements */}
        <div className="absolute top-1/4 left-10 hidden xl:block">
          <div className="border-2 border-ink p-4 bg-bg-card rotate-[-5deg] shadow-[4px_4px_0px_var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-critical" />
              <span className="font-mono text-[10px] uppercase font-bold">Critical Alert</span>
            </div>
            <div className="h-1 w-32 bg-border-muted mb-1" />
            <div className="h-1 w-24 bg-border-muted" />
          </div>
        </div>

        <div className="absolute bottom-1/4 right-10 hidden xl:block">
          <div className="border-2 border-ink p-4 bg-bg-card rotate-[3deg] shadow-[4px_4px_0px_var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-resolved" />
              <span className="font-mono text-[10px] uppercase font-bold">Plan Generated</span>
            </div>
            <div className="h-1 w-40 bg-border-muted mb-1" />
            <div className="h-1 w-32 bg-border-muted" />
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section id="story" className="py-sp-32 px-sp-6 md:px-sp-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-4 left-4 font-mono text-[10px] text-white/20 tracking-[0.5em]">COORD: 35.6895° N, 139.6917° E</div>
        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white/20 tracking-[0.5em]">SECTOR: OMEGA_7</div>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-sp-12 items-center">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-accent-neon mb-sp-6">// THE SCENARIO</p>
              <h2 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.9] mb-sp-8">
                02:41 AM. <br />
                The Pager <br />
                Goes Off.
              </h2>
              <div className="space-y-sp-6 text-xl md:text-2xl opacity-80 font-medium leading-relaxed">
                <p>You're groggy. The logs are a chaotic mess of stack traces. Your team is scrambling.</p>
                <p>Every minute of downtime is costing thousands. The pressure is mounting.</p>
                <p className="text-accent-neon font-bold italic">Incident Autopilot is already awake.</p>
              </div>
            </div>
            <div className="relative">
              <div className="border-2 border-white/20 p-sp-12 bg-white/5 backdrop-blur-sm rounded-lg">
                <div className="flex items-center justify-between mb-sp-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent-neon flex items-center justify-center">
                      <Cpu className="text-ink h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-display font-bold uppercase tracking-tighter">Autopilot_Core</div>
                      <div className="font-mono text-[10px] opacity-60">ANALYZING_TRAFFIC...</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-accent-neon text-accent-neon">ACTIVE</Badge>
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex gap-4">
                    <span className="text-accent-neon">[02:41:02]</span>
                    <span>Anomaly detected in <code className="text-accent-purple">auth-service</code></span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-accent-neon">[02:41:15]</span>
                    <span>Ingesting 4.2GB of logs...</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-accent-neon">[02:41:45]</span>
                    <span className="text-warning">Root cause identified: Memory leak in v2.4.1</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-accent-neon">[02:42:10]</span>
                    <span className="text-resolved">Recovery plan drafted. Awaiting approval.</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 border-t-2 border-r-2 border-accent-neon" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 border-b-2 border-l-2 border-accent-neon" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-sp-32 px-sp-6 md:px-sp-20 bg-bg-surface relative border-t-2 border-ink">
        <div className="absolute top-4 left-4 font-mono text-[10px] text-ink/20 tracking-[0.5em]">ARCH_SCHEMA: V2.4.0</div>
        <div className="max-w-screen-2xl mx-auto">
          <div className="text-center mb-sp-20">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-accent-purple mb-sp-4">// THE BLUEPRINT</p>
            <h2 className="font-display text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none italic">
              System Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-ink bg-bg-base shadow-[16px_16px_0px_var(--color-border)]">
            {[
              { 
                step: "01", 
                title: "Data Ingestion", 
                desc: "Autopilot hooks into your GitLab CI/CD, logs, and metrics. It builds a real-time semantic map of your entire infrastructure.",
                icon: Globe,
                tag: "INPUT_STREAM"
              },
              { 
                step: "02", 
                title: "Neural Diagnosis", 
                desc: "When an anomaly is detected, our specialized agents collaborate in a private war-room to find the root cause in milliseconds.",
                icon: Search,
                tag: "PROCESS_CORE"
              },
              { 
                step: "03", 
                title: "Autonomous Recovery", 
                desc: "Approve the generated recovery plan. Autopilot handles the execution, notification, and documentation automatically.",
                icon: Zap,
                tag: "OUTPUT_RESOLVE"
              }
            ].map((item, i) => (
              <div key={i} className={cn(
                "p-sp-12 relative group hover:bg-white transition-all",
                i < 2 ? "border-b-2 md:border-b-0 md:border-r-2 border-ink" : ""
              )}>
                <div className="absolute top-6 right-6 font-display text-8xl font-black opacity-5 group-hover:opacity-10 transition-opacity">
                  {item.step}
                </div>
                <div className="h-20 w-20 border-2 border-ink bg-bg-card flex items-center justify-center mb-sp-8 group-hover:bg-accent-neon group-hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all">
                  <item.icon className="h-10 w-10" />
                </div>
                <div className="font-mono text-[10px] font-bold text-accent-purple mb-2 tracking-widest">{item.tag}</div>
                <h3 className="font-display text-4xl font-black uppercase tracking-tighter mb-sp-4 italic">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed text-xl font-medium">
                  {item.desc}
                </p>
                <div className="mt-sp-10 flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-widest text-ink group-hover:translate-x-2 transition-transform">
                  View Technical Specs <ArrowRight className="h-4 w-4 text-accent-neon" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-sp-32 px-sp-6 md:px-sp-20 bg-bg-base relative overflow-hidden border-t-2 border-ink">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ink to-transparent" />
        <div className="absolute inset-0 bg-grid-dots opacity-5 pointer-events-none" />
        
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-sp-20 gap-sp-12">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-accent-purple mb-sp-4">// THE_SQUAD_MANIFEST</p>
              <h2 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                Active Modules
              </h2>
            </div>
            <p className="text-2xl text-text-secondary font-medium max-w-md leading-tight">
              A team of autonomous experts, each trained on a specific domain of the incident lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sp-12">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                {/* Blueprint Background Decor */}
                <div className="absolute -inset-4 border border-border-muted/20 border-dashed pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-6 -left-6 font-mono text-[8px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  COORD_{i}_X: {120 + i * 40} <br />
                  COORD_{i}_Y: {450 - i * 20}
                </div>

                <div className="border-2 border-ink bg-bg-card relative overflow-hidden shadow-[4px_4px_0px_var(--color-border)] group-hover:shadow-[12px_12px_0px_var(--color-accent-neon)] group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all">
                  {/* Top Header Bar */}
                  <div className="h-10 border-b-2 border-ink bg-ink text-white flex items-center justify-between px-4">
                    <span className="font-mono text-[10px] font-bold tracking-widest">AGENT_ID: 0x{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-neon animate-pulse" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-tighter">STATUS: ACTIVE</span>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="p-sp-8">
                    <div className="flex items-start justify-between mb-sp-6">
                      <div className={cn(
                        "h-20 w-20 border-2 border-ink flex items-center justify-center relative group-hover:bg-accent-neon group-hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all",
                        `bg-${agent.color}/10 text-${agent.color}`
                      )}>
                        <agent.icon className="h-10 w-10 relative z-10" />
                        <div className="absolute inset-0 bg-grid-dots opacity-20" />
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">MODULE_SPEC</div>
                        <div className="font-mono text-[11px] font-black text-accent-purple">{agent.spec}</div>
                      </div>
                    </div>

                    <h3 className="font-display text-4xl font-black uppercase tracking-tighter mb-sp-4 italic leading-none">{agent.name}</h3>
                    
                    {/* Description Box */}
                    <div className="bg-ink/5 border-l-4 border-ink p-sp-4 mb-sp-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-1 font-mono text-[8px] text-text-muted opacity-30">LOG_V1.0</div>
                      <p className="text-text-secondary text-base leading-snug font-medium relative z-10">
                        {agent.desc}
                      </p>
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between pt-sp-6 border-t border-border-muted/50">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[9px] font-bold text-text-muted uppercase tracking-tighter">Efficiency_Index</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 10 }).map((_, j) => (
                            <div 
                              key={j} 
                              className={cn(
                                "h-3 w-1.5 border border-ink/20", 
                                j < 8 ? `bg-${agent.color}` : "bg-bg-base"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-2xl font-black tracking-tighter italic">98.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Scanning Animation Line */}
                  <motion.div 
                    animate={{ top: ["-10%", "110%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-px bg-accent-neon/30 z-20 pointer-events-none"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Docs Section */}
      <section id="docs" className="py-sp-32 px-sp-6 md:px-sp-20 bg-bg-base border-t-2 border-ink relative">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-sp-32 items-center">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-accent-purple mb-sp-4">// KNOWLEDGE BASE</p>
              <h2 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-sp-8 italic">
                Technical <br /> Manual
              </h2>
              <p className="text-2xl text-text-secondary font-medium mb-sp-12 leading-relaxed max-w-xl">
                Everything you need to integrate Autopilot into your stack. From SDKs to API references, we've got you covered.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sp-6">
                {[
                  { title: "Quickstart Guide", icon: Play },
                  { title: "API Reference", icon: Code },
                  { title: "Agent Training", icon: Cpu },
                  { title: "Security Whitepaper", icon: Shield }
                ].map((item, i) => (
                  <a key={i} href="#" className="flex items-center justify-between p-sp-8 border-2 border-ink bg-white hover:bg-bg-hover transition-all group shadow-[4px_4px_0px_var(--color-border)] hover:shadow-[6px_6px_0px_var(--color-accent-purple)] hover:-translate-y-1 relative">
                    <div className="absolute -top-3 -left-3 bg-ink text-accent-neon px-2 py-0.5 text-[8px] font-mono border border-white/20 z-20">
                      DOC_ID: 0x{i + 1}
                    </div>
                    <div className="flex items-center gap-4">
                      <item.icon className="h-6 w-6 text-text-muted group-hover:text-ink transition-colors" />
                      <span className="font-black uppercase tracking-tighter text-base">{item.title}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </a>
                ))}
              </div>
            </div>
            
            <div className="bg-ink rounded-lg p-sp-10 shadow-[24px_24px_0px_rgba(0,0,0,0.1)] relative overflow-hidden border-2 border-white/10">
              <div className="absolute top-0 left-0 w-full h-10 bg-white/5 flex items-center px-6 gap-2 border-b border-white/10">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                <div className="ml-auto font-mono text-[10px] text-white/30 tracking-widest">DOCS_TERMINAL_V1.0.4</div>
              </div>
              <div className="mt-6 font-mono text-base text-accent-neon space-y-3">
                <p className="opacity-50">$ npm install @autopilot/sdk</p>
                <p className="flex gap-2">
                  <span className="text-accent-purple">import</span> 
                  <span>{ "{" } Autopilot { "}" }</span>
                  <span className="text-accent-purple">from</span>
                  <span className="text-white/60">"@autopilot/sdk"</span>;
                </p>
                <p className="text-white/80">const client = new Autopilot({ "{" }</p>
                <p className="text-white/80 ml-6">apiKey: process.env.AUTOPILOT_KEY,</p>
                <p className="text-white/80 ml-6">service: <span className="text-accent-neon">"auth-service"</span>,</p>
                <p className="text-white/80 ml-6">autonomy: <span className="text-accent-neon">true</span></p>
                <p className="text-white/80">{"}"});</p>
                <p className="text-accent-purple mt-6">// Listening for anomalies in cluster-04...</p>
                <p className="animate-pulse">_</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-sp-32 px-sp-6 md:px-sp-20 bg-accent-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid" />
        <div className="absolute top-0 left-0 w-full h-6 bg-ink flex overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="flex-1 h-full border-r border-white/5" />
          ))}
        </div>
        
        <div className="max-w-screen-2xl mx-auto text-center relative z-10">
          <h2 className="font-display text-6xl md:text-[120px] font-black uppercase tracking-tighter leading-[0.8] mb-sp-12">
            Stop Reacting. <br />
            <span className="text-accent-neon italic">Start Resolving.</span>
          </h2>
          
          <div className="flex flex-col items-center gap-sp-8">
            <Link to="/login">
              <Button className="btn-neon h-24 px-20 text-3xl font-black uppercase tracking-tighter flex items-center gap-6 group">
                <Zap className="h-10 w-10 fill-current transition-transform group-hover:scale-125" /> 
                Get Autopilot Now
              </Button>
            </Link>
            <div className="flex items-center gap-sp-12 text-[11px] font-mono font-bold uppercase tracking-[0.2em] opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-neon" /> Setup in 5 Mins
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-6 bg-ink flex overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="flex-1 h-full border-r border-white/5" />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-sp-24 border-t-2 border-ink px-sp-6 md:px-sp-20 bg-bg-base relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dots opacity-10" />
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-sp-32 mb-sp-24">
            <div className="col-span-1 md:col-span-1">
              <LogoComponent />
              <p className="mt-sp-8 text-lg text-text-secondary font-medium leading-relaxed">
                The AI-native incident response platform built for modern engineering teams.
              </p>
              <div className="flex gap-sp-4 mt-sp-10">
                <a href="#" className="h-12 w-12 border-2 border-ink flex items-center justify-center hover:bg-accent-neon hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="h-12 w-12 border-2 border-ink flex items-center justify-center hover:bg-accent-neon hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all">
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-display text-xl font-black uppercase tracking-tighter mb-sp-8 italic">Product</h4>
              <ul className="space-y-5 text-sm font-mono font-bold uppercase tracking-[0.2em] text-text-muted">
                <li><a href="#how-it-works" className="hover:text-ink hover:translate-x-1 transition-all inline-block">The Blueprint</a></li>
                <li><a href="#agents" className="hover:text-ink hover:translate-x-1 transition-all inline-block">The Squad</a></li>
                <li><a href="/login" className="hover:text-ink hover:translate-x-1 transition-all inline-block">Launch OS</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-xl font-black uppercase tracking-tighter mb-sp-8 italic">Resources</h4>
              <ul className="space-y-5 text-sm font-mono font-bold uppercase tracking-[0.2em] text-text-muted">
                <li><a href="#docs" className="hover:text-ink hover:translate-x-1 transition-all inline-block">Technical Manual</a></li>
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">API Reference</a></li>
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">System Status</a></li>
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-xl font-black uppercase tracking-tighter mb-sp-8 italic">Company</h4>
              <ul className="space-y-5 text-sm font-mono font-bold uppercase tracking-[0.2em] text-text-muted">
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">About Us</a></li>
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">Careers</a></li>
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">Security</a></li>
                <li><a href="#" className="hover:text-ink hover:translate-x-1 transition-all inline-block">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-sp-8 border-t-2 border-border-muted flex flex-col md:flex-row justify-between items-center gap-sp-8">
            <p className="text-[11px] font-mono text-text-muted uppercase tracking-[0.3em]">© 2026 Incident Autopilot. Built for the GitLab AI Hackathon.</p>
            <div className="flex gap-sp-10 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-text-muted">
              <a href="#" className="hover:text-ink transition-colors">Privacy_Policy</a>
              <a href="#" className="hover:text-ink transition-colors">Terms_of_Service</a>
              <a href="#" className="hover:text-ink transition-colors">Cookie_Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
