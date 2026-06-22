import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    employeeId: z
      .string()
      .min(1, { message: "Employee is required" }),
    startDate: z
      .string()
      .min(1, { message: "Start date is required" }),
    endDate: z
      .string()
      .min(1, { message: "End date is required" }),
    reason: z
      .string()
      .min(1, { message: "Reason is required" }),
    durationType: z.enum(["FULL", "HALF"]),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
