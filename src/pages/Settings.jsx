import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { getData, setData } from "@/api/mockData";
import {
  Settings as SettingsIcon,
  Mail,
  Calendar,
  MessageSquare,
  Building2,
  Palette,
  Users,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  Shield,
  Lock,
  Clock,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [companyName, setCompanyName] = useState("Startup OS");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pagePermissions, setPagePermissions] = useState({});
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'public' });
  const logoInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Integration states (mock for now)
  const [integrations, setIntegrations] = useState({
    gmail: { connected: false, email: "" },
    calendar: { connected: false, email: "" },
    slack: { connected: false, workspace: "" },
  });

  const pages = ['Home', 'Calendar', 'Decisions', 'Tasks', 'Announcements', 'People', 'Settings'];
  const roles = ['admin', 'manager', 'member', 'guest'];

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});

    // Load page permissions
    const permissions = base44.auth.getPagePermissions();
    setPagePermissions(permissions);

    // Load company settings
    const user = base44.auth.getCurrentUser();
    if (user) {
      const allData = getData();
      if (allData.companySettings) {
        setCompanyName(allData.companySettings.name || 'Startup OS');
        setCompanyLogo(allData.companySettings.logo);
      }
    }
  }, []);

  const { data: leaveRequests = [] } = useQuery({
    queryKey: ["leaveRequests"],
    queryFn: () => base44.entities.LeaveRequest.list("-created_date"),
    enabled: !!currentUser?.role && currentUser.role === 'admin',
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => base44.entities.Holiday.list(),
    enabled: !!currentUser?.role && currentUser.role === 'admin',
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["timeEntries"],
    queryFn: () => base44.entities.TimeEntry.list("-created_date"),
    enabled: !!currentUser?.role && currentUser.role === 'admin',
  });

  const handleConnect = (service) => {
    toast.info(`Backend functions not enabled. Enable in Dashboard → Settings to connect ${service}.`);
  };

  const handleDisconnect = (service) => {
    setIntegrations({
      ...integrations,
      [service]: { connected: false },
    });
    toast.success(`${service} disconnected`);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyLogo(reader.result);
      toast.success("Logo uploaded! Don't forget to save changes.");
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    toast.success("Logo removed! Don't forget to save changes.");
  };

  const handleSaveCompany = async () => {
    setSaving(true);

    // Save to localStorage
    const data = getData();
    data.companySettings = {
      name: companyName,
      logo: companyLogo,
    };
    setData(data);

    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);

    // Dispatch custom event to notify Layout component
    window.dispatchEvent(new Event('companySettingsUpdated'));

    toast.success("Company settings saved!");
  };

  const handlePermissionToggle = (pageName, role) => {
    const currentPermissions = pagePermissions[pageName] || [];
    let newPermissions;

    if (currentPermissions.includes(role)) {
      newPermissions = currentPermissions.filter(r => r !== role);
    } else {
      newPermissions = [...currentPermissions, role];
    }

    try {
      base44.auth.updatePagePermissions(pageName, newPermissions);
      setPagePermissions({
        ...pagePermissions,
        [pageName]: newPermissions,
      });
      toast.success(`Updated access for ${pageName}`);
    } catch (error) {
      toast.error(error.message || "Failed to update permissions");
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const handleApproveLeave = async (request) => {
    await base44.entities.LeaveRequest.update(request.id, {
      status: 'approved',
      reviewed_by: currentUser?.email,
      reviewed_date: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    toast.success(`Approved leave for ${request.requester_name}`);
  };

  const handleRejectLeave = async (request) => {
    await base44.entities.LeaveRequest.update(request.id, {
      status: 'rejected',
      reviewed_by: currentUser?.email,
      reviewed_date: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    toast.success(`Rejected leave for ${request.requester_name}`);
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error("Please fill in all fields");
      return;
    }

    await base44.entities.Holiday.create({
      ...newHoliday,
      created_by: currentUser?.email,
    });
    queryClient.invalidateQueries({ queryKey: ["holidays"] });
    setNewHoliday({ name: '', date: '', type: 'public' });
    setShowHolidayForm(false);
    toast.success("Holiday added successfully");
  };

  const handleDeleteHoliday = async (id) => {
    await base44.entities.Holiday.delete(id);
    queryClient.invalidateQueries({ queryKey: ["holidays"] });
    toast.success("Holiday deleted");
  };

  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage integrations and company settings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-3'} max-w-6xl`}>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            {isAdmin && <TabsTrigger value="access">Access Control</TabsTrigger>}
            {isAdmin && <TabsTrigger value="leave">Leave Approvals {pendingLeaves.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-purple-600 text-white">{pendingLeaves.length}</span>}</TabsTrigger>}
            {isAdmin && <TabsTrigger value="holidays">Holidays</TabsTrigger>}
            {isAdmin && <TabsTrigger value="timelogs">Time Logs</TabsTrigger>}
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Gmail Integration
                </CardTitle>
                <CardDescription>
                  Connect your Gmail to automatically track important emails and convert them to decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {integrations.gmail.connected ? (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-zinc-900">Connected</p>
                        <p className="text-sm text-zinc-500">{integrations.gmail.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect('gmail')}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleConnect('Gmail')} className="w-full sm:w-auto">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Google Calendar Integration
                </CardTitle>
                <CardDescription>
                  Sync your calendar to see upcoming meetings and deadlines in your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                {integrations.calendar.connected ? (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-zinc-900">Connected</p>
                        <p className="text-sm text-zinc-500">{integrations.calendar.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect('calendar')}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleConnect('Google Calendar')} className="w-full sm:w-auto">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Calendar
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Slack Integration
                </CardTitle>
                <CardDescription>
                  Connect Slack to track important conversations and convert them to decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {integrations.slack.connected ? (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-zinc-900">Connected</p>
                        <p className="text-sm text-zinc-500">{integrations.slack.workspace}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect('slack')}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleConnect('Slack')} className="w-full sm:w-auto">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Slack
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Enable Backend Functions</CardTitle>
                <CardDescription className="text-blue-700">
                  To connect real integrations, enable Backend Functions in Dashboard → Settings
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Customize your company's profile and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt="Company logo"
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        Upload Logo
                      </Button>
                      {companyLogo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Recommended: Square image, at least 256x256px, max 2MB</p>
                </div>

                <Button onClick={handleSaveCompany} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">Dark Mode</p>
                    <p className="text-sm text-zinc-500">Enable dark theme for the interface</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">Compact View</p>
                    <p className="text-sm text-zinc-500">Show more content with reduced spacing</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Invite team members and manage access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="colleague@company.com" className="flex-1" />
                  <Button>Invite</Button>
                </div>
                <p className="text-sm text-zinc-500">
                  Team members can be invited from the People page. Only admins can invite other admins.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Page Access Control
                  </CardTitle>
                  <CardDescription>
                    Configure which user roles can access each page. Admins always have full access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {pages.map((page) => (
                      <div key={page} className="border-b border-zinc-200 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-4">
                          <Lock className="w-4 h-4 text-zinc-500" />
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pl-6">
                          {roles.map((role) => (
                            <div key={role} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${page}-${role}`}
                                checked={(pagePermissions[page] || []).includes(role)}
                                onCheckedChange={() => handlePermissionToggle(page, role)}
                                disabled={role === 'admin'}
                              />
                              <label
                                htmlFor={`${page}-${role}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize ${
                                  role === 'admin' ? 'text-zinc-500' : 'cursor-pointer'
                                }`}
                              >
                                {role}
                                {role === 'admin' && (
                                  <span className="text-xs ml-1 text-zinc-400">(always)</span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-amber-900 dark:text-amber-100 text-base">
                    Access Control Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-2 list-disc list-inside">
                    <li>Admins always have access to all pages</li>
                    <li>Changes take effect immediately for all users</li>
                    <li>Users without access will see an "Access Denied" message</li>
                    <li>Default roles: Admin (full access), Manager (most pages), Member (core features), Guest (limited)</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Leave Approvals Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="leave" className="space-y-4">
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Leave Requests Pending Approval
                  </CardTitle>
                  <CardDescription>
                    Review and approve or reject team member leave requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingLeaves.length === 0 ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
                      No pending leave requests
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingLeaves.map(request => (
                        <div key={request.id} className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                  {request.requester_name}
                                </p>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                  Pending
                                </span>
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                                {format(parseISO(request.start_date), 'MMM d, yyyy')} - {format(parseISO(request.end_date), 'MMM d, yyyy')}
                              </p>
                              {request.reason && (
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                  <span className="font-medium">Reason:</span> {request.reason}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                onClick={() => handleApproveLeave(request)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => handleRejectLeave(request)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Decisions */}
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50">
                <CardHeader>
                  <CardTitle>Recent Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaveRequests
                      .filter(r => r.status !== 'pending')
                      .slice(0, 5)
                      .map(request => (
                        <div key={request.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                                {request.requester_name}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {format(parseISO(request.start_date), 'MMM d')} - {format(parseISO(request.end_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Holidays Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="holidays" className="space-y-4">
              <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Manage Holidays
                  </CardTitle>
                  <CardDescription>
                    Add and manage public holidays and company events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Add Holiday Form */}
                  {showHolidayForm ? (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800/50">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="holiday-name">Holiday Name</Label>
                          <Input
                            id="holiday-name"
                            placeholder="e.g., Labor Day"
                            value={newHoliday.name}
                            onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                            className="bg-white/50 dark:bg-zinc-800/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="holiday-date">Date</Label>
                          <Input
                            id="holiday-date"
                            type="date"
                            value={newHoliday.date}
                            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            className="bg-white/50 dark:bg-zinc-800/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="holiday-type"
                                value="public"
                                checked={newHoliday.type === 'public'}
                                onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                                className="text-purple-600"
                              />
                              <span className="text-sm">Public Holiday</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="holiday-type"
                                value="company"
                                checked={newHoliday.type === 'company'}
                                onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                                className="text-purple-600"
                              />
                              <span className="text-sm">Company Event</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddHoliday} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Holiday
                          </Button>
                          <Button variant="outline" onClick={() => setShowHolidayForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowHolidayForm(true)}
                      className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Holiday
                    </Button>
                  )}

                  {/* Holidays List */}
                  <div className="space-y-3">
                    {holidays.length === 0 ? (
                      <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
                        No holidays added yet
                      </p>
                    ) : (
                      holidays.map(holiday => (
                        <div key={holiday.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {holiday.name}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                holiday.type === 'public'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              }`}>
                                {holiday.type === 'public' ? 'Public' : 'Company'}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {format(parseISO(holiday.date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteHoliday(holiday.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Time Logs Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="timelogs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Employee Time Logs
                  </CardTitle>
                  <CardDescription>
                    View time tracking logs for all non-manager employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {timeEntries.length === 0 ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
                      No time entries logged yet
                    </p>
                  ) : (() => {
                    // Aggregate time entries by user
                    const userTotals = timeEntries.reduce((acc, entry) => {
                      const email = entry.user_email;
                      if (!acc[email]) {
                        acc[email] = {
                          user_name: entry.user_name,
                          user_email: email,
                          total_duration: 0,
                          session_count: 0,
                        };
                      }
                      acc[email].total_duration += entry.duration;
                      acc[email].session_count += 1;
                      return acc;
                    }, {});

                    const aggregatedData = Object.values(userTotals);

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Employee
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Total Sessions
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Total Time
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                Average Session
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {aggregatedData.map(userData => {
                              const totalHours = Math.floor(userData.total_duration / (1000 * 60 * 60));
                              const totalMinutes = Math.floor((userData.total_duration % (1000 * 60 * 60)) / (1000 * 60));
                              const avgDuration = userData.total_duration / userData.session_count;
                              const avgHours = Math.floor(avgDuration / (1000 * 60 * 60));
                              const avgMinutes = Math.floor((avgDuration % (1000 * 60 * 60)) / (1000 * 60));

                              return (
                                <tr key={userData.user_email} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                  <td className="py-3 px-4 text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                                    {userData.user_name}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    {userData.session_count} {userData.session_count === 1 ? 'session' : 'sessions'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300">
                                      {totalHours}h {totalMinutes}m
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    {avgHours}h {avgMinutes}m
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}