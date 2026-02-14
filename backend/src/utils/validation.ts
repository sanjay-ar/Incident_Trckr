import { z } from "zod";

export const SEVERITIES = ["SEV1", "SEV2", "SEV3", "SEV4"] as const;
export const STATUSES = ["OPEN", "MITIGATED", "RESOLVED"] as const;

export const createIncidentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  service: z
    .string()
    .min(1, "Service is required")
    .max(100, "Service must be 100 characters or less"),
  severity: z.enum(SEVERITIES, {
    error: `Severity must be one of: ${SEVERITIES.join(", ")}`,
  }),
  status: z.enum(STATUSES).optional().default("OPEN"),
  owner: z
    .string()
    .max(100, "Owner must be 100 characters or less")
    .optional()
    .nullable(),
  summary: z
    .string()
    .max(2000, "Summary must be 2000 characters or less")
    .optional()
    .nullable(),
});

export const updateIncidentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .optional(),
  service: z
    .string()
    .min(1, "Service is required")
    .max(100, "Service must be 100 characters or less")
    .optional(),
  severity: z
    .enum(SEVERITIES, {
      error: `Severity must be one of: ${SEVERITIES.join(", ")}`,
    })
    .optional(),
  status: z
    .enum(STATUSES, {
      error: `Status must be one of: ${STATUSES.join(", ")}`,
    })
    .optional(),
  owner: z
    .string()
    .max(100, "Owner must be 100 characters or less")
    .optional()
    .nullable(),
  summary: z
    .string()
    .max(2000, "Summary must be 2000 characters or less")
    .optional()
    .nullable(),
});

export const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  service: z.string().optional(),
  sortBy: z
    .enum(["title", "severity", "status", "service", "createdAt", "updatedAt", "owner"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type QueryInput = z.infer<typeof querySchema>;
