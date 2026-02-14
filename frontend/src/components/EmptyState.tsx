import { SearchX } from "lucide-react";

export function EmptyState({ message = "No incidents found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
      <SearchX className="w-12 h-12 mb-3" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
    </div>
  );
}
