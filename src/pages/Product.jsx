import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProductStats from "@/components/product/ProductStats";
import CategoryView from "@/components/product/CategoryView";
import FunnelView from "@/components/product/FunnelView";
import GraphView from "@/components/product/GraphView";
import TimelineView from "@/components/product/TimelineView";
import ViewToggle from "@/components/product/ViewToggle";
import { Rocket } from "lucide-react";

export default function Product() {
  const [currentView, setCurrentView] = useState('category');

  const { data: decisions = [], isLoading: loadingDecisions } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => base44.entities.Decision.list("-created_date"),
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const { data: milestones = [], isLoading: loadingMilestones } = useQuery({
    queryKey: ["milestones"],
    queryFn: () => base44.entities.Milestone.list("-date"),
  });

  const isLoading = loadingDecisions || loadingTasks || loadingMilestones;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
            <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Product Dashboard
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Track decisions and tasks shaping your product
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>

        {/* Stats */}
        <ProductStats decisions={decisions} tasks={tasks} />

        {/* Main Content - View Switcher */}
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-8">
          {currentView === 'category' && (
            <CategoryView decisions={decisions} tasks={tasks} />
          )}
          {currentView === 'funnel' && (
            <FunnelView decisions={decisions} tasks={tasks} />
          )}
          {currentView === 'graph' && (
            <GraphView decisions={decisions} tasks={tasks} />
          )}
          {currentView === 'timeline' && (
            <TimelineView decisions={decisions} tasks={tasks} milestones={milestones} />
          )}
        </div>
      </div>
    </div>
  );
}
