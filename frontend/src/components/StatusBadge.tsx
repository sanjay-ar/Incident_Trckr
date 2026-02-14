import { clsx } from "clsx";
import type { Status } from "../types/incident";

const statusConfig: Record<Status, { label: string; className: string; dot: string }> = {
  OPEN: {
    label: "Open",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  MITIGATED: {
    label: "Mitigated",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
