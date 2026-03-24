import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  LogOut, 
  PanelLeftClose, 
  PanelLeft,
  Shield,
  Activity,
  ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { setAuthToken } from "@/src/lib/api";
import { clearLocalAuthState } from "@/src/lib/localAuth";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  displayName?: string;
  email?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "JD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserMenu({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  displayName = "John Doe",
  email,
}: UserMenuProps) {
  const navigate = useNavigate();
  const initials = getInitials(displayName);

  const handleLogout = () => {
    setAuthToken(null);
    clearLocalAuthState();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-sp-4 mb-2 w-64 bg-bg-card border-2 border-ink shadow-[8px_-8px_0px_var(--color-border)] z-50 overflow-hidden"
          >
            <div className="p-sp-4 border-b border-border bg-bg-surface">
              <div className="flex items-center gap-sp-3">
                <div className="h-10 w-10 border-blueprint bg-ink flex items-center justify-center text-[12px] font-mono font-bold text-white relative">
                  {initials}
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-resolved border border-border" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono font-bold uppercase truncate">{displayName}</p>
                  <p className="text-[9px] font-mono text-text-muted uppercase truncate">{email || "SRE_ENG_01 // LEVEL_4"}</p>
                </div>
              </div>
            </div>

            <div className="p-sp-2">
              <button className="w-full flex items-center gap-sp-3 px-sp-3 py-sp-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary hover:bg-bg-hover hover:text-ink transition-all group">
                <User className="h-3.5 w-3.5 text-text-muted group-hover:text-ink" />
                <span className="flex-1 text-left">Profile_Settings</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button className="w-full flex items-center gap-sp-3 px-sp-3 py-sp-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary hover:bg-bg-hover hover:text-ink transition-all group">
                <Shield className="h-3.5 w-3.5 text-text-muted group-hover:text-ink" />
                <span className="flex-1 text-left">Access_Control</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button className="w-full flex items-center gap-sp-3 px-sp-3 py-sp-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary hover:bg-bg-hover hover:text-ink transition-all group">
                <Activity className="h-3.5 w-3.5 text-text-muted group-hover:text-ink" />
                <span className="flex-1 text-left">Session_Logs</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="h-px bg-border my-2" />

              <button 
                onClick={() => {
                  onToggleCollapse();
                  onClose();
                }}
                className="w-full flex items-center gap-sp-3 px-sp-3 py-sp-2 text-[10px] font-mono font-bold uppercase tracking-widest text-accent-purple hover:bg-accent-purple/5 transition-all group"
              >
                {isCollapsed ? (
                  <>
                    <PanelLeft className="h-3.5 w-3.5" />
                    <span className="flex-1 text-left">Expand_Sidebar</span>
                  </>
                ) : (
                  <>
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    <span className="flex-1 text-left">Collapse_Sidebar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-sp-3 px-sp-3 py-sp-2 text-[10px] font-mono font-bold uppercase tracking-widest text-critical hover:bg-critical/5 transition-all group"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">Terminate_Session</span>
              </button>
            </div>

            <div className="p-sp-2 bg-bg-surface border-t border-border">
              <div className="px-sp-3 py-1 text-[8px] font-mono text-text-muted uppercase tracking-tighter">
                Last_Login: 2026-03-23_11:42_UTC
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
