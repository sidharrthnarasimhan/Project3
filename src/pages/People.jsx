import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { isUsingMockClient } from "@/api/clientSelector";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Users, Calendar, UserPlus, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
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
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteError, setInviteError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const queryClient = useQueryClient();
  const usingMock = isUsingMockClient();

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      setCurrentUser(user);

      // If using HTTP client, fetch user's database ID
      if (!usingMock && user && window.Clerk) {
        try {
          const token = await window.Clerk.session.getToken();
          const response = await fetch('http://localhost:3001/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(prev => ({ ...prev, dbId: data.data.id }));
          }
        } catch (err) {
          console.error('Failed to fetch user DB ID:', err);
        }
      }
    }).catch(() => {});
  }, [usingMock]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list("-created_at"),
  });

  const { data: leaveRequests = [], isLoading: leaveLoading } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_at"),
  });

  // Fetch organization members and invitations (only for HTTP client)
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      if (usingMock) return [];
      const orgId = localStorage.getItem('current_org_id');
      if (!orgId) return [];

      const token = await window.Clerk.session.getToken();
      const response = await fetch(`http://localhost:3001/api/orgs/${orgId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch members');
      const data = await response.json();
      return data.data || [];
    },
    enabled: !usingMock,
  });

  const { data: invitations = [], isLoading: invitationsLoading, refetch: refetchInvitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      if (usingMock) return [];
      const orgId = localStorage.getItem('current_org_id');
      if (!orgId) return [];

      const token = await window.Clerk.session.getToken();
      const response = await fetch(`http://localhost:3001/api/orgs/${orgId}/invitations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch invitations');
      const data = await response.json();
      return data.data || [];
    },
    enabled: !usingMock,
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

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteLoading(true);

    try {
      const orgId = localStorage.getItem('current_org_id');
      const token = await window.Clerk.session.getToken();

      const response = await fetch(`http://localhost:3001/api/orgs/${orgId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send invitation');
      }

      // Success
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("member");
      refetchInvitations();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`http://localhost:3001/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to cancel invitation');
      refetchInvitations();
    } catch (err) {
      console.error('Failed to cancel invitation:', err);
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      const orgId = localStorage.getItem('current_org_id');
      const token = await window.Clerk.session.getToken();

      const response = await fetch(`http://localhost:3001/api/orgs/${orgId}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update role');
      refetchMembers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const orgId = localStorage.getItem('current_org_id');
      const token = await window.Clerk.session.getToken();

      const response = await fetch(`http://localhost:3001/api/orgs/${orgId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to remove member');
      refetchMembers();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
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
            {!usingMock && (
              <TabsTrigger value="members" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Members ({members.length})
                {invitations.filter(i => i.status === "pending").length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                    {invitations.filter(i => i.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
            )}
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

        {activeTab === "members" && !usingMock && (
          <>
            {/* Header with Invite Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Organization Members</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage member roles and invitations</p>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </Button>
              )}
            </div>

            {/* Current Members */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Active Members</h3>
              {membersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-white dark:bg-zinc-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map(member => (
                    <Card key={member.user_id} className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                              {member.full_name?.[0] || member.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                {member.full_name || member.email}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin && member.user_id !== currentUser?.dbId ? (
                              <Select
                                value={member.role}
                                onValueChange={(newRole) => handleUpdateMemberRole(member.user_id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="guest">Guest</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                {member.role}
                              </span>
                            )}
                            {isAdmin && member.user_id !== currentUser?.dbId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.user_id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No members yet"
                  description="Invite your first team member to get started"
                  action={() => setShowInviteDialog(true)}
                  actionLabel="Invite Member"
                />
              )}
            </div>

            {/* Pending Invitations */}
            {invitations.filter(i => i.status === 'pending').length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">Pending Invitations</h3>
                <div className="space-y-3">
                  {invitations.filter(i => i.status === 'pending').map(invitation => (
                    <Card key={invitation.id} className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">{invitation.email}</p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Invited as {invitation.role} • {new Date(invitation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              Pending
                            </span>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization. They'll receive access once they accept.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteMember}>
            <div className="space-y-4 py-4">
              {inviteError && (
                <Alert variant="destructive">
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={inviteLoading}
                  autoFocus
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  They'll need to sign up with this email to accept
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role" disabled={inviteLoading}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-zinc-500">Full access to all features</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="manager">
                      <div>
                        <p className="font-medium">Manager</p>
                        <p className="text-xs text-zinc-500">Can manage team and content</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div>
                        <p className="font-medium">Member</p>
                        <p className="text-xs text-zinc-500">Standard access to features</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="guest">
                      <div>
                        <p className="font-medium">Guest</p>
                        <p className="text-xs text-zinc-500">Limited read-only access</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                disabled={inviteLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteLoading} className="gap-2">
                {inviteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}