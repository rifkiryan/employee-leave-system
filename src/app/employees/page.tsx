"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { useEmployees } from "@/hooks/useEmployees";
import { AuthStorageService } from "@/services/auth-storage";
import { toast } from "sonner";
import type { Employee } from "@/types/employee";

export default function EmployeesPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { employees, searchEmployees, deleteEmployee } = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    if (!session || !session.isLoggedIn) {
      router.push("/login");
    } else {
      setIsAuth(true);
      setIsAdmin(session.role === "ADMIN" || session.username === "admin");
    }
  }, [router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchEmployees(query);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteEmployee(deleteTarget.id);
        toast.success(`${deleteTarget.name} has been deleted.`);
      } catch (error: any) {
        toast.error(error.message || "Failed to delete employee.");
      }
      setDeleteTarget(null);
    }
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
              Employees Directory
            </h1>
            <p className="text-cyan-400/60 font-mono text-xs tracking-wider mt-2">
              OPERATIONAL STAFF REGISTRY AND CREDENTIALS
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => router.push("/employees/new")}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono text-xs uppercase tracking-wider py-5 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-400/30"
            >
              <Plus className="h-4 w-4" />
              Register Employee
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
          <div className="w-full md:max-w-sm">
            <SearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search records by identity..."
            />
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-950/85 border border-cyan-500/25 text-white rounded-lg font-mono text-xs py-2.5 px-4 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 outline-none cursor-pointer transition-all duration-300 min-w-[150px] uppercase"
            >
              <option value="" className="bg-slate-950 text-white">ALL DEPARTMENTS</option>
              <option value="Engineering" className="bg-slate-950 text-white">ENGINEERING</option>
              <option value="Human Resources" className="bg-slate-950 text-white">HUMAN RESOURCES</option>
              <option value="Finance" className="bg-slate-950 text-white">FINANCE</option>
              <option value="Marketing" className="bg-slate-950 text-white">MARKETING</option>
              <option value="Operations" className="bg-slate-950 text-white">OPERATIONS</option>
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-950/85 border border-cyan-500/25 text-white rounded-lg font-mono text-xs py-2.5 px-4 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 outline-none cursor-pointer transition-all duration-300 min-w-[150px] uppercase"
            >
              <option value="" className="bg-slate-950 text-white">ALL ROLES</option>
              <option value="ADMIN" className="bg-slate-950 text-white">ADMIN</option>
              <option value="MANAGER" className="bg-slate-950 text-white">MANAGER</option>
              <option value="EMPLOYEE" className="bg-slate-950 text-white">STAFF / EMPLOYEE</option>
            </select>
          </div>
        </div>

        <EmployeeTable
          employees={employees.filter((emp) => {
            if (selectedDepartment && emp.department !== selectedDepartment) return false;
            if (selectedRole && emp.role !== selectedRole) return false;
            return true;
          })}
          onEdit={(id) => router.push(`/employees/edit/${id}`)}
          onDelete={(employee) => setDeleteTarget(employee)}
          isAdmin={isAdmin}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="PURGE STAFF RECORD"
          description={`Are you sure you want to permanently delete user "${deleteTarget?.name}"? All related access logs will be terminated.`}
          onConfirm={handleDelete}
          variant="destructive"
        />
      </main>
    </div>
  );
}
