import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Edit3,
  Save,
  X,
  User,
  Server,
  AlertTriangle,
} from "lucide-react";
import { fetchIncident, updateIncident } from "../lib/api";
import { SeverityBadge } from "../components/SeverityBadge";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import type { Severity, Status, UpdateIncidentPayload } from "../types/incident";

const SEVERITY_OPTIONS: Severity[] = ["SEV1", "SEV2", "SEV3", "SEV4"];
const STATUS_OPTIONS: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateIncidentPayload>({});

  const { data: incident, isLoading, isError } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => fetchIncident(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateIncidentPayload) => updateIncident(id!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["incident", id], updated);
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setIsEditing(false);
      toast("Changes saved", "success");
    },
    onError: (err: Error) => {
      toast(err.message, "error");
    },
  });

  const startEditing = () => {
    if (incident) {
      setEditData({
        title: incident.title,
        service: incident.service,
        severity: incident.severity,
        status: incident.status,
        owner: incident.owner,
        summary: incident.summary,
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = () => {
    mutation.mutate(editData);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Incident Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The incident you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Incidents
            </button>

            {!isEditing ? (
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Meta */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            {isEditing ? (
              <input
                type="text"
                value={editData.title || ""}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, title: e.target.value }))
                }
                className="w-full text-2xl font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-800"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {incident.title}
              </h1>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Created {timeAgo(incident.createdAt)}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span>Updated {timeAgo(incident.updatedAt)}</span>
            </div>
          </div>

          {/* Status & Severity row */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {/* Severity */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Severity
              </label>
              {isEditing ? (
                <select
                  value={editData.severity}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, severity: e.target.value as Severity }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <SeverityBadge severity={incident.severity} />
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, status: e.target.value as Status }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={incident.status} />
              )}
            </div>

            {/* Service */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Service
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.service || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, service: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300">
                    {incident.service}
                  </span>
                </div>
              )}
            </div>

            {/* Owner */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Owner
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.owner || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, owner: e.target.value || null }))
                  }
                  placeholder="Unassigned"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {incident.owner || (
                      <span className="text-gray-400 dark:text-gray-600 italic">Unassigned</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Summary
          </h2>
          {isEditing ? (
            <textarea
              value={editData.summary || ""}
              onChange={(e) =>
                setEditData((d) => ({ ...d, summary: e.target.value || null }))
              }
              rows={5}
              placeholder="Add a summary..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {incident.summary || (
                <span className="text-gray-400 dark:text-gray-600 italic">No summary provided</span>
              )}
            </p>
          )}
        </div>

        {/* Timestamps */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Timeline
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(incident.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(incident.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
