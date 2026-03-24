import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Tooltip } from "./Tooltip";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "critical" | "warning" | "resolved" | "info" | "ai" | "agent" | "outline";
  size?: "sm" | "md";
  pulse?: boolean;
  tooltip?: string;
}

const DEFAULT_TOOLTIPS = {
  critical: "Immediate action required. System failure or high-risk incident.",
  warning: "Action recommended. Potential issue or degraded performance.",
  resolved: "Incident has been addressed and system is stable.",
  info: "General system information or status update.",
  ai: "Action or analysis performed by the Autopilot AI core.",
  agent: "Specialized autonomous agent currently active on this task.",
  outline: "Secondary status or metadata.",
};

export const Badge = ({ className, variant = "info", size = "sm", pulse, tooltip, children, ...props }: BadgeProps) => {
  const variants = {
    critical: "bg-critical text-white border-blueprint",
    warning: "bg-warning/10 text-warning border-warning",
    resolved: "bg-resolved/10 text-resolved border-resolved",
    info: "bg-bg-surface text-ink border-blueprint",
    ai: "bg-ink text-white border-blueprint",
    agent: "bg-accent-purple/10 text-accent-purple border-accent-purple",
    outline: "bg-transparent text-text-muted border-border-muted",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest",
    md: "px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest",
  };

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center border cursor-help",
        variants[variant],
        sizes[size],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {pulse && <div className={cn("mr-1.5 h-1.5 w-1.5 border border-blueprint", `bg-${variant}`)} />}
      {children}
    </span>
  );

  return (
    <Tooltip content={tooltip || DEFAULT_TOOLTIPS[variant]}>
      {badgeContent}
    </Tooltip>
  );
};
