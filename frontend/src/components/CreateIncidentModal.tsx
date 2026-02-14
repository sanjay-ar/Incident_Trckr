import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { createIncident } from "../lib/api";
import { useToast } from "./Toast";
import type { Severity } from "../types/incident";

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES = [
  "api-gateway",
  "auth-service",
  "payment-service",
  "user-service",
  "notification-service",
  "search-service",
  "inventory-service",
  "order-service",
  "billing-service",
  "analytics-service",
  "cdn-edge",
  "database-primary",
  "cache-cluster",
  "message-queue",
  "load-balancer",
];

export function CreateIncidentModal({ isOpen, onClose }: CreateIncidentModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    service: SERVICES[0],
    severity: "SEV3" as Severity,
    owner: "",
    summary: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      onClose();
      toast("Incident created successfully", "success");
      setFormData({
        title: "",
        service: SERVICES[0],
        severity: "SEV3",
        owner: "",
        summary: "",
      });
      setErrors({});
    },
    onError: (error: Error) => {
      toast(error.message, "error");
      setErrors({ submit: error.message });
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (formData.title.length > 200)
      newErrors.title = "Title must be 200 characters or less";
    if (!formData.service) newErrors.service = "Service is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      title: formData.title.trim(),
      service: formData.service,
      severity: formData.severity,
      owner: formData.owner.trim() || null,
      summary: formData.summary.trim() || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Incident</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. High latency detected in api-gateway"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-shadow"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Service <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.service}
              onChange={(e) =>
                setFormData((f) => ({ ...f, service: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white transition-shadow"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.service && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.service}</p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Severity
            </label>
            <div className="flex gap-2">
              {(["SEV1", "SEV2", "SEV3", "SEV4"] as Severity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFormData((f) => ({ ...f, severity: sev }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    formData.severity === sev
                      ? sev === "SEV1"
                        ? "bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
                        : sev === "SEV2"
                        ? "bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300"
                        : sev === "SEV3"
                        ? "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300"
                        : "bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Owner <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) =>
                setFormData((f) => ({ ...f, owner: e.target.value }))
              }
              placeholder="e.g. karthik.m"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 transition-shadow"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Summary <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData((f) => ({ ...f, summary: e.target.value }))
              }
              rows={3}
              placeholder="Describe the incident..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 resize-none transition-shadow"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? "Creating..." : "Create Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
