import { TrendingUp, CheckCircle2, MessageSquare, Zap } from "lucide-react";

export default function ProductStats({ decisions, tasks }) {
  const decidedCount = decisions.filter(d => d.status === 'decided').length;
  const discussionCount = decisions.filter(d => d.status === 'discussion').length;

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate velocity (tasks completed in last week)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentlyCompleted = tasks.filter(t => {
    if (t.status !== 'done') return false;
    const createdDate = new Date(t.created_date);
    return createdDate >= oneWeekAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Overall Progress */}
      <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Overall Progress</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {progressPercentage}%
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {completedTasks}/{totalTasks}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Decisions */}
      <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Decisions</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {decidedCount}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">decided</p>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {discussionCount} in discussion
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Tasks</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {completedTasks}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">done</p>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {totalTasks - completedTasks} remaining
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Velocity */}
      <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Velocity</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {recentlyCompleted}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">this week</p>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {recentlyCompleted > 0 ? '+' : ''}{recentlyCompleted} tasks
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
