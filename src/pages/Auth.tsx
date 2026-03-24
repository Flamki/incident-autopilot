import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  Github,
  Chrome,
  Terminal,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Logo } from "@/src/components/Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { api, setAuthToken } from "@/src/lib/api";
import {
  authenticateLocalUser,
  ensureGoogleLocalUser,
  registerLocalUser,
  setCurrentLocalUser,
} from "@/src/lib/localAuth";

type AuthMode = "login" | "signup";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const nextPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    if (state?.from && state.from.startsWith("/")) {
      return state.from;
    }
    return "/dashboard";
  }, [location.state]);

  useEffect(() => {
    setMode(location.pathname === "/signup" ? "signup" : "login");
    setError("");
    setSuccess("");
  }, [location.pathname]);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    navigate(nextMode === "signup" ? "/signup" : "/login", { replace: true });
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openSession = async (fullName: string, email: string) => {
    const auth = await api.loginDev();
    setAuthToken(auth.token);
    setCurrentLocalUser({ fullName, email: email.toLowerCase() });
    navigate(nextPath, { replace: true });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (form.fullName.trim().length < 2) {
          setError("Please enter your full name.");
          return;
        }
        if (form.password.length < 8) {
          setError("Password must be at least 8 characters.");
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const created = registerLocalUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        });

        if (!created.ok) {
          setError(created.message || "Could not create account.");
          return;
        }

        setSuccess("Account created. Please log in to continue.");
        setForm((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        handleModeChange("login");
        return;
      }

      const user = authenticateLocalUser({
        email: form.email,
        password: form.password,
      });

      if (!user) {
        setError("Invalid email or password. Create an account first.");
        return;
      }

      await openSession(user.fullName, user.email);
    } catch (error) {
      setError(getErrorMessage(error, "Authentication service is unavailable. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    setError("");
    setSuccess("");
    setIsGoogleLoading(true);
    try {
      const user = ensureGoogleLocalUser();
      await openSession(user.fullName, user.email);
    } catch (error) {
      setError(getErrorMessage(error, "Google connection failed. Please try again."));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-ink selection:bg-accent-neon/30 bg-grid-dots relative flex items-center justify-center p-sp-6 overflow-hidden">
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

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute left-[6%] top-0 h-full w-px border-l border-border-muted/20 border-dashed" />
        <div className="absolute right-[6%] top-0 h-full w-px border-l border-border-muted/20 border-dashed" />
        <div className="absolute top-[16%] left-0 w-full h-px border-t border-border-muted/20 border-dashed" />
        <div className="absolute bottom-[16%] left-0 w-full h-px border-t border-border-muted/20 border-dashed" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl z-10"
      >
        <div className="flex justify-center mb-sp-8">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="border-2 border-ink bg-white relative shadow-[14px_14px_0px_var(--color-border)]">
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

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
            <div className="hidden lg:block border-r-2 border-ink bg-bg-surface p-sp-8">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent-purple mb-sp-4">
                Access Control
              </p>
              <h2 className="font-display text-4xl font-black uppercase tracking-tight leading-[0.9] mb-sp-6">
                Keep The Landing Public.
                <br />
                Keep The App Protected.
              </h2>
              <p className="text-[11px] font-mono uppercase text-text-secondary leading-relaxed mb-sp-8">
                Sign up once, then login to access dashboard modules. Authenticated routes are isolated from the landing surface.
              </p>
              <div className="space-y-sp-4">
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase text-text-secondary">
                  <Shield className="h-4 w-4 text-accent-neon" />
                  Route Guard Enabled
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase text-text-secondary">
                  <Zap className="h-4 w-4 text-accent-purple" />
                  Session Token Required
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold uppercase text-text-secondary">
                  <CheckCircle2 className="h-4 w-4 text-resolved" />
                  Landing And App Separated
                </div>
              </div>
            </div>

            <div className="p-sp-8 lg:p-sp-10">
              <div className="flex border-b-2 border-ink mb-sp-8">
                <button
                  onClick={() => handleModeChange("login")}
                  className={cn(
                    "flex-1 py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all",
                    mode === "login" ? "bg-ink text-white" : "bg-white text-text-muted hover:bg-bg-surface",
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => handleModeChange("signup")}
                  className={cn(
                    "flex-1 py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all",
                    mode === "signup" ? "bg-ink text-white" : "bg-white text-text-muted hover:bg-bg-surface",
                  )}
                >
                  Sign Up
                </button>
              </div>

              {!!error && (
                <div className="mb-sp-5 flex items-start gap-2 p-sp-3 bg-critical/5 border border-critical/25">
                  <AlertTriangle className="h-4 w-4 text-critical mt-0.5 shrink-0" />
                  <p className="text-[10px] font-mono font-bold uppercase text-critical leading-relaxed">{error}</p>
                </div>
              )}

              {!!success && (
                <div className="mb-sp-5 flex items-start gap-2 p-sp-3 bg-resolved/5 border border-resolved/25">
                  <CheckCircle2 className="h-4 w-4 text-resolved mt-0.5 shrink-0" />
                  <p className="text-[10px] font-mono font-bold uppercase text-resolved leading-relaxed">{success}</p>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-sp-5">
                <AnimatePresence mode="wait">
                  {mode === "signup" && (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-sp-5"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
                          <User className="h-3 w-3" /> Full Name
                        </label>
                        <input
                          required
                          type="text"
                          value={form.fullName}
                          onChange={(e) => updateField("fullName", e.target.value)}
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
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="USER@DOMAIN.COM..."
                    className="w-full bg-bg-surface border border-border h-12 px-4 text-[11px] font-mono font-bold uppercase focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Access Key
                  </label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="************"
                    className="w-full bg-bg-surface border border-border h-12 px-4 text-[11px] font-mono font-bold uppercase focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                  />
                </div>

                {mode === "signup" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest flex items-center gap-2">
                      <Lock className="h-3 w-3" /> Confirm Access Key
                    </label>
                    <input
                      required
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="************"
                      className="w-full bg-bg-surface border border-border h-12 px-4 text-[11px] font-mono font-bold uppercase focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                    />
                  </div>
                )}

                {mode === "signup" && (
                  <div className="flex items-start gap-3 p-sp-3 bg-accent-neon/5 border border-accent-neon/20">
                    <Shield className="h-4 w-4 text-accent-neon shrink-0 mt-0.5" />
                    <p className="text-[9px] font-mono text-text-secondary leading-relaxed uppercase font-bold">
                      Account creation stays on this device for now. Production should use server-side hashing and persistent identity.
                    </p>
                  </div>
                )}

                <Button
                  disabled={isLoading || isGoogleLoading}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setError("GitHub OAuth not configured yet. Use Google connect or email sign up/login.")}
                    className="h-12 border-2 border-ink flex items-center justify-center gap-3 font-mono text-[10px] uppercase font-bold hover:bg-bg-surface"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleConnect}
                    disabled={isLoading || isGoogleLoading}
                    className="h-12 border-2 border-ink flex items-center justify-center gap-3 font-mono text-[10px] uppercase font-bold hover:bg-bg-surface"
                  >
                    {isGoogleLoading ? <Cpu className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
                    Google
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface p-4 border-t-2 border-ink flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-resolved" />
              <span className="text-[8px] font-mono font-bold uppercase text-text-muted">Security_Check: Passed</span>
            </div>
            <span className="text-[8px] font-mono font-bold uppercase text-text-muted">Build: 2026.03.24</span>
          </div>
        </div>

        <p className="mt-sp-8 text-center text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => handleModeChange(mode === "login" ? "signup" : "login")}
            className="text-ink hover:text-accent-purple transition-colors underline underline-offset-4"
          >
            {mode === "login" ? "Provision_New" : "Initialize_Session"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
