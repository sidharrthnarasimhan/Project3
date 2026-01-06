import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, CheckSquare, LayoutGrid, List, ArrowUpDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import TaskImportDialog from "@/components/tasks/TaskImportDialog";
import EmptyState from "@/components/common/EmptyState";

export default function Tasks() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_at"),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => base44.entities.Decision.list(),
  });

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesAssignee = assigneeFilter === "all" ||
      (assigneeFilter === "me" && t.assignee === currentUser?.email) ||
      (assigneeFilter === "unassigned" && !t.assignee);
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesAssignee && matchesPriority;
  }).sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

    switch (sortBy) {
      case "priority":
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case "due_date":
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      case "created":
      default:
        // Handle both created_at (database) and created_date (demo mode)
        const dateA = new Date(a.created_at || a.created_date);
        const dateB = new Date(b.created_at || b.created_date);
        return dateB - dateA;
    }
  });

  const handleCreate = async (data) => {
    await base44.entities.Task.create(data);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    await base44.entities.Task.update(editingTask.id, data);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setEditingTask(null);
  };

  const handleStatusChange = async (task, newStatus) => {
    await base44.entities.Task.update(task.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleBulkImport = async (tasksToImport) => {
    for (const taskData of tasksToImport) {
      await base44.entities.Task.create(taskData);
    }
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    setShowImportDialog(false);
  };

  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  // Group tasks by status for kanban-like view
  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === "todo"),
    in_progress: filteredTasks.filter(t => t.status === "in_progress"),
    blocked: filteredTasks.filter(t => t.status === "blocked"),
    done: filteredTasks.filter(t => t.status === "done"),
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Tasks</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track action items and follow-ups</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileSpreadsheet className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import from CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Tabs value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="me">My Tasks</TabsTrigger>
                <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Latest First</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="todo">To Do ({statusCounts.todo})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({statusCounts.in_progress})</TabsTrigger>
            <TabsTrigger value="blocked">Blocked ({statusCounts.blocked})</TabsTrigger>
            <TabsTrigger value="done">Done ({statusCounts.done})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onClick={() => setEditingTask(task)}
                onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first task to get started"}
            action={() => setShowForm(true)}
            actionLabel="Create Task"
          />
        )}
      </div>

      <TaskForm
        open={showForm || !!editingTask}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        initialData={editingTask}
        users={users}
        decisions={decisions}
      />

      <TaskImportDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleBulkImport}
        users={users}
      />
    </div>
  );
}