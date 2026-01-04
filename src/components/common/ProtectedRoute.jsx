import { base44 } from "@/api/base44Client";
import { ShieldAlert, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProtectedRoute({ pageName, children, currentUser }) {
  // Check if user has access to this page
  const hasAccess = base44.auth.hasPageAccess(pageName);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-zinc-600 dark:text-zinc-400 mt-0.5" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                    {pageName} Page
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Your role ({currentUser?.role}) doesn't have access to this page.
                    Please contact an administrator if you need access.
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
