import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, Calendar, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamMemberCard from "@/components/people/TeamMemberCard";
import LeaveRequestCard from "@/components/people/LeaveRequestCard";
import LeaveRequestForm from "@/components/people/LeaveRequestForm";
import EmptyState from "@/components/common/EmptyState";

export default function People() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("directory");
  const [leaveFilter, setLeaveFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list("-created_date"),
  });

  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_date"),
  });

  const filteredUsers = users.filter(u =>
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredLeave = leaveRequests.filter(r => {
    if (leaveFilter === "pending") return r.status === "pending";
    if (leaveFilter === "my") return r.requester === currentUser?.email;
    return true;
  });

  const isAdmin = currentUser?.role === "admin";

  const handleCreateLeave = async (data) => {
    await base44.entities.LeaveRequest.create({
      ...data,
      requester: currentUser?.email,
      requester_name: currentUser?.full_name,
    });
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    setShowLeaveForm(false);
  };

  const handleApproveLeave = async (request) => {
    await base44.entities.LeaveRequest.update(request.id, {
      status: "approved",
      reviewed_by: currentUser?.email,
      reviewed_date: new Date().toISOString().split("T")[0],
    });
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
  };

  const handleRejectLeave = async (request) => {
    await base44.entities.LeaveRequest.update(request.id, {
      status: "rejected",
      reviewed_by: currentUser?.email,
      reviewed_date: new Date().toISOString().split("T")[0],
    });
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">People</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Team directory and leave management</p>
          </div>
          <Button onClick={() => setShowLeaveForm(true)} className="gap-2">
            <Calendar className="w-4 h-4" />
            Request Leave
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="directory" className="gap-2">
              <Users className="w-4 h-4" />
              Directory ({users.length})
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-2">
              <Calendar className="w-4 h-4" />
              Leave Requests
              {leaveRequests.filter(r => r.status === "pending").length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                  {leaveRequests.filter(r => r.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "directory" && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>

            {/* Team Grid */}
            {usersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(user => (
                  <TeamMemberCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No team members found"
                description="Try adjusting your search"
              />
            )}
          </>
        )}

        {activeTab === "leave" && (
          <>
            {/* Leave Filters */}
            <div className="mb-6">
              <Tabs value={leaveFilter} onValueChange={setLeaveFilter}>
                <TabsList>
                  <TabsTrigger value="all">All Requests</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending
                    {leaveRequests.filter(r => r.status === "pending").length > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                        {leaveRequests.filter(r => r.status === "pending").length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="my">My Requests</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Leave Requests */}
            {leaveLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredLeave.length > 0 ? (
              <div className="space-y-4">
                {filteredLeave.map(request => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    users={users}
                    isAdmin={isAdmin}
                    onApprove={() => handleApproveLeave(request)}
                    onReject={() => handleRejectLeave(request)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No leave requests"
                description={leaveFilter === "my" ? "You haven't submitted any leave requests" : "No leave requests to show"}
                action={() => setShowLeaveForm(true)}
                actionLabel="Request Leave"
              />
            )}
          </>
        )}
      </div>

      <LeaveRequestForm
        open={showLeaveForm}
        onClose={() => setShowLeaveForm(false)}
        onSubmit={handleCreateLeave}
      />
    </div>
  );
}