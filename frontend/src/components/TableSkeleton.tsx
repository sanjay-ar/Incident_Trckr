export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-[30%]" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-[15%]" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-[8%]" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-[10%]" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-[12%]" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-[15%]" />
        </div>
      ))}
    </div>
  );
}
