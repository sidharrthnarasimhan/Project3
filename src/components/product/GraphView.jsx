import { useState } from "react";
import { Diamond, Square, CheckCircle2, Circle, Clock, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  engineering: '#3b82f6',
  product: '#a855f7',
  hiring: '#10b981',
  business: '#f59e0b',
};

export default function GraphView({ decisions, tasks }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Group tasks by related decision
  const decisionTasks = decisions.map(decision => ({
    decision,
    tasks: tasks.filter(t => t.related_decision_id === decision.id),
  }));

  // Orphan tasks (no related decision)
  const orphanTasks = tasks.filter(t => !t.related_decision_id);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
      case 'blocked':
        return <Ban className="w-3 h-3 text-rose-600 dark:text-rose-400" />;
      default:
        return <Circle className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'in_progress':
        return 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'blocked':
        return 'border-rose-500 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20';
      default:
        return 'border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Diamond className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Decision</span>
        </div>
        <div className="flex items-center gap-2">
          <Square className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Task</span>
        </div>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600"></div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500"></div>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-300 dark:bg-zinc-600"></div>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Todo</span>
        </div>
      </div>

      {/* Graph Container */}
      <div className="space-y-12">
        {decisionTasks.map(({ decision, tasks: relatedTasks }) => (
          <div key={decision.id} className="relative">
            {/* Decision Node */}
            <div className="flex justify-center mb-8">
              <Link
                to={createPageUrl('DecisionDetail') + `?id=${decision.id}`}
                className="group"
                onMouseEnter={() => setSelectedNode(decision.id)}
                onMouseLeave={() => setSelectedNode(null)}
              >
                <div
                  className="relative inline-flex items-center gap-3 px-6 py-4 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: categoryColors[decision.category] || categoryColors.engineering,
                    backgroundColor: selectedNode === decision.id
                      ? `${categoryColors[decision.category]}15`
                      : 'white',
                  }}
                >
                  <Diamond
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: categoryColors[decision.category] }}
                  />
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {decision.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                      {decision.category} • {decision.status}
                    </p>
                  </div>
                  {decision.status === 'decided' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
              </Link>
            </div>

            {/* Connection Lines */}
            {relatedTasks.length > 0 && (
              <div className="flex justify-center mb-6">
                <div className="flex flex-col items-center">
                  <div
                    className="w-0.5 h-8"
                    style={{
                      backgroundColor: categoryColors[decision.category] || categoryColors.engineering,
                      opacity: 0.5,
                    }}
                  ></div>
                  <div
                    className="w-32 h-0.5"
                    style={{
                      backgroundColor: categoryColors[decision.category] || categoryColors.engineering,
                      opacity: 0.5,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Task Nodes */}
            {relatedTasks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {relatedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`relative rounded-xl border-2 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${getStatusColor(
                      task.status
                    )}`}
                    onMouseEnter={() => setSelectedNode(task.id)}
                    onMouseLeave={() => setSelectedNode(null)}
                  >
                    <div className="flex items-start gap-3">
                      <Square
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: categoryColors[task.category] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        {task.priority === 'high' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                              High Priority
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Orphan Tasks */}
        {orphanTasks.length > 0 && (
          <div className="relative pt-8 border-t border-zinc-300 dark:border-zinc-700">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Unlinked Tasks
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {orphanTasks.map(task => (
                <div
                  key={task.id}
                  className={`relative rounded-xl border-2 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${getStatusColor(
                    task.status
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <Square
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: categoryColors[task.category] || '#6b7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center pt-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Hover over nodes to highlight. Click decisions to view details.
        </p>
      </div>
    </div>
  );
}
