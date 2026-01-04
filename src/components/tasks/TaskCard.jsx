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

  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-xl bg-white border p-4 hover:shadow-md transition-all duration-200 cursor-pointer group",
        task.status === "done" ? "border-zinc-100 bg-zinc-50/50" : "border-zinc-100 hover:border-zinc-200",
        isOverdue && "border-rose-200"
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
            task.status === "done" ? "text-emerald-500" : "text-zinc-300 hover:text-zinc-400"
          )}
        >
          <Icon className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-zinc-900 group-hover:text-indigo-600 transition-colors",
            task.status === "done" && "line-through text-zinc-400"
          )}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-zinc-500 line-clamp-1 mt-1">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <StatusBadge status={task.priority} />
            
            {task.due_date && (
              <span className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-rose-600" : "text-zinc-400"
              )}>
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(task.due_date), "MMM d")}
              </span>
            )}

            {task.decision_id && (
              <span className="flex items-center gap-1 text-xs text-indigo-500">
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