import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Building2 } from "lucide-react";

export default function CreateOrganization({ onSuccess }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    setName(value);
    // Create URL-friendly slug
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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
        const userResponse = await fetch('http://localhost:3001/api/users/sync', {
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
      const response = await fetch('http://localhost:3001/api/orgs', {
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
