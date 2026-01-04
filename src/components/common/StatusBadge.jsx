import { cn } from "@/lib/utils";

const statusConfig = {
  // Decision statuses
  discussion: { label: "Discussion", color: "bg-blue-50 text-blue-700 border-blue-200" },
  voting: { label: "Voting", color: "bg-amber-50 text-amber-700 border-amber-200" },
  decided: { label: "Decided", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  archived: { label: "Archived", color: "bg-zinc-50 text-zinc-600 border-zinc-200" },
  
  // Task statuses
  todo: { label: "To Do", color: "bg-zinc-50 text-zinc-600 border-zinc-200" },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200" },
  blocked: { label: "Blocked", color: "bg-rose-50 text-rose-700 border-rose-200" },
  done: { label: "Done", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  
  // Leave statuses
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200" },
  
  // Priority
  low: { label: "Low", color: "bg-zinc-50 text-zinc-600 border-zinc-200" },
  medium: { label: "Medium", color: "bg-blue-50 text-blue-700 border-blue-200" },
  high: { label: "High", color: "bg-amber-50 text-amber-700 border-amber-200" },
  critical: { label: "Critical", color: "bg-rose-50 text-rose-700 border-rose-200" },
  urgent: { label: "Urgent", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { label: status, color: "bg-zinc-50 text-zinc-600 border-zinc-200" };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
}