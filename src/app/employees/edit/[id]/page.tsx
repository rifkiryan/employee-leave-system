"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { EmployeeStorageService } from "@/services/employee-storage";
import { AuthStorageService } from "@/services/auth-storage";
import { toast } from "sonner";
import type { Employee } from "@/types/employee";
import type { EmployeeFormData } from "@/validators/employee-validator";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    if (!session || !session.isLoggedIn) {
      router.push("/login");
      return;
    }

    if (session.role !== "ADMIN") {
      toast.error("Access Denied: Only administrators can modify employee profiles.");
      router.push("/employees");
      return;
    }

    const fetchEmployee = async () => {
      const found = await EmployeeStorageService.getById(id);
      if (found) {
        setEmployee(found);
      } else {
        toast.error("Employee not found.");
        router.push("/employees");
      }
      setIsLoading(false);
    };

    fetchEmployee();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      await EmployeeStorageService.update(id, data);
      toast.success("Employee updated successfully!");
      router.push("/employees");
    } catch (error: any) {
      toast.error(error.message || "Failed to update employee.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b19]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!employee) return null;

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
              Update Employee Profile
            </CardTitle>
            <p className="text-cyan-400/40 font-mono text-[10px] tracking-wider mt-1 uppercase">
              ALTER RECORD PARAMETERS FOR EMPLOYEE: {employee.id.substring(0, 8).toUpperCase()}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <EmployeeForm
              defaultValues={employee}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
