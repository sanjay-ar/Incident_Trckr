import { clsx } from "clsx";
import type { Severity } from "../types/incident";

const severityConfig: Record<Severity, { label: string; className: string }> = {
  SEV1: {
    label: "SEV1",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  SEV2: {
    label: "SEV2",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  SEV3: {
    label: "SEV3",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  SEV4: {
    label: "SEV4",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
