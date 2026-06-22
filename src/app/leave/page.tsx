"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import { LeaveRequestTable } from "@/components/leave/LeaveRequestTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useEmployees } from "@/hooks/useEmployees";
import { AuthStorageService } from "@/services/auth-storage";
import { toast } from "sonner";
import type { LeaveStatus } from "@/types/leave";

const STATUS_TABS: { label: string; value: LeaveStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function LeavePage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const { employees } = useEmployees();
  const {
    leaveRequests,
    approveRequest,
    rejectRequest,
    filterByStatus,
    statusFilter,
  } = useLeaveRequests();

  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    id: string;
  } | null>(null);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    if (!session || !session.isLoggedIn) {
      router.push("/login");
    } else {
      setIsAuth(true);
      setUserSession(session);
    }
  }, [router]);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "approve") {
        await approveRequest(confirmAction.id);
        toast.success("Leave request approved.");
      } else {
        await rejectRequest(confirmAction.id);
        toast.success("Leave request rejected.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update leave request status.");
    }
    setConfirmAction(null);
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen relative bg-[#070b19] overflow-hidden text-white">
      {/* Animated circuit lines background */}
      <CircuitBackground />

      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 futuristic-glow-text tracking-wide uppercase font-mono">
              Leave Requests
            </h1>
            <p className="text-cyan-400/60 font-mono text-xs tracking-wider mt-2">
              MONITOR AND MANAGE EMPLOYEE AVAILABILITY
            </p>
          </div>
          {userSession?.role === "EMPLOYEE" && (
            <Button
              onClick={() => router.push("/leave/new")}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono text-xs uppercase tracking-wider py-5 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-400/30"
            >
              <Plus className="h-4 w-4" />
              File Request
            </Button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-900">
          {STATUS_TABS.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <Button
                key={tab.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => filterByStatus(tab.value)}
                className={`whitespace-nowrap font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-all duration-300
                  ${
                    isSelected
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900/60"
                  }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        <LeaveRequestTable
          leaveRequests={leaveRequests}
          employees={employees}
          onApprove={(id) => setConfirmAction({ type: "approve", id })}
          onReject={(id) => setConfirmAction({ type: "reject", id })}
          userRole={userSession?.role || ""}
        />

        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmAction?.type === "approve" ? "APPROVE REQUEST" : "REJECT REQUEST"}
          description={
            confirmAction?.type === "approve"
              ? "Are you sure you want to authorize this leave request? This record will be flagged as approved."
              : "Are you sure you want to reject this leave request? This record will be flagged as rejected."
          }
          onConfirm={handleConfirm}
          variant={confirmAction?.type === "reject" ? "destructive" : "default"}
        />
      </main>
    </div>
  );
}
