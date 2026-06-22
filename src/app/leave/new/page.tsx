"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { LeaveRequestForm } from "@/components/leave/LeaveRequestForm";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useEmployees } from "@/hooks/useEmployees";
import { AuthStorageService } from "@/services/auth-storage";
import { toast } from "sonner";
import type { LeaveRequestFormData } from "@/validators/leave-validator";

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const { employees } = useEmployees();
  const { addRequest } = useLeaveRequests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    if (!session || !session.isLoggedIn) {
      router.push("/login");
    } else if (session.role !== "EMPLOYEE") {
      toast.error("Access Denied: Only staff (employees) can file leave requests.");
      router.push("/leave");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleSubmit = async (data: LeaveRequestFormData) => {
    setIsSubmitting(true);
    try {
      await addRequest(data);
      toast.success("Leave request submitted successfully!");
      router.push("/leave");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit leave request.");
      setIsSubmitting(false);
    }
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen relative bg-[#070b19] overflow-hidden text-white">
      {/* Animated circuit lines background */}
      <CircuitBackground />

      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-12 relative z-10">
        <Card className="bg-slate-950/70 border border-cyan-500/10 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="border-b border-slate-900/60 pb-6 text-center sm:text-left">
            <CardTitle className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 futuristic-glow-text tracking-wide uppercase font-mono">
              Request Leave Orbit
            </CardTitle>
            <p className="text-cyan-400/40 font-mono text-[10px] tracking-wider mt-1 uppercase">
              INITIALIZE TIME-OFF PROTOCOL IN CENTRAL REGISTER
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {employees.length === 0 ? (
              <p className="text-slate-500 font-mono text-center py-8 text-sm">
                NO REGISTERED EMPLOYEES FOUND. CONFIGURE EMPLOYEE DATASETS BEFORE FILING REQUESTS.
              </p>
            ) : (
              <LeaveRequestForm
                employees={employees}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
