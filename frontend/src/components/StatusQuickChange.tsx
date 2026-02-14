import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { updateIncident } from "../lib/api";
import { useToast } from "./Toast";
import type { Status } from "../types/incident";

const STATUS_CONFIG: Record<Status, { label: string; className: string; dot: string }> = {
  OPEN: {
    label: "Open",
    className: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
    dot: "bg-red-500",
  },
  MITIGATED: {
    label: "Mitigated",
    className: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    dot: "bg-amber-500",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
};

const ALL_STATUSES: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];

interface StatusQuickChangeProps {
  incidentId: string;
  currentStatus: Status;
}

export function StatusQuickChange({ incidentId, currentStatus }: StatusQuickChangeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (status: Status) => updateIncident(incidentId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast("Status updated", "success");
    },
    onError: (err: Error) => {
      toast(err.message, "error");
    },
  });

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const config = STATUS_CONFIG[currentStatus];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 dark:hover:ring-gray-600 dark:hover:ring-offset-gray-900 transition-all",
          config.className
        )}
      >
        <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
        {mutation.isPending ? "..." : config.label}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[130px] animate-in fade-in">
          {ALL_STATUSES.filter((s) => s !== currentStatus).map((status) => {
            const cfg = STATUS_CONFIG[status];
            return (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  mutation.mutate(status);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className={clsx("w-2 h-2 rounded-full", cfg.dot)} />
                <span className="text-gray-700 dark:text-gray-300">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
