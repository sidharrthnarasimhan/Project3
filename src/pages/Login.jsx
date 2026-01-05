import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { isUsingMockClient } from "@/api/clientSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Eye, EyeOff } from "lucide-react";
import { getData } from "@/api/mockData";
import ClientSwitcher from "@/components/common/ClientSwitcher";
import ClerkLogin from "@/components/common/ClerkLogin";

export default function Login({ onLoginSuccess }) {
  // If using HTTP client, show Clerk login instead
  if (!isUsingMockClient()) {
    return <ClerkLogin />;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [companySettings, setCompanySettings] = useState({ name: 'Startup OS', logo: null });

  // Load company settings on mount
  useEffect(() => {
    try {
      const data = getData();
      if (data.companySettings) {
        setCompanySettings(data.companySettings);
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  }, []);

  const demoUsers = [
    { email: "admin@example.com", password: "admin123", role: "Admin", access: "Full access to all pages" },
    { email: "manager@example.com", password: "manager123", role: "Manager", access: "Access to most pages except restricted areas" },
    { email: "john@example.com", password: "john123", role: "Member", access: "Access to core features" },
    { email: "guest@example.com", password: "guest123", role: "Guest", access: "Limited access to basic pages" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Only use base44.auth.login for mock client
      if (isUsingMockClient() && base44.auth.login) {
        await base44.auth.login(email, password);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError("Please use Clerk authentication when HTTP client is enabled. Switch to Mock Client to use demo accounts.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }}></div>

      {/* Client Switcher - visible on login page */}
      <ClientSwitcher />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          {companySettings.logo ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl animate-glow overflow-hidden">
              <img
                src={companySettings.logo}
                alt={companySettings.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 mb-6 shadow-2xl shadow-purple-500/50 animate-glow">
              <Zap className="w-10 h-10 text-white" />
            </div>
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            {companySettings.name}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            ✨ Your workspace awaits
          </p>
        </div>

        {/* Login Card - Glassmorphism */}
        <Card className="backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-black/10 dark:shadow-black/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">Sign in to continue to your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                  className="h-12 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-700/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 pr-12 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-700/50 focus:border-purple-500 dark:focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In →"
                )}
              </Button>
            </form>

            {/* Demo Users Section */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowDemoUsers(!showDemoUsers)}
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 w-full text-center transition-colors"
              >
                {showDemoUsers ? "✕ Hide" : "👋 Show"} demo accounts
              </button>

              {showDemoUsers && (
                <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-3">
                    🚀 Quick login:
                  </p>
                  {demoUsers.map((user, index) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => quickLogin(user.email, user.password)}
                      className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-zinc-800/50 dark:to-zinc-800/30 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-pink-700 transition-all">
                          {user.role}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                          {user.email.split('@')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {user.access}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3 animate-in fade-in duration-1000">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 backdrop-blur-sm">
            💾 Demo app · All data stored locally
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-zinc-400 dark:text-zinc-500">Powered by</span>
            <span className="inline-flex items-center gap-2 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              Startup OS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
