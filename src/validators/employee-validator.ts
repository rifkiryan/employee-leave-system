import { z } from "zod";

export const employeeSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" }),
  department: z
    .string()
    .min(1, { message: "Department is required" }),
  position: z
    .string()
    .min(1, { message: "Position is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
