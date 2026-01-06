import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  Target,
  Award,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function TeamGrowthAnalytics({ members = [], invitations = [], users = [] }) {
  const [timeRange, setTimeRange] = useState("30"); // days
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate analytics
  const analytics = calculateAnalytics(members, invitations, users, parseInt(timeRange));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Team Growth Analytics</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Track team growth and engagement</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Members"
          value={analytics.totalMembers}
          change={analytics.memberGrowth}
          trend={analytics.memberGrowth >= 0 ? "up" : "down"}
          color="purple"
        />
        <StatCard
          icon={UserPlus}
          title="New Members"
          value={analytics.newMembers}
          subtitle={`${timeRange} days`}
          color="emerald"
        />
        <StatCard
          icon={Activity}
          title="Pending Invites"
          value={analytics.pendingInvites}
          subtitle="Awaiting acceptance"
          color="amber"
        />
        <StatCard
          icon={Target}
          title="Acceptance Rate"
          value={`${analytics.acceptanceRate}%`}
          change={analytics.acceptanceRateTrend}
          trend={analytics.acceptanceRateTrend >= 0 ? "up" : "down"}
          color="blue"
        />
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth Trend</CardTitle>
              <CardDescription>Team size over time</CardDescription>
            </CardHeader>
            <CardContent>
              <GrowthChart data={analytics.growthData} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invitation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <StatusBar
                    label="Accepted"
                    count={analytics.acceptedInvites}
                    total={analytics.totalInvites}
                    color="emerald"
                  />
                  <StatusBar
                    label="Pending"
                    count={analytics.pendingInvites}
                    total={analytics.totalInvites}
                    color="amber"
                  />
                  <StatusBar
                    label="Expired"
                    count={analytics.expiredInvites}
                    total={analytics.totalInvites}
                    color="red"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Recruiters</CardTitle>
                <CardDescription>Members who invited the most people</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topRecruiters.map((recruiter, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <div className="flex items-center gap-2">
                        {index < 3 && <Award className={cn(
                          "w-4 h-4",
                          index === 0 && "text-yellow-500",
                          index === 1 && "text-zinc-400",
                          index === 2 && "text-amber-600"
                        )} />}
                        <span className="text-sm font-medium">{recruiter.name}</span>
                      </div>
                      <span className="text-sm text-zinc-500">{recruiter.count} invites</span>
                    </div>
                  ))}
                  {analytics.topRecruiters.length === 0 && (
                    <p className="text-sm text-zinc-500 text-center py-4">No data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role Distribution</CardTitle>
              <CardDescription>Team members by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.roleDistribution).map(([role, count]) => (
                  <StatusBar
                    key={role}
                    label={role.charAt(0).toUpperCase() + role.slice(1)}
                    count={count}
                    total={analytics.totalMembers}
                    color={getRoleColor(role)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest team changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <activity.icon className="w-5 h-5 text-zinc-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {activity.description}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {activity.timeAgo}
                      </p>
                    </div>
                  </div>
                ))}
                {analytics.recentActivity.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components

function StatCard({ icon: Icon, title, value, subtitle, change, trend, color }) {
  const colors = {
    purple: "from-purple-600 to-pink-600",
    emerald: "from-emerald-600 to-teal-600",
    amber: "from-amber-600 to-orange-600",
    blue: "from-blue-600 to-indigo-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trend === "up" ? "text-emerald-600" : "text-red-600"
              )}>
                <TrendingUp className={cn(
                  "w-3 h-3",
                  trend === "down" && "rotate-180"
                )} />
                {Math.abs(change)}% {trend === "up" ? "increase" : "decrease"}
              </div>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
            colors[color]
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{count}/{total}</span>
      </div>
      <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function GrowthChart({ data }) {
  // Simple text-based chart for now
  // In a real app, use a charting library like recharts or chart.js
  return (
    <div className="space-y-2">
      {data.map((point, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 w-16">{point.label}</span>
          <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-800 rounded relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
              style={{ width: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%` }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
              {point.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Analytics Calculator
function calculateAnalytics(members, invitations, users, days) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Total members
  const totalMembers = members.length;

  // New members in time range
  const newMembers = members.filter(m => {
    const joinDate = new Date(m.created_at || m.joined_at);
    return joinDate >= startDate;
  }).length;

  // Member growth percentage
  const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
  const previousMembers = members.filter(m => {
    const joinDate = new Date(m.created_at || m.joined_at);
    return joinDate >= previousPeriodStart && joinDate < startDate;
  }).length;
  const memberGrowth = previousMembers > 0 ? Math.round(((newMembers - previousMembers) / previousMembers) * 100) : 0;

  // Invitations
  const pendingInvites = invitations.filter(i => i.status === "pending").length;
  const acceptedInvites = invitations.filter(i => i.status === "accepted").length;
  const expiredInvites = invitations.filter(i => i.status === "expired").length;
  const totalInvites = invitations.length;

  // Acceptance rate
  const acceptanceRate = totalInvites > 0 ? Math.round((acceptedInvites / totalInvites) * 100) : 0;

  // Role distribution
  const roleDistribution = members.reduce((acc, member) => {
    const role = member.role || "member";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // Top recruiters (mock data for now)
  const topRecruiters = [];

  // Growth data for chart
  const growthData = generateGrowthData(members, days);

  // Recent activity
  const recentActivity = generateRecentActivity(members, invitations);

  return {
    totalMembers,
    newMembers,
    memberGrowth,
    pendingInvites,
    acceptedInvites,
    expiredInvites,
    totalInvites,
    acceptanceRate,
    acceptanceRateTrend: 0, // Calculate based on previous period
    roleDistribution,
    topRecruiters,
    growthData,
    recentActivity,
  };
}

function generateGrowthData(members, days) {
  // Generate simple growth data
  const intervals = days <= 7 ? 7 : days <= 30 ? 10 : 12;
  const data = [];

  for (let i = 0; i < intervals; i++) {
    const date = new Date(Date.now() - (intervals - i - 1) * (days / intervals) * 24 * 60 * 60 * 1000);
    const count = members.filter(m => {
      const joinDate = new Date(m.created_at || m.joined_at);
      return joinDate <= date;
    }).length;

    data.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: count,
    });
  }

  return data;
}

function generateRecentActivity(members, invitations) {
  const activity = [];

  // Add member joins
  const recentMembers = members
    .filter(m => m.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  recentMembers.forEach(member => {
    const timeAgo = getTimeAgo(new Date(member.created_at));
    activity.push({
      icon: UserPlus,
      description: `${member.full_name || member.email} joined the team`,
      timeAgo,
    });
  });

  // Add recent invitations
  const recentInvites = invitations
    .filter(i => i.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 2);

  recentInvites.forEach(invite => {
    const timeAgo = getTimeAgo(new Date(invite.created_at));
    activity.push({
      icon: Activity,
      description: `Invitation sent to ${invite.email}`,
      timeAgo,
    });
  });

  return activity.slice(0, 5);
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

function getRoleColor(role) {
  const colors = {
    admin: "purple",
    manager: "blue",
    member: "emerald",
    guest: "amber",
  };
  return colors[role] || "emerald";
}
