export type Severity = "SEV1" | "SEV2" | "SEV3" | "SEV4";
export type Status = "OPEN" | "MITIGATED" | "RESOLVED";

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: Status;
  owner: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IncidentsResponse {
  data: Incident[];
  pagination: PaginationInfo;
}

export interface IncidentFilters {
  search?: string;
  severity?: string;
  status?: string;
  service?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateIncidentPayload {
  title: string;
  service: string;
  severity: Severity;
  status?: Status;
  owner?: string | null;
  summary?: string | null;
}

export interface UpdateIncidentPayload {
  title?: string;
  service?: string;
  severity?: Severity;
  status?: Status;
  owner?: string | null;
  summary?: string | null;
}
