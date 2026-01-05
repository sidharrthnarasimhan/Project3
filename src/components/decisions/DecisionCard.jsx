import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { MessageCircle, Users, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Avatar from "@/components/common/Avatar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryIcons = {
  product: "🎯",
  engineering: "⚙️",
  hiring: "👥",
  finance: "💰",
  strategy: "🧭",
  operations: "📋",
  other: "📌",
};

export default function DecisionCard({ decision, commentCount = 0 }) {
  return (
    <Link 
      to={createPageUrl("DecisionDetail") + `?id=${decision.id}`}
      className="block group"
    >
      <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-5 hover:border-zinc-200 dark:hover:border-zinc-600 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="text-2xl">
            {categoryIcons[decision.category] || "📌"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {decision.title}
              </h3>
              <StatusBadge status={decision.status} />
            </div>

            {decision.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                {decision.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                {commentCount} comments
              </span>
              {decision.participants?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {decision.participants.length} participants
                </span>
              )}
              <span>
                {formatDistanceToNow(new Date(decision.created_date), { addSuffix: true })}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}