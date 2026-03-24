import { Zap } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
  hideSubtitle?: boolean;
}

export function Logo({ className, size = "md", hideText = false, hideSubtitle = false }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  const zapSizes = {
    sm: "h-4 w-4",
    md: "h-7 w-7",
    lg: "h-10 w-10"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("flex items-center gap-sp-3 group cursor-pointer", className)}>
      <div className={cn(
        "relative border-2 border-ink bg-bg-card flex items-center justify-center overflow-hidden transition-all group-hover:shadow-[4px_4px_0px_var(--color-accent-neon)] group-hover:-translate-x-1 group-hover:-translate-y-1 shrink-0",
        iconSizes[size]
      )}>
        <div className="absolute inset-0 bg-grid-dots opacity-20" />
        <Zap className={cn("text-accent-neon relative z-10 fill-ink", zapSizes[size])} />
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-purple/30" />
      </div>
      
      {!hideText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "font-display font-black tracking-tighter uppercase italic",
              textSizes[size]
            )}>
              Autopilot
            </span>
            <span className="h-2 w-2 rounded-full bg-accent-neon animate-pulse" />
          </div>
          {!hideSubtitle && size !== "sm" && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">
              Autonomous_Incident_OS
            </span>
          )}
        </div>
      )}
    </div>
  );
}
