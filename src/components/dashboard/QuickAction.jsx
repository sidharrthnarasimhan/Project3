import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function QuickAction({ title, description, icon: Icon, onClick, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
  };

  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all duration-200 text-left"
    >
      <div className={cn("p-3 rounded-xl transition-colors", colorClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900">{title}</p>
        <p className="text-sm text-zinc-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
    </button>
  );
}