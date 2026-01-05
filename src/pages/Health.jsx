import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity } from "lucide-react";
import HealthStatus from "@/components/settings/HealthStatus";

export default function Health() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Only show to admins
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Access Denied
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Only administrators can access health monitoring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                System Health
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Monitor service health and performance metrics
              </p>
            </div>
          </div>
        </div>

        {/* Health Status Component */}
        <HealthStatus />
      </div>
    </div>
  );
}
