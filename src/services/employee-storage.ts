import { AuthStorageService } from "./auth-storage";
import type { Employee } from "@/types/employee";

function getAuthHeaders() {
  const session = AuthStorageService.getSession();
  return {
    "x-user-role": session?.role || "",
    "x-user-id": session?.id || "",
  };
}

export const EmployeeStorageService = {
  async getAll(): Promise<Employee[]> {
    try {
      const res = await fetch("/api/employees", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch employees");
      const result = await res.json();
      return result.employees || [];
    } catch (error) {
      console.error("EmployeeStorageService.getAll error:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Employee | null> {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      const result = await res.json();
      return result.employee || null;
    } catch (error) {
      console.error("EmployeeStorageService.getById error:", error);
      return null;
    }
  },

  async create(data: Omit<Employee, "id">): Promise<Employee> {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create employee");
    }
    const result = await res.json();
    return result.employee;
  },

  async update(id: string, data: Omit<Employee, "id">): Promise<Employee | null> {
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update employee");
    }
    const result = await res.json();
    return result.employee || null;
  },

  async remove(id: string): Promise<boolean> {
    const res = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  async search(query: string): Promise<Employee[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter((employee) =>
      employee.name.toLowerCase().includes(lowerQuery)
    );
  },

  async count(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  },
};
