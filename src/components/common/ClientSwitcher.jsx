import { useState } from 'react';
import { Database, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { isUsingMockClient, useMockClient, useHttpClient } from '@/api/clientSelector';

/**
 * Developer tool to switch between demo and production mode
 * Only shown in development mode
 */
export default function ClientSwitcher() {
  const [open, setOpen] = useState(false);
  const isMock = isUsingMockClient();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const handleSwitch = async (useMock) => {
    if (useMock) {
      useMockClient();
    } else {
      await useHttpClient();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-2 hover:scale-105 transition-transform"
          title="Switch between Demo and Production mode"
        >
          <Database className="w-4 h-4 mr-2" />
          {isMock ? 'Demo Mode' : 'Production Mode'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Mode</DialogTitle>
          <DialogDescription>
            Switch between demo mode (local data) and production mode (real database + auth)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Demo Mode */}
            <button
              onClick={() => handleSwitch(true)}
              className={`group relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                isMock
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isMock ? 'bg-purple-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 text-zinc-900 dark:text-zinc-100">Demo Mode</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">
                    Perfect for exploring
                  </div>
                </div>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <div>• Works instantly in browser</div>
                <div>• Sample data included</div>
                <div>• No setup required</div>
                <div>• Data stored locally</div>
              </div>
              {isMock && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  Currently active
                </div>
              )}
            </button>

            {/* Production Mode */}
            <button
              onClick={() => handleSwitch(false)}
              className={`group relative p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                !isMock
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${!isMock ? 'bg-purple-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1 text-zinc-900 dark:text-zinc-100">Production Mode</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">
                    Full-featured SaaS
                  </div>
                </div>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <div>• Real PostgreSQL database</div>
                <div>• Clerk authentication</div>
                <div>• Multi-tenant orgs</div>
                <div>• Invite team members</div>
              </div>
              {!isMock && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  Currently active
                </div>
              )}
            </button>
          </div>

          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Switching modes will reload the page
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {isMock
                    ? "Production mode requires backend server running on port 3001"
                    : "Demo mode will use sample data from your browser's localStorage"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
