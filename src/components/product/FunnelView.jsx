import { CheckCircle2, MessageSquare, Lightbulb, Target, Clock, Circle } from "lucide-react";

export default function FunnelView({ decisions, tasks }) {
  const decidedCount = decisions.filter(d => d.status === 'decided').length;
  const discussionCount = decisions.filter(d => d.status === 'discussion').length;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const totalTasks = tasks.length;

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Strategy Layer */}
      <div className="relative">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Strategy Layer
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              Decisions
            </h3>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {decisions.length}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Decided</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {decidedCount}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Discussion</span>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {discussionCount}
              </p>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600"></div>
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-400 dark:border-t-blue-600"></div>
          </div>
        </div>
      </div>

      {/* Execution Layer */}
      <div className="relative">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Execution Layer
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 p-8 mx-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Tasks In Progress
            </h3>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {inProgressTasks + blockedTasks + todoTasks}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Active</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  In Progress
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {inProgressTasks}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Todo
                </span>
              </div>
              <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                {todoTasks}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <span className="text-rose-600 dark:text-rose-400 text-xs">!</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Blocked
                </span>
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {blockedTasks}
              </p>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-emerald-400 dark:from-blue-600 dark:to-emerald-600"></div>
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-emerald-400 dark:border-t-emerald-600"></div>
          </div>
        </div>
      </div>

      {/* Completion Layer */}
      <div className="relative">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Completion Layer
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 p-8 mx-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
              Tasks Completed
            </h3>
            <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {completedTasks}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-48 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {progressPercentage}%
              </span>
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-2">
              Overall Progress
            </p>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-center pt-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Decisions drive tasks. Tasks create value. Value builds products.
        </p>
      </div>
    </div>
  );
}
