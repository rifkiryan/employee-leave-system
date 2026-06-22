"use client";

import { format } from "date-fns";
import { CheckCircle, XCircle, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import type { LeaveRequest } from "@/types/leave";
import type { Employee } from "@/types/employee";

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  userRole: string;
}

export function LeaveRequestTable({
  leaveRequests,
  employees,
  onApprove,
  onReject,
  userRole,
}: LeaveRequestTableProps) {
  const getEmployeeName = (employeeId: string): string => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? emp.name : "Unknown Employee";
  };

  const formatDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  if (leaveRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-950/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
        <CalendarX className="h-14 w-14 mb-4 text-purple-400/40 animate-pulse" />
        <p className="text-lg font-mono tracking-wider text-slate-300">NO REQUESTS ENCOUNTERED</p>
        <p className="text-sm font-mono text-slate-600 mt-1">Submit a new request to populate the schedule database.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-500/10 overflow-hidden bg-slate-950/60 backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-cyan-500/10 bg-slate-900/50 hover:bg-slate-900/50">
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4 pl-6">Operator</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4">Start Orbit</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4">End Orbit</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4">Objective / Reason</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4">Authorization</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4 text-right pr-6">Override Ops</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.map((request) => (
              <TableRow key={request.id} className="border-b border-slate-900/60 hover:bg-cyan-500/5 transition-all duration-300">
                <TableCell className="font-mono text-sm pl-6 py-4 text-slate-200">
                  {getEmployeeName(request.employeeId)}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400 py-4">
                  {formatDate(request.startDate)}
                  {request.durationType === "HALF" && (
                    <span className="block text-[9px] text-cyan-400 font-extrabold tracking-wider uppercase mt-1">
                      HALF DAY
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400 py-4">
                  {request.durationType === "HALF" ? formatDate(request.startDate) : formatDate(request.endDate)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs text-slate-300 py-4">{request.reason}</TableCell>
                <TableCell className="py-4">
                  <LeaveStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-right pr-6 py-4">
                  {userRole === "MANAGER" && request.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(request.id)}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 font-mono text-xs uppercase tracking-wider py-4 transition-all duration-200"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(request.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 font-mono text-xs uppercase tracking-wider py-4 transition-all duration-200"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
