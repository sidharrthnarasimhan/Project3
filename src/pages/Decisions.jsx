import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Vote, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DecisionCard from "@/components/decisions/DecisionCard";
import DecisionForm from "@/components/decisions/DecisionForm";
import EmptyState from "@/components/common/EmptyState";

export default function Decisions() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => base44.entities.Decision.list("-created_at"),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments"],
    queryFn: () => base44.entities.Comment.list(),
  });

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || d.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCommentCount = (decisionId) => comments.filter(c => c.entity_id === decisionId).length;

  const handleCreate = async (data) => {
    await base44.entities.Decision.create({
      ...data,
      owner: currentUser?.email,
      status: "discussion",
    });
    queryClient.invalidateQueries({ queryKey: ["decisions"] });
    setShowForm(false);
  };

  const statusCounts = {
    all: decisions.length,
    discussion: decisions.filter(d => d.status === "discussion").length,
    voting: decisions.filter(d => d.status === "voting").length,
    decided: decisions.filter(d => d.status === "decided").length,
    archived: decisions.filter(d => d.status === "archived").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Decisions</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track and participate in team decisions</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Decision
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="discussion">Discussion ({statusCounts.discussion})</TabsTrigger>
              <TabsTrigger value="voting">Voting ({statusCounts.voting})</TabsTrigger>
              <TabsTrigger value="decided">Decided ({statusCounts.decided})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "product", "engineering", "hiring", "finance", "strategy", "operations"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Decisions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredDecisions.length > 0 ? (
          <div className="space-y-4">
            {filteredDecisions.map(decision => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                commentCount={getCommentCount(decision.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Vote}
            title="No decisions found"
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Start your first decision to get the team aligned"}
            action={() => setShowForm(true)}
            actionLabel="Start Decision"
          />
        )}
      </div>

      <DecisionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}