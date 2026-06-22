import { AuthStorageService } from "./auth-storage";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";

function getAuthHeaders() {
  const session = AuthStorageService.getSession();
  return {
    "x-user-role": session?.role || "",
    "x-user-id": session?.id || "",
  };
}

function mapDbRequestToFrontend(req: any): LeaveRequest {
  return {
    id: req.id,
    employeeId: req.userId,
    startDate: new Date(req.startDate).toISOString().split("T")[0],
    endDate: new Date(req.endDate).toISOString().split("T")[0],
    reason: req.reason,
    status: req.status as LeaveStatus,
    durationType: req.durationType,
  };
}

export const LeaveStorageService = {
  async getAll(): Promise<LeaveRequest[]> {
    try {
      const res = await fetch("/api/leave", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch leave requests");
      const result = await res.json();
      return (result.leaveRequests || []).map(mapDbRequestToFrontend);
    } catch (error) {
      console.error("LeaveStorageService.getAll error:", error);
      return [];
    }
  },

  async getApproved(): Promise<LeaveRequest[]> {
    try {
      const res = await fetch("/api/leave?approvedOnly=true", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch approved leave requests");
      const result = await res.json();
      return (result.leaveRequests || []).map(mapDbRequestToFrontend);
    } catch (error) {
      console.error("LeaveStorageService.getApproved error:", error);
      return [];
    }
  },

  async getById(id: string): Promise<LeaveRequest | null> {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  },

  async create(data: Omit<LeaveRequest, "id" | "status">): Promise<LeaveRequest> {
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        durationType: data.durationType,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create leave request");
    }
    const result = await res.json();
    return mapDbRequestToFrontend(result.leaveRequest);
  },

  async approve(id: string): Promise<LeaveRequest | null> {
    const res = await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to approve leave request");
    }
    const result = await res.json();
    return mapDbRequestToFrontend(result.leaveRequest);
  },

  async reject(id: string): Promise<LeaveRequest | null> {
    const res = await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to reject leave request");
    }
    const result = await res.json();
    return mapDbRequestToFrontend(result.leaveRequest);
  },

  async getByStatus(status: LeaveStatus): Promise<LeaveRequest[]> {
    const all = await this.getAll();
    return all.filter((request) => request.status === status);
  },

  async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    const all = await this.getAll();
    return all.filter((request) => request.employeeId === employeeId);
  },

  async countByStatus(status: LeaveStatus): Promise<number> {
    const requests = await this.getByStatus(status);
    return requests.length;
  },
};
