import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Building2, Mail, CheckCircle } from "lucide-react";

export default function CreateOrganization({ onSuccess, currentUser }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch pending invitations on mount
  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const fetchPendingInvitations = async () => {
    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE_URL}/api/invitations/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingInvitations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleAcceptInvitation = async (invitationId, orgName) => {
    setIsLoading(true);
    setError("");

    try {
      const token = await window.Clerk.session.getToken();
      const response = await fetch(`${API_BASE_URL}/api/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to accept invitation');
      }

      const data = await response.json();

      // Set as current org
      localStorage.setItem('current_org_id', data.data.id);

      // Success!
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    setName(value);
    // Create URL-friendly slug with random suffix for uniqueness
    const baseSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    // Add random 4-character suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const autoSlug = baseSlug ? `${baseSlug}-${randomSuffix}` : randomSuffix;
    setSlug(autoSlug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get Clerk token and user info
      const token = await window.Clerk.session.getToken();
      const clerkUser = window.Clerk.user;

      // Step 1: Register/sync user in backend
      try {
        const userResponse = await fetch(`${API_BASE_URL}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            full_name: clerkUser.fullName || clerkUser.firstName || 'User',
            avatar_url: clerkUser.imageUrl,
          })
        });

        if (!userResponse.ok && userResponse.status !== 409) {
          // 409 Conflict means user already exists, which is OK
          const errorData = await userResponse.json();
          throw new Error(errorData.error?.message || 'Failed to create user');
        }
      } catch (userErr) {
        console.warn('User sync error:', userErr);
        // Continue anyway - user might already exist
      }

      // Step 2: Create organization
      const response = await fetch(`${API_BASE_URL}/api/orgs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          slug,
          logo_url: ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create organization');
      }

      const data = await response.json();

      // Set as current organization
      localStorage.setItem('current_org_id', data.data.id);

      // Success!
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err) {
      setError(err.message || "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (loadingInvitations) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Checking for invitations...</p>
        </div>
      </div>
    );
  }

  // Show pending invitations if any exist
  if (pendingInvitations.length > 0 && !showCreateForm) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>

        <div className="w-full max-w-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 mb-6 shadow-2xl shadow-purple-500/50 animate-glow">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              You've Been Invited!
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Accept an invitation to join an organization
            </p>
          </div>

          {/* Invitations List */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {pendingInvitations.map((invitation, index) => (
              <Card
                key={invitation.id}
                className="backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-black/10 dark:shadow-black/30 hover:shadow-purple-500/20 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {invitation.organization_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Mail className="w-4 h-4" />
                        <span>Invited as <span className="font-semibold text-purple-600">{invitation.role}</span></span>
                      </div>
                      {invitation.invited_by_name && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                          Invited by {invitation.invited_by_name}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAcceptInvitation(invitation.id, invitation.organization_name)}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Accepting...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Option to create own organization */}
          <div className="text-center mt-8 space-y-3 animate-in fade-in duration-1000">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Don't see your organization?
            </p>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="border-2 border-zinc-300 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all"
            >
              Create Your Own Organization
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 animate-in fade-in duration-1000">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Startup OS
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show create organization form
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 mb-6 shadow-2xl shadow-purple-500/50 animate-glow">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Create Your Organization
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Let's set up your workspace
          </p>
        </div>

        {/* Back button if came from invitations */}
        {pendingInvitations.length > 0 && showCreateForm && (
          <div className="mb-4 animate-in fade-in duration-500">
            <Button
              variant="ghost"
              onClick={() => setShowCreateForm(false)}
              className="text-purple-600 hover:text-purple-700"
            >
              ← Back to Invitations
            </Button>
          </div>
        )}

        {/* Form Card */}
        <Card className="backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Organization Details</CardTitle>
            <CardDescription className="text-base">
              This will be your company's workspace. You'll be the admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Organization Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Acme Corp"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                  className="h-12 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-700/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This is your company or team name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  URL Slug
                </Label>
                <Input
                  id="slug"
                  type="text"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-700/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Used in URLs, must be unique and lowercase
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Organization →"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3 animate-in fade-in duration-1000">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">
            You can invite team members later from settings
          </p>
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Startup OS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
