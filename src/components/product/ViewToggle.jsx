import { LayoutGrid, TrendingUp, Network, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViewToggle({ currentView, onViewChange }) {
  const views = [
    { id: 'category', label: 'Category', icon: LayoutGrid },
    { id: 'funnel', label: 'Funnel', icon: TrendingUp },
    { id: 'graph', label: 'Graph', icon: Network },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      {views.map(view => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
              isActive
                ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
