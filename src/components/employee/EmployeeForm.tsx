"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormData } from "@/validators/employee-validator";
import { DEPARTMENTS, POSITIONS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { Employee } from "@/types/employee";

interface EmployeeFormProps {
  defaultValues?: Partial<Employee>;
  onSubmit: (data: EmployeeFormData) => void;
  isSubmitting: boolean;
}

export function EmployeeForm({ defaultValues, onSubmit, isSubmitting }: EmployeeFormProps) {
  const router = useRouter();
  const [confirmData, setConfirmData] = useState<EmployeeFormData | null>(null);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      department: defaultValues?.department ?? "",
      position: defaultValues?.position ?? "",
      username: (defaultValues as any)?.username ?? "",
      password: "",
      role: (defaultValues as any)?.role ?? "EMPLOYEE",
    },
  });

  const handleFormSubmit = (data: EmployeeFormData) => {
    setConfirmData(data);
  };

  const handleConfirm = () => {
    if (confirmData) {
      onSubmit(confirmData);
      setConfirmData(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Employee Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter employee name"
                    className="bg-slate-950/85 border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Assigned Department
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full bg-slate-950/85 border-cyan-500/25 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white font-mono text-xs">
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept} className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Security clearance / Position
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full bg-slate-950/85 border-cyan-500/25 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white font-mono text-xs">
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos} className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Account Username
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter login username"
                    className="bg-slate-950/85 border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Account Password {defaultValues && "(Leave empty to keep current)"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    className="bg-slate-950/85 border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  System Role
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full bg-slate-950/85 border-cyan-500/25 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white font-mono text-xs">
                    <SelectItem value="EMPLOYEE" className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">EMPLOYEE (Staff)</SelectItem>
                    <SelectItem value="MANAGER" className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">MANAGER</SelectItem>
                    <SelectItem value="ADMIN" className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4 font-mono text-xs">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white uppercase tracking-wider py-5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-400/30 transition-all duration-200"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin text-cyan-200" />}
              {defaultValues ? "Sync Employee Record" : "Deploy Employee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/60 uppercase tracking-wider py-5 transition-all duration-200"
            >
              Abort
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmDialog
        open={!!confirmData}
        onOpenChange={(open) => !open && setConfirmData(null)}
        title={defaultValues ? "UPDATE EMPLOYEE DATA" : "DEPLOY NEW EMPLOYEE"}
        description={defaultValues ? "You are about to modify the core operational data for this employee. Proceed?" : "You are about to register a new employee into the system. Proceed?"}
        onConfirm={handleConfirm}
        variant="default"
      />
    </>
  );
}
