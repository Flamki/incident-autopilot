import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  X, 
  Clock,
  Zap,
  ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "critical" | "warning" | "info" | "success";
  time: string;
  read: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Critical Pipeline Failure",
    description: "api-service main branch build failed at test stage.",
    type: "critical",
    time: "2m ago",
    read: false,
    link: "/incidents/1042"
  },
  {
    id: "2",
    title: "New Approval Required",
    description: "High error rate detected in auth-service. Recovery plan generated.",
    type: "warning",
    time: "15m ago",
    read: false,
    link: "/pending"
  },
  {
    id: "3",
    title: "System Update Complete",
    description: "Autopilot OS updated to v2.4.1. Check docs for new features.",
    type: "success",
    time: "1h ago",
    read: true,
    link: "/docs"
  },
  {
    id: "4",
    title: "New Team Member",
    description: "Sarah Chen joined the SRE team as Senior Engineer.",
    type: "info",
    time: "3h ago",
    read: true,
    link: "/team"
  }
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-bg-card border-2 border-ink shadow-[8px_8px_0px_var(--color-border)] z-50 overflow-hidden"
            style={{ top: '100%' }}
          >
            <div className="p-sp-4 border-b border-border bg-bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-ink" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest">Notifications</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-bg-hover transition-colors"
              >
                <X className="h-3.5 w-3.5 text-text-muted hover:text-ink" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {mockNotifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {mockNotifications.map((notification) => (
                    <Link
                      key={notification.id}
                      to={notification.link || "#"}
                      onClick={onClose}
                      className={cn(
                        "block p-sp-4 hover:bg-bg-hover transition-all group relative",
                        !notification.read && "bg-bg-surface/50"
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-ink" />
                      )}
                      
                      <div className="flex gap-sp-3">
                        <div className={cn(
                          "mt-0.5 h-7 w-7 shrink-0 flex items-center justify-center border border-border",
                          notification.type === "critical" && "bg-critical/10 text-critical",
                          notification.type === "warning" && "bg-warning/10 text-warning",
                          notification.type === "success" && "bg-resolved/10 text-resolved",
                          notification.type === "info" && "bg-accent-purple/10 text-accent-purple"
                        )}>
                          {notification.type === "critical" && <AlertCircle className="h-4 w-4" />}
                          {notification.type === "warning" && <Zap className="h-4 w-4" />}
                          {notification.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                          {notification.type === "info" && <Info className="h-4 w-4" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[11px] font-mono font-bold uppercase truncate pr-2">
                              {notification.title}
                            </h4>
                            <span className="text-[9px] font-mono text-text-muted whitespace-nowrap">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-text-secondary leading-tight line-clamp-2 uppercase">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-sp-10 text-center">
                  <p className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-widest">
                    No_New_Notifications
                  </p>
                </div>
              )}
            </div>

            <div className="p-sp-3 border-t border-border bg-bg-surface">
              <button className="w-full py-2 border border-border bg-bg-card hover:bg-ink hover:text-white transition-all text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                View All History <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
