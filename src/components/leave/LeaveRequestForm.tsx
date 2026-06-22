"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { leaveRequestSchema, type LeaveRequestFormData } from "@/validators/leave-validator";
import { CyberDatePicker } from "@/components/shared/CyberDatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

import { AuthStorageService } from "@/services/auth-storage";

interface LeaveRequestFormProps {
  employees: Employee[];
  onSubmit: (data: LeaveRequestFormData) => void;
  isSubmitting: boolean;
}

export function LeaveRequestForm({ employees, onSubmit, isSubmitting }: LeaveRequestFormProps) {
  const router = useRouter();
  const [confirmData, setConfirmData] = useState<LeaveRequestFormData | null>(null);
  const session = AuthStorageService.getSession();

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: session?.id || "",
      startDate: "",
      endDate: "",
      reason: "",
      durationType: "FULL",
    },
  });

  const durationType = form.watch("durationType");
  const startDate = form.watch("startDate");

  // Sync end date if duration is half-day
  useEffect(() => {
    if (durationType === "HALF" && startDate) {
      form.setValue("endDate", startDate);
    }
  }, [durationType, startDate, form]);

  const handleFormSubmit = (data: LeaveRequestFormData) => {
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
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Operating Employee
                </FormLabel>
                <FormControl>
                  <Input
                    readOnly
                    value={session?.name || session?.username || ""}
                    className="bg-slate-950/50 border-cyan-500/10 text-slate-400 focus:border-cyan-500/10 focus:ring-0 rounded-lg font-mono text-sm py-5 cursor-not-allowed"
                  />
                </FormControl>
                <input type="hidden" {...field} />
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Duration Type
                </FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val === "HALF" && startDate) {
                      form.setValue("endDate", startDate);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-slate-950/85 border-cyan-500/25 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm py-5 transition-all duration-300">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-950 border border-slate-800 text-white font-mono text-xs">
                    <SelectItem value="FULL" className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">
                      FULL DAY (Satu Hari Penuh)
                    </SelectItem>
                    <SelectItem value="HALF" className="hover:bg-cyan-500/15 focus:bg-cyan-500/15 text-slate-200">
                      HALF DAY (Setengah Hari)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-rose-400 text-xs font-mono" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <CyberDatePicker
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        if (durationType === "HALF") {
                          form.setValue("endDate", date);
                        }
                      }}
                      placeholder="Choose start date"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs font-mono" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                    Return Date
                  </FormLabel>
                  <FormControl>
                    <CyberDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose return date"
                      minDate={startDate}
                      disabled={durationType === "HALF"}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs font-mono" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                  Mission Objective / Reason
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detail the operational objective for the requested timeline..."
                    className="bg-slate-950/85 border-cyan-500/25 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/45 rounded-lg font-mono text-sm min-h-[100px] transition-all duration-300"
                    {...field}
                  />
                </FormControl>
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
              File Leave Request
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
        title="FILE LEAVE REQUEST"
        description="You are about to officially log a period of operational absence into the mainframe. Do you wish to proceed?"
        onConfirm={handleConfirm}
        variant="default"
      />
    </>
  );
}
