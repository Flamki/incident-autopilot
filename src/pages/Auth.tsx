import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Github, 
  Twitter,
  Terminal,
  Cpu,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Logo } from "@/src/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { api, setAuthToken } from "@/src/lib/api";

type AuthMode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const auth = await api.loginDev();
      setAuthToken(auth.token);
      setIsLoading(false);
      navigate("/dashboard");
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-ink selection:bg-accent-neon/30 bg-grid-dots relative flex items-center justify-center p-sp-6 overflow-hidden">
      {/* System Status Bar */}
      <div className="bg-ink text-white h-8 flex items-center justify-between px-sp-6 md:px-sp-12 font-mono text-[9px] uppercase tracking-[0.3em] fixed top-0 left-0 right-0 z-[60]">
        <div className="flex items-center gap-4">
          <span className="text-accent-neon flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-neon animate-pulse" />
            SECURE_GATEWAY: ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-accent-purple">ENCRYPTION: AES-256</span>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute left-[10%] top-0 h-full w-px border-l border-border-muted/20 border-dashed" />
        <div className="absolute right-[10%] top-0 h-full w-px border-l border-border-muted/20 border-dashed" />
        <div className="absolute top-[20%] left-0 w-full h-px border-t border-border-muted/20 border-dashed" />
        <div className="absolute bottom-[20%] left-0 w-full h-px border-t border-border-muted/20 border-dashed" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-sp-8">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="border-2 border-ink bg-white relative shadow-[12px_12px_0px_var(--color-border)]">
          {/* Terminal Header */}
          <div className="h-10 border-b-2 border-ink bg-ink text-white flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent-neon" />
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                {mode === "login" ? "AUTH_SESSION_INIT" : "NEW_USER_PROVISIONING"}
              </span>
            </div>
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-white/20" />
              <div className="h-2 w-2 rounded-full bg-white/20" />
              <div className="h-2 w-2 rounded-full bg-accent-neon" />
            </div>
          </div>

          <div className="p-sp-8">
            <div className="flex border-b-2 border-ink mb-sp-8">
              <button 
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all",
                  mode === "login" ? "bg-ink text-white" : "bg-white text-text-muted hover:bg-bg-surface"
                )}
              >
                Login
              </button>
              <button 
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all",
                  mode === "signup" ? "bg-ink text-white" : "bg-white text-text-muted hover:bg-bg-surface"
                )}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-sp-6">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-sp-6"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
                        <User className="h-3 w-3" /> Full Name
                      </label>
                      <input 
                        required
                        type="text" 
                        placeholder="IDENTIFIER_NAME..."
                        className="w-full bg-bg-surface border border-border h-12 px-4 text-[11px] font-mono font-bold uppercase focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Email Address
                </label>
                <input 
                  required
                  type="email" 
                  placeholder="USER@DOMAIN.COM..."
                  className="w-full bg-bg-surface border border-border h-12 px-4 text-[11px] font-mono font-bold uppercase focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Access Key
                  </label>
                  {mode === "login" && (
                    <button type="button" className="text-[9px] font-mono font-bold uppercase text-accent-purple hover:underline">
                      Lost Key?
                    </button>
                  )}
                </div>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-bg-surface border border-border h-12 px-4 text-[11px] font-mono font-bold uppercase focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>

              {mode === "signup" && (
                <div className="flex items-start gap-3 p-sp-3 bg-accent-neon/5 border border-accent-neon/20">
                  <Shield className="h-4 w-4 text-accent-neon shrink-0 mt-0.5" />
                  <p className="text-[9px] font-mono text-text-secondary leading-relaxed uppercase font-bold">
                    By provisioning an account, you agree to the system protocols and data processing agreements.
                  </p>
                </div>
              )}

              <Button 
                disabled={isLoading}
                className="w-full btn-neon h-14 text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Cpu className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Initialize Session" : "Provision Account"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-sp-8 pt-sp-8 border-t border-border border-dashed">
              <p className="text-[10px] font-mono font-bold uppercase text-text-muted text-center mb-sp-6 tracking-widest">
                Or connect via external provider
              </p>
              <div className="grid grid-cols-2 gap-sp-4">
                <Button variant="outline" className="h-12 border-2 border-ink flex items-center justify-center gap-3 font-mono text-[10px] uppercase font-bold hover:bg-bg-surface">
                  <Github className="h-4 w-4" /> GitHub
                </Button>
                <Button variant="outline" className="h-12 border-2 border-ink flex items-center justify-center gap-3 font-mono text-[10px] uppercase font-bold hover:bg-bg-surface">
                  <Twitter className="h-4 w-4" /> Twitter
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-bg-surface p-4 border-t-2 border-ink flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-resolved" />
              <span className="text-[8px] font-mono font-bold uppercase text-text-muted">Security_Check: Passed</span>
            </div>
            <span className="text-[8px] font-mono font-bold uppercase text-text-muted">Build: 2026.03.23</span>
          </div>
        </div>

        <p className="mt-sp-8 text-center text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-ink hover:text-accent-purple transition-colors underline underline-offset-4"
          >
            {mode === "login" ? "Provision_New" : "Initialize_Session"}
          </button>
        </p>
      </motion.div>

      {/* Floating Blueprint Elements */}
      <div className="absolute top-1/4 left-10 hidden xl:block opacity-20">
        <div className="border border-ink p-4 bg-white rotate-[-5deg] shadow-[4px_4px_0px_var(--color-border)]">
          <div className="h-1 w-32 bg-border-muted mb-1" />
          <div className="h-1 w-24 bg-border-muted" />
        </div>
      </div>
      <div className="absolute bottom-1/4 right-10 hidden xl:block opacity-20">
        <div className="border border-ink p-4 bg-white rotate-[3deg] shadow-[4px_4px_0px_var(--color-border)]">
          <div className="h-1 w-40 bg-border-muted mb-1" />
          <div className="h-1 w-32 bg-border-muted" />
        </div>
      </div>
    </div>
  );
}
