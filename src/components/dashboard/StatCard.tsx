import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "emerald" | "rose";
}

const glowClasses = {
  cyan: "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-500/40 border-cyan-500/10",
  purple: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/40 border-purple-500/10",
  emerald: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/40 border-emerald-500/10",
  rose: "hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500/40 border-rose-500/10",
};

export function StatCard({ title, value, icon, className = "", glowColor = "cyan" }: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-slate-950/70 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${glowClasses[glowColor]} ${className}`}
    >
      {/* Dynamic glow corner */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20
        ${glowColor === "cyan" ? "bg-cyan-500" : ""}
        ${glowColor === "purple" ? "bg-purple-500" : ""}
        ${glowColor === "emerald" ? "bg-emerald-500" : ""}
        ${glowColor === "rose" ? "bg-rose-500" : ""}
      `} />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400">{title}</p>
            <p className="text-4xl font-extrabold mt-2 text-white font-mono tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
