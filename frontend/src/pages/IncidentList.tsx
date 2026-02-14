import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  AlertTriangle,
  RefreshCw,
  Moon,
  Sun,
  Keyboard,
  Download,
} from "lucide-react";
import { clsx } from "clsx";
import { fetchIncidents } from "../lib/api";
import { useDebounce } from "../hooks/useDebounce";
import { useDarkMode } from "../hooks/useDarkMode";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useToast } from "../components/Toast";
import { SeverityBadge } from "../components/SeverityBadge";
import { StatusQuickChange } from "../components/StatusQuickChange";
import { Pagination } from "../components/Pagination";
import { TableSkeleton } from "../components/TableSkeleton";
import { EmptyState } from "../components/EmptyState";
import { CreateIncidentModal } from "../components/CreateIncidentModal";
import { StatsBar } from "../components/StatsBar";
import { RelativeTime } from "../components/RelativeTime";
import type { Severity, Status, IncidentFilters, Incident } from "../types/incident";

const SEVERITY_OPTIONS: Severity[] = ["SEV1", "SEV2", "SEV3", "SEV4"];
const STATUS_OPTIONS: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];
const PAGE_SIZES = [10, 20, 50];

type SortField = "title" | "severity" | "status" | "service" | "createdAt" | "owner";

export function IncidentList() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 300);

  const filters: IncidentFilters = {
    search: debouncedSearch || undefined,
    severity: severityFilter || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => fetchIncidents(filters),
    placeholderData: (prev) => prev,
  });

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder(field === "createdAt" ? "desc" : "asc");
      }
      setPage(1);
    },
    [sortBy]
  );

  // csv export
  const exportCsv = useCallback(() => {
    if (!data?.data.length) return;
    const headers = ["Title", "Service", "Severity", "Status", "Owner", "Created", "Summary"];
    const escape = (v: string | null) => {
      if (!v) return "";
      const s = v.replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    };
    const rows = data.data.map((i: Incident) => [
      escape(i.title),
      escape(i.service),
      i.severity,
      i.status,
      escape(i.owner),
      new Date(i.createdAt).toISOString(),
      escape(i.summary),
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incidents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported to CSV", "info");
  }, [data, toast]);

  // keyboard shortcuts
  const shortcuts = useMemo(
    () => ({
      n: () => setShowCreateModal(true),
      "/": () => searchRef.current?.focus(),
      r: () => refetch(),
      f: () => setShowFilters((s) => !s),
      d: () => toggleDark(),
      e: () => exportCsv(),
      "?": () => setShowShortcuts((s) => !s),
      Escape: () => {
        setShowCreateModal(false);
        setShowShortcuts(false);
        searchRef.current?.blur();
      },
    }),
    [refetch, toggleDark, exportCsv]
  );
  useKeyboardShortcuts(shortcuts);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
    );
  };

  const activeFilterCount =
    (severityFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white dark:text-gray-900" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Incident Tracker
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* export csv */}
              <button
                onClick={exportCsv}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Export CSV (E)"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* shortcuts hint */}
              <button
                onClick={() => setShowShortcuts((s) => !s)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* dark mode toggle */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Toggle dark mode (D)"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Incident
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Stats */}
        <StatsBar data={data} />

        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, service, owner...  ( / )"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent transition-shadow bg-gray-50 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors",
                showFilters || activeFilterCount > 0
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* page size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh (R)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-gray-100 dark:border-gray-800 pt-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">All severities</option>
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSeverityFilter("");
                      setStatusFilter("");
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  {[
                    { field: "title" as SortField, label: "Title", width: "w-[35%]" },
                    { field: "service" as SortField, label: "Service", width: "w-[13%]" },
                    { field: "severity" as SortField, label: "Severity", width: "w-[10%]" },
                    { field: "status" as SortField, label: "Status", width: "w-[11%]" },
                    { field: "owner" as SortField, label: "Owner", width: "w-[14%]" },
                    { field: "createdAt" as SortField, label: "Created", width: "w-[17%]" },
                  ].map(({ field, label, width }) => (
                    <th
                      key={field}
                      className={clsx(
                        "px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none",
                        width
                      )}
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-1.5">
                        {label}
                        <SortIcon field={field} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading && !data ? (
                  <tr>
                    <td colSpan={6}>
                      <TableSkeleton />
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16 text-red-500">
                        <p className="text-lg font-medium">Error loading incidents</p>
                        <p className="text-sm mt-1">{(error as Error).message}</p>
                        <button
                          onClick={() => refetch()}
                          className="mt-4 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  data?.data.map((incident) => (
                    <tr
                      key={incident.id}
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200">
                          {incident.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300">
                          {incident.service}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={incident.severity} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusQuickChange incidentId={incident.id} currentStatus={incident.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {incident.owner || (
                          <span className="text-gray-400 dark:text-gray-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <RelativeTime date={incident.createdAt} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800">
              <Pagination
                pagination={data.pagination}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </main>

      <CreateIncidentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2.5">
              {[
                { key: "N", desc: "New incident" },
                { key: "/", desc: "Focus search" },
                { key: "R", desc: "Refresh" },
                { key: "F", desc: "Toggle filters" },
                { key: "D", desc: "Toggle dark mode" },
                { key: "E", desc: "Export CSV" },
                { key: "?", desc: "Show shortcuts" },
                { key: "Esc", desc: "Close modal / blur" },
              ].map(({ key, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{desc}</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-5 w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
