import { CheckCircle2, Circle, AlertCircle, Clock, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  engineering: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'stroke-blue-600 dark:stroke-blue-400',
  },
  product: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    ring: 'stroke-purple-600 dark:stroke-purple-400',
  },
  hiring: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'stroke-emerald-600 dark:stroke-emerald-400',
  },
  business: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'stroke-amber-600 dark:stroke-amber-400',
  },
};

export default function CategoryCard({ category, decisions, tasks }) {
  const colors = categoryColors[category] || categoryColors.engineering;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const totalTasks = tasks.length;

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const decidedDecisions = decisions.filter(d => d.status === 'decided');
  const discussionDecisions = decisions.filter(d => d.status === 'discussion');

  // Priority tasks
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-6 hover:shadow-lg transition-all duration-200`}>
      {/* Header with Category and Progress */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${colors.text} capitalize mb-1`}>
            {category}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {decisions.length} decision{decisions.length !== 1 ? 's' : ''} • {totalTasks} task{totalTasks !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Progress Ring */}
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-zinc-200 dark:stroke-zinc-700"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className={colors.ring}
              strokeWidth="3"
              strokeDasharray={`${progressPercentage}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${colors.text}`}>
              {progressPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Decisions */}
      {decisions.length > 0 && (
        <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            Decisions
          </p>
          {decidedDecisions.map(decision => (
            <Link
              key={decision.id}
              to={createPageUrl('DecisionDetail') + `?id=${decision.id}`}
              className="flex items-start gap-2 py-1 group"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1">
                {decision.title}
              </span>
            </Link>
          ))}
          {discussionDecisions.map(decision => (
            <Link
              key={decision.id}
              to={createPageUrl('DecisionDetail') + `?id=${decision.id}`}
              className="flex items-start gap-2 py-1 group"
            >
              <Circle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1">
                {decision.title}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Task Status Summary */}
      {totalTasks > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            Task Status
          </p>

          {completedTasks > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-zinc-700 dark:text-zinc-300">Completed</span>
              </div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{completedTasks}</span>
            </div>
          )}

          {inProgressTasks > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-zinc-700 dark:text-zinc-300">In Progress</span>
              </div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{inProgressTasks}</span>
            </div>
          )}

          {blockedTasks > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-zinc-700 dark:text-zinc-300">Blocked</span>
              </div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{blockedTasks}</span>
            </div>
          )}

          {todoTasks > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <span className="text-zinc-700 dark:text-zinc-300">Todo</span>
              </div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{todoTasks}</span>
            </div>
          )}
        </div>
      )}

      {/* Priority Alert */}
      {highPriorityCount > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-rose-700 dark:text-rose-300 font-medium">
              {highPriorityCount} high priority task{highPriorityCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
