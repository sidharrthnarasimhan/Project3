import { useState } from "react";
import { format } from "date-fns";
import {
  Diamond,
  Square,
  Flag,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

const categoryColors = {
  engineering: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  product: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  hiring: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  business: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
};

export default function TimelineView({ decisions = [], tasks = [], milestones = [] }) {
  const [filter, setFilter] = useState('all');

  // Safely parse dates with fallback
  const parseDate = (dateString) => {
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  };

  // Combine all items
  const timelineEvents = [
    ...decisions.map(d => ({
      ...d,
      type: 'decision',
      // Handle both created_at (database) and created_date (demo mode)
      eventDate: parseDate(d.created_at || d.created_date),
    })),
    ...tasks.map(t => ({
      ...t,
      type: 'task',
      // Handle both created_at (database) and created_date (demo mode)
      eventDate: parseDate(t.created_at || t.created_date),
    })),
    ...milestones.map(m => ({
      ...m,
      type: 'milestone',
      eventDate: parseDate(m.date),
    })),
  ];

  // Sort by date
  const sortedEvents = timelineEvents.sort((a, b) => b.eventDate - a.eventDate);

  // Filter
  const now = new Date();
  const filteredEvents = sortedEvents.filter(event => {
    if (filter === 'past') {
      return event.eventDate < now;
    } else if (filter === 'upcoming') {
      return event.eventDate >= now || (event.type === 'milestone' && event.status !== 'completed');
    }
    return true;
  });

  const renderEvent = (event, index) => {
    const colors = categoryColors[event.category] || categoryColors.engineering;
    const isLast = index === filteredEvents.length - 1;

    return (
      <div key={`${event.type}-${event.id}`} className="relative pb-8">
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-full bg-zinc-200 dark:bg-zinc-700"></div>
        )}

        <div className="flex gap-6">
          {/* Icon */}
          <div className={`relative flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md z-10`}>
            {event.type === 'milestone' && <Flag className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            {event.type === 'decision' && <Diamond className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            {event.type === 'task' && <Square className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            <div className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}>
                      {event.type}
                    </span>
                    {event.status === 'decided' && event.type === 'decision' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {event.status === 'completed' && event.type === 'milestone' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {event.description}
                    </p>
                  )}
                  {event.milestone_type && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
                      {event.milestone_type}
                    </span>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {format(event.eventDate, 'MMM d, yyyy')}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text} capitalize`}>
                    {event.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">Debug Info:</p>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Decisions: {decisions.length} | Tasks: {tasks.length} | Milestones: {milestones.length} | Total Events: {timelineEvents.length}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          All Events ({timelineEvents.length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'past'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1" />
          Past
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1" />
          Upcoming
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              No events to display
            </p>
          </div>
        ) : (
          <div>
            {filteredEvents.map((event, index) => renderEvent(event, index))}
          </div>
        )}
      </div>
    </div>
  );
}
