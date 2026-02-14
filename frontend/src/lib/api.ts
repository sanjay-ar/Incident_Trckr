import type {
  IncidentsResponse,
  Incident,
  IncidentFilters,
  CreateIncidentPayload,
  UpdateIncidentPayload,
} from "../types/incident";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.details?.[0]?.message || "Request failed");
  }
  return response.json();
}

export async function fetchIncidents(
  filters: IncidentFilters = {}
): Promise<IncidentsResponse> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.status) params.set("status", filters.status);
  if (filters.service) params.set("service", filters.service);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const response = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  return handleResponse<IncidentsResponse>(response);
}

export async function fetchIncident(id: string): Promise<Incident> {
  const response = await fetch(`${API_BASE}/incidents/${id}`);
  return handleResponse<Incident>(response);
}

export async function createIncident(
  data: CreateIncidentPayload
): Promise<Incident> {
  const response = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Incident>(response);
}

export async function updateIncident(
  id: string,
  data: UpdateIncidentPayload
): Promise<Incident> {
  const response = await fetch(`${API_BASE}/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Incident>(response);
}
