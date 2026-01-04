import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Vote, 
  CheckSquare, 
  Megaphone, 
  Users, 
  TrendingUp,
  Clock,
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickAction from "@/components/dashboard/QuickAction";
import WidgetCard from "@/components/dashboard/WidgetCard";
import ActivityItem from "@/components/dashboard/ActivityItem";
import ExternalWidget from "@/components/dashboard/ExternalWidget";
import TimeTrackerWidget from "@/components/dashboard/TimeTrackerWidget";
import DecisionCard from "@/components/decisions/DecisionCard";
import TaskCard from "@/components/tasks/TaskCard";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import DecisionForm from "@/components/decisions/DecisionForm";
import TaskForm from "@/components/tasks/TaskForm";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: decisions = [] } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => base44.entities.Decision.list("-created_date", 10),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 10),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date", 5),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments"],
    queryFn: () => base44.entities.Comment.list("-created_date", 20),
  });

  const pendingDecisions = decisions.filter(d => d.status === "discussion" || d.status === "voting");
  const myTasks = tasks.filter(t => t.assignee === currentUser?.email && t.status !== "done");
  const pinnedAnnouncements = announcements.filter(a => a.pinned);

  const getCommentCount = (decisionId) => comments.filter(c => c.entity_id === decisionId).length;

  const handleCreateDecision = async (data) => {
    await base44.entities.Decision.create({
      ...data,
      owner: currentUser?.email,
      status: "discussion",
    });
    setShowDecisionForm(false);
  };

  const handleCreateTask = async (data) => {
    await base44.entities.Task.create(data);
    setShowTaskForm(false);
  };

  const handleCreateAnnouncement = async (data) => {
    await base44.entities.Announcement.create({
      ...data,
      author: currentUser?.email,
      author_name: currentUser?.full_name,
    });
    setShowAnnouncementForm(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {currentUser?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Here's what's happening in your team today.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Open Decisions"
            value={pendingDecisions.length}
            icon={Vote}
            subtitle="Need your input"
          />
          <StatsCard
            title="Your Tasks"
            value={myTasks.length}
            icon={CheckSquare}
            subtitle="In progress"
          />
          <StatsCard
            title="Team Members"
            value={users.length}
            icon={Users}
            subtitle="Active"
          />
          <StatsCard
            title="This Week"
            value={decisions.filter(d => d.status === "decided" && new Date(d.decided_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            icon={TrendingUp}
            subtitle="Decisions made"
            trend={{ positive: true, value: "+12%" }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickAction
            title="Start a Decision"
            description="Open a discussion"
            icon={Vote}
            color="indigo"
            onClick={() => setShowDecisionForm(true)}
          />
          <QuickAction
            title="Create Task"
            description="Track an action item"
            icon={CheckSquare}
            color="emerald"
            onClick={() => setShowTaskForm(true)}
          />
          <QuickAction
            title="Post Announcement"
            description="Share with the team"
            icon={Megaphone}
            color="amber"
            onClick={() => setShowAnnouncementForm(true)}
          />
          <QuickAction
            title="Team Directory"
            description="View all members"
            icon={Users}
            color="violet"
            onClick={() => window.location.href = createPageUrl("People")}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Decisions & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Decisions */}
            <WidgetCard
              title="Active Decisions"
              icon={Vote}
              action={
                <Link to={createPageUrl("Decisions")}>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {pendingDecisions.length > 0 ? (
                <div className="space-y-3">
                  {pendingDecisions.slice(0, 3).map(decision => (
                    <DecisionCard 
                      key={decision.id} 
                      decision={decision}
                      commentCount={getCommentCount(decision.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <Vote className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No active decisions</p>
                </div>
              )}
            </WidgetCard>

            {/* My Tasks */}
            <WidgetCard
              title="Your Tasks"
              icon={CheckSquare}
              action={
                <Link to={createPageUrl("Tasks")}>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {myTasks.length > 0 ? (
                <div className="space-y-3">
                  {myTasks.slice(0, 4).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      users={users}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No tasks assigned to you</p>
                </div>
              )}
            </WidgetCard>

            {/* Announcements */}
            <WidgetCard
              title="Announcements"
              icon={Megaphone}
              action={
                <Link to={createPageUrl("Announcements")}>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.slice(0, 2).map(announcement => (
                    <AnnouncementCard 
                      key={announcement.id} 
                      announcement={announcement}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              )}
            </WidgetCard>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            {/* Time Tracker for non-managers */}
            <TimeTrackerWidget currentUser={currentUser} />

            <ExternalWidget
              type="slack"
              onConvert={(item) => {
                setShowDecisionForm(true);
              }}
            />
            <ExternalWidget
              type="email"
              onConvert={(item) => {
                setShowDecisionForm(true);
              }}
            />
            <ExternalWidget type="calendar" />
          </div>
        </div>
      </div>

      {/* Forms */}
      <DecisionForm
        open={showDecisionForm}
        onClose={() => setShowDecisionForm(false)}
        onSubmit={handleCreateDecision}
      />
      <TaskForm
        open={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleCreateTask}
        users={users}
        decisions={decisions}
      />
      <AnnouncementForm
        open={showAnnouncementForm}
        onClose={() => setShowAnnouncementForm(false)}
        onSubmit={handleCreateAnnouncement}
      />
    </div>
  );
}