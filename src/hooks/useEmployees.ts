"use client";

import { useState, useEffect, useCallback } from "react";
import { EmployeeStorageService } from "@/services/employee-storage";
import type { Employee } from "@/types/employee";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const refreshEmployees = useCallback(async () => {
    setIsLoading(true);
    const all = await EmployeeStorageService.getAll();
    setEmployees(all);
    setTotalCount(all.length);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  const addEmployee = useCallback(
    async (data: Omit<Employee, "id">): Promise<Employee> => {
      const newEmployee = await EmployeeStorageService.create(data);
      await refreshEmployees();
      return newEmployee;
    },
    [refreshEmployees]
  );

  const updateEmployee = useCallback(
    async (id: string, data: Omit<Employee, "id">): Promise<Employee | null> => {
      const updated = await EmployeeStorageService.update(id, data);
      await refreshEmployees();
      return updated;
    },
    [refreshEmployees]
  );

  const deleteEmployee = useCallback(
    async (id: string): Promise<boolean> => {
      const success = await EmployeeStorageService.remove(id);
      await refreshEmployees();
      return success;
    },
    [refreshEmployees]
  );

  const searchEmployees = useCallback(async (query: string) => {
    if (!query.trim()) {
      const all = await EmployeeStorageService.getAll();
      setEmployees(all);
    } else {
      const results = await EmployeeStorageService.search(query);
      setEmployees(results);
    }
  }, []);

  return {
    employees,
    isLoading,
    totalCount,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployees,
    refreshEmployees,
  };
}
