import * as React from "react";
import { cn } from "@/src/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-ink text-white hover:bg-ink/90 border-blueprint",
      secondary: "bg-bg-surface text-ink hover:bg-bg-hover border-blueprint",
      ghost: "bg-transparent text-text-secondary hover:text-ink font-mono uppercase tracking-widest",
      outline: "bg-transparent border border-border text-text-muted hover:border-ink hover:text-ink font-mono uppercase tracking-widest",
      danger: "bg-critical text-white hover:brightness-110 border-blueprint",
      success: "bg-resolved text-white hover:brightness-110 border-blueprint",
    };

    const sizes = {
      sm: "h-8 px-3 text-[10px] font-mono font-bold uppercase tracking-widest",
      md: "h-10 px-4 text-[11px] font-mono font-bold uppercase tracking-widest",
      lg: "h-12 px-6 text-[12px] font-mono font-bold uppercase tracking-widest",
      xl: "h-14 px-8 text-[14px] font-display font-bold uppercase tracking-widest",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center border transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-3 w-3 animate-spin border border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
