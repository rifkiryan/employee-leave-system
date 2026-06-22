"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { useEmployees } from "@/hooks/useEmployees";
import { AuthStorageService } from "@/services/auth-storage";
import { toast } from "sonner";
import type { EmployeeFormData } from "@/validators/employee-validator";

export default function NewEmployeePage() {
  const router = useRouter();
  const { addEmployee } = useEmployees();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    if (!session || !session.isLoggedIn) {
      router.push("/login");
    } else if (session.role !== "ADMIN") {
      toast.error("Access Denied: Only administrators can register new employees.");
      router.push("/employees");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      await addEmployee(data);
      toast.success("Employee created successfully!");
      router.push("/employees");
    } catch (error: any) {
      toast.error(error.message || "Failed to create employee.");
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
              Register Employee
            </CardTitle>
            <p className="text-cyan-400/40 font-mono text-[10px] tracking-wider mt-1 uppercase">
              INITIALIZE OPERATOR ACCOUNT IN DATABASE
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <EmployeeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
