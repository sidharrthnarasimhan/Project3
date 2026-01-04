import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Link as LinkIcon, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Avatar from "@/components/common/Avatar";
import { Checkbox } from "@/components/ui/checkbox";

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  blocked: AlertCircle,
  done: CheckCircle2,
};

export default function TaskCard({ task, onStatusChange, onClick, users = [] }) {
  const Icon = statusIcons[task.status] || Circle;
  const assignee = users.find(u => u.email === task.assignee);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  const getDueDateStatus = () => {
    if (!task.due_date || task.status === "done") return null;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Overdue", color: "rose" };
    if (diffDays === 0) return { label: "Due today", color: "amber" };
    if (diffDays === 1) return { label: "Due tomorrow", color: "amber" };
    if (diffDays <= 3) return { label: `${diffDays} days`, color: "blue" };
    return { label: format(dueDate, "MMM d"), color: "zinc" };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl bg-white dark:bg-zinc-800 border p-4 hover:shadow-md transition-all duration-200 cursor-pointer group",
        task.status === "done" ? "border-zinc-100 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50" : "border-zinc-100 dark:border-zinc-700 hover:border-zinc-200 dark:hover:border-zinc-600",
        isOverdue && "border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange && onStatusChange(task.status === "done" ? "todo" : "done");
          }}
          className={cn(
            "mt-0.5 shrink-0 transition-colors",
            task.status === "done" ? "text-emerald-500 dark:text-emerald-400" : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 dark:hover:text-zinc-500"
          )}
        >
          <Icon className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
            task.status === "done" && "line-through text-zinc-400 dark:text-zinc-500"
          )}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <StatusBadge status={task.priority} />

            {dueDateStatus && (
              <span className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md",
                dueDateStatus.color === "rose" && "text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50",
                dueDateStatus.color === "amber" && "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50",
                dueDateStatus.color === "blue" && "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50",
                dueDateStatus.color === "zinc" && "text-zinc-600 dark:text-zinc-400"
              )}>
                <Calendar className="w-3.5 h-3.5" />
                {dueDateStatus.label}
              </span>
            )}

            {task.decision_id && (
              <span className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400">
                <LinkIcon className="w-3.5 h-3.5" />
                Linked
              </span>
            )}
          </div>
        </div>

        {assignee && (
          <Avatar
            name={assignee.full_name}
            email={assignee.email}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}