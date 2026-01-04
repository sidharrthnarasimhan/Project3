import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function ActivityItem({ icon: Icon, title, subtitle, time, type, onClick }) {
  const typeColors = {
    decision: "bg-indigo-100 text-indigo-600",
    task: "bg-emerald-100 text-emerald-600",
    announcement: "bg-amber-100 text-amber-600",
    leave: "bg-violet-100 text-violet-600",
    comment: "bg-zinc-100 text-zinc-600",
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors text-left group"
    >
      <div className={cn("p-2 rounded-lg shrink-0", typeColors[type] || "bg-zinc-100 text-zinc-600")}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 group-hover:text-indigo-600 transition-colors truncate">
          {title}
        </p>
        <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-zinc-400 shrink-0">
        {formatDistanceToNow(new Date(time), { addSuffix: true })}
      </span>
    </button>
  );
}