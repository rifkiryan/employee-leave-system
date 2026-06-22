"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { StatCard } from "@/components/dashboard/StatCard";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { FuturisticChart } from "@/components/dashboard/FuturisticChart";
import { AuthStorageService } from "@/services/auth-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { LeaveStorageService } from "@/services/leave-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeave: 0,
    approvedLeave: 0,
    rejectedLeave: 0,
  });

  useEffect(() => {
    const currentSession = AuthStorageService.getSession();
    if (!currentSession || !currentSession.isLoggedIn) {
      router.push("/login");
      return;
    }
    setSession(currentSession);

    const fetchStats = async () => {
      const [totalEmployees, pendingLeave, approvedLeave, rejectedLeave] = await Promise.all([
        EmployeeStorageService.count(),
        LeaveStorageService.countByStatus("PENDING"),
        LeaveStorageService.countByStatus("APPROVED"),
        LeaveStorageService.countByStatus("REJECTED"),
      ]);
      
      setStats({
        totalEmployees,
        pendingLeave,
        approvedLeave,
        rejectedLeave,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b19]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#070b19] overflow-hidden text-white">
      {/* Animated circuit lines background */}
      <CircuitBackground />

      {/* Decorative glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 relative z-10">
        <div className="mb-10 bg-slate-950/45 border border-cyan-500/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.02)]">
          {/* Neon top line glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-wide uppercase font-mono flex flex-wrap items-center gap-2">
                Welcome,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 futuristic-glow-text">
                  {session?.name || session?.username || "Operator"}
                </span>
                !
              </h1>
              <p className="text-slate-300 font-mono text-sm mt-2 max-w-2xl leading-relaxed">
                Glad to have you back in the leave management control room. All systems are operational. You are logged in with clearance level:{" "}
                <span className="text-cyan-400 font-bold uppercase">{session?.role || "EMPLOYEE"}</span>.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end justify-center font-mono border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
              <span className="text-[10px] text-slate-500">CURRENT TIMELINE</span>
              <span className="text-xs text-purple-400 font-bold uppercase mt-0.5">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<Users className="h-6 w-6 text-cyan-400" />}
            glowColor="cyan"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingLeave}
            icon={<Clock className="h-6 w-6 text-purple-400" />}
            glowColor="purple"
          />
          <StatCard
            title="Approved Requests"
            value={stats.approvedLeave}
            icon={<CheckCircle className="h-6 w-6 text-emerald-400" />}
            glowColor="emerald"
          />
          <StatCard
            title="Rejected Requests"
            value={stats.rejectedLeave}
            icon={<XCircle className="h-6 w-6 text-rose-400" />}
            glowColor="rose"
          />
        </div>

        {/* Dynamic Telemetry Telecommunication Chart */}
        <FuturisticChart />
      </main>
    </div>
  );
}
