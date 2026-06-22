"use client";

import { Pencil, Trash2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Employee } from "@/types/employee";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (id: string) => void;
  onDelete: (employee: Employee) => void;
  isAdmin: boolean;
}

export function EmployeeTable({ employees, onEdit, onDelete, isAdmin }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-950/40 border border-slate-800/80 rounded-2xl backdrop-blur-md">
        <UserX className="h-14 w-14 mb-4 text-cyan-400/40 animate-pulse" />
        <p className="text-lg font-mono tracking-wider text-slate-300">NO EMPLOYEES REGISTERED</p>
        <p className="text-sm font-mono text-slate-600 mt-1">Initialize new records to start database tracking.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-500/10 overflow-hidden bg-slate-950/60 backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-cyan-500/10 bg-slate-900/50 hover:bg-slate-900/50">
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4 pl-6">Employee Name</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4">Department</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4">Designation</TableHead>
              {isAdmin && <TableHead className="font-mono text-xs uppercase tracking-wider text-cyan-400 py-4 text-right pr-6">Database Ops</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} className="border-b border-slate-900/60 hover:bg-cyan-500/5 transition-all duration-300">
                <TableCell className="font-mono text-sm pl-6 py-4 text-slate-200">{employee.name}</TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                    {employee.department}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400 py-4">{employee.position}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(employee.id)}
                        className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/15 border border-transparent hover:border-cyan-500/30 transition-all duration-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(employee)}
                        className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
