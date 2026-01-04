import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Check, X } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";

const typeEmojis = {
  vacation: "🏖️",
  sick: "🤒",
  personal: "👤",
  parental: "👶",
  other: "📋",
};

export default function LeaveRequestCard({ request, onApprove, onReject, isAdmin, users = [] }) {
  const requester = users.find(u => u.email === request.requester);
  const days = differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1;

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <Avatar
          name={requester?.full_name || request.requester_name}
          email={request.requester}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {requester?.full_name || request.requester_name || "Team Member"}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {typeEmojis[request.type]} {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 mb-2">
            <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            {format(new Date(request.start_date), "MMM d")} - {format(new Date(request.end_date), "MMM d, yyyy")}
            <span className="text-zinc-400 dark:text-zinc-500">({days} day{days > 1 ? "s" : ""})</span>
          </div>

          {request.reason && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{request.reason}</p>
          )}

          {isAdmin && request.status === "pending" && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => onApprove && onApprove()}
                className="bg-emerald-600 hover:bg-emerald-700 gap-1"
              >
                <Check className="w-4 h-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject && onReject()}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}