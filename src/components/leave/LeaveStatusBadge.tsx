import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/types/leave";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

const statusConfig: Record<LeaveStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-purple-950/60 text-purple-400 hover:bg-purple-950/60 border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)] font-mono uppercase text-[10px]",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-950/60 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)] font-mono uppercase text-[10px]",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-950/60 text-rose-400 hover:bg-rose-950/60 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.1)] font-mono uppercase text-[10px]",
  },
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
