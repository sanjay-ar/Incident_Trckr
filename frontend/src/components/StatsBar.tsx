import { AlertTriangle, Shield, CheckCircle2, Activity } from "lucide-react";
import type { IncidentsResponse } from "../types/incident";

interface StatsBarProps {
  data: IncidentsResponse | undefined;
}

export function StatsBar({ data }: StatsBarProps) {
  const total = data?.pagination.total ?? 0;

  // count from current visible data as a quick stat
  // (in real app you'd have a dedicated stats endpoint)
  const stats = {
    total,
    open: data?.data.filter((i) => i.status === "OPEN").length ?? 0,
    mitigated: data?.data.filter((i) => i.status === "MITIGATED").length ?? 0,
    resolved: data?.data.filter((i) => i.status === "RESOLVED").length ?? 0,
  };

  const cards = [
    {
      label: "Total Incidents",
      value: total,
      icon: Activity,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800",
    },
    {
      label: "Open",
      value: stats.open,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Mitigated",
      value: stats.mitigated,
      icon: Shield,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 transition-all hover:shadow-md"
        >
          <div className={`p-2.5 rounded-lg ${card.bg}`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
