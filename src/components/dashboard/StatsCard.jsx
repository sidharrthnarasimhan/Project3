import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 p-6 border border-zinc-100 dark:border-zinc-700",
      "hover:shadow-lg hover:shadow-zinc-100/50 dark:hover:shadow-zinc-800/50 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.positive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
            )}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-700">
            <Icon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          </div>
        )}
      </div>
    </div>
  );
}