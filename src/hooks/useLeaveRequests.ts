"use client";

import { useState, useEffect, useCallback } from "react";
import { LeaveStorageService } from "@/services/leave-storage";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const refreshCounts = useCallback(async () => {
    const [pending, approved, rejected, all] = await Promise.all([
      LeaveStorageService.countByStatus("PENDING"),
      LeaveStorageService.countByStatus("APPROVED"),
      LeaveStorageService.countByStatus("REJECTED"),
      LeaveStorageService.getAll(),
    ]);
    setCounts({
      pending,
      approved,
      rejected,
      total: all.length,
    });
  }, []);

  const refreshRequests = useCallback(async () => {
    setIsLoading(true);
    const data =
      statusFilter === "ALL"
        ? await LeaveStorageService.getAll()
        : await LeaveStorageService.getByStatus(statusFilter);
    setLeaveRequests(data);
    await refreshCounts();
    setIsLoading(false);
  }, [statusFilter, refreshCounts]);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const addRequest = useCallback(
    async (data: Omit<LeaveRequest, "id" | "status">): Promise<LeaveRequest> => {
      const newRequest = await LeaveStorageService.create(data);
      await refreshRequests();
      return newRequest;
    },
    [refreshRequests]
  );

  const approveRequest = useCallback(
    async (id: string): Promise<LeaveRequest | null> => {
      const updated = await LeaveStorageService.approve(id);
      await refreshRequests();
      return updated;
    },
    [refreshRequests]
  );

  const rejectRequest = useCallback(
    async (id: string): Promise<LeaveRequest | null> => {
      const updated = await LeaveStorageService.reject(id);
      await refreshRequests();
      return updated;
    },
    [refreshRequests]
  );

  const filterByStatus = useCallback((status: LeaveStatus | "ALL") => {
    setStatusFilter(status);
  }, []);

  return {
    leaveRequests,
    isLoading,
    counts,
    addRequest,
    approveRequest,
    rejectRequest,
    filterByStatus,
    refreshRequests,
    statusFilter,
  };
}
