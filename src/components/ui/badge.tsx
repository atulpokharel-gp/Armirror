"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline" | "gold" | "ai";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    secondary: "bg-white/10 text-white/80 border-white/20",
    destructive: "bg-red-500/20 text-red-300 border-red-500/30",
    outline: "border-white/20 text-white/80",
    gold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    ai: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
