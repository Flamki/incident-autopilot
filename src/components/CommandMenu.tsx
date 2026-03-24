import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { 
  Search, 
  AlertCircle, 
  LayoutDashboard, 
  Clock, 
  Database, 
  BarChart3, 
  Users, 
  Settings, 
  FileText,
  Zap,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl border-2 border-ink bg-bg-card shadow-[12px_12px_0px_var(--color-border)] overflow-hidden"
          >
            <Command className="flex flex-col h-full">
              <div className="flex items-center border-b-2 border-ink px-4 h-14">
                <Search className="mr-3 h-5 w-5 text-text-muted" />
                <Command.Input
                  placeholder="SEARCH_SYSTEM_COMMANDS..."
                  className="flex-1 bg-transparent py-3 text-[12px] font-mono font-bold uppercase outline-none placeholder:text-text-muted"
                />
                <div className="flex items-center gap-1 px-1.5 py-0.5 border border-border text-[9px] font-mono text-text-muted uppercase">
                  ESC
                </div>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="py-sp-12 text-center text-[11px] font-mono font-bold text-text-muted uppercase">
                  No_Results_Found_In_Registry.
                </Command.Empty>

                <Command.Group heading={<div className="px-2 py-1.5 text-[9px] font-mono font-bold text-text-muted uppercase tracking-[0.2em]">// NAVIGATION //</div>}>
                  <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                    <LayoutDashboard className="mr-3 h-4 w-4" />
                    <span>Dashboard</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/incidents"))}>
                    <AlertCircle className="mr-3 h-4 w-4" />
                    <span>Incidents</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/pending"))}>
                    <Clock className="mr-3 h-4 w-4" />
                    <span>Pending Approval</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/repos"))}>
                    <Database className="mr-3 h-4 w-4" />
                    <span>Repositories</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/analytics"))}>
                    <BarChart3 className="mr-3 h-4 w-4" />
                    <span>Analytics</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/team"))}>
                    <Users className="mr-3 h-4 w-4" />
                    <span>Team</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/docs"))}>
                    <FileText className="mr-3 h-4 w-4" />
                    <span>Documentation</span>
                  </CommandItem>
                </Command.Group>

                <Command.Group heading={<div className="px-2 py-1.5 text-[9px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] mt-2">// QUICK_ACTIONS //</div>}>
                  <CommandItem onSelect={() => runCommand(() => console.log("Force Scan"))}>
                    <Zap className="mr-3 h-4 w-4 text-accent-neon" />
                    <span>Force System Scan</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/incidents"))}>
                    <AlertCircle className="mr-3 h-4 w-4 text-critical" />
                    <span>Create Manual Incident</span>
                  </CommandItem>
                </Command.Group>

                <Command.Group heading={<div className="px-2 py-1.5 text-[9px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] mt-2">// RECENT_INCIDENTS //</div>}>
                  <CommandItem onSelect={() => runCommand(() => navigate("/incidents/1042"))}>
                    <div className="h-2 w-2 rounded-full bg-critical mr-3" />
                    <span className="flex-1 truncate">Pipeline failure — api-service</span>
                    <span className="text-[9px] font-mono text-text-muted ml-2">#1042</span>
                  </CommandItem>
                  <CommandItem onSelect={() => runCommand(() => navigate("/incidents/1041"))}>
                    <div className="h-2 w-2 rounded-full bg-warning mr-3" />
                    <span className="flex-1 truncate">High error rate — auth-service</span>
                    <span className="text-[9px] font-mono text-text-muted ml-2">#1041</span>
                  </CommandItem>
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t-2 border-ink px-4 h-10 bg-bg-surface">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-text-muted uppercase">
                    <span className="border border-border px-1">↑↓</span> Navigate
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-text-muted uppercase">
                    <span className="border border-border px-1">ENTER</span> Select
                  </div>
                </div>
                <div className="text-[9px] font-mono font-bold text-text-muted uppercase tracking-widest">
                  AUTOPILOT_OS_v1.0
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center px-sp-3 py-sp-2.5 text-[11px] font-mono font-bold uppercase tracking-widest cursor-pointer data-[selected=true]:bg-ink data-[selected=true]:text-white transition-all group"
    >
      {children}
      <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
    </Command.Item>
  );
}
