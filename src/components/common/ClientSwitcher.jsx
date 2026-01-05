import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { isUsingMockClient, useMockClient, useHttpClient } from '@/api/clientSelector';

/**
 * Developer tool to switch between mock and HTTP client
 * Only shown in development mode
 */
export default function ClientSwitcher() {
  const [open, setOpen] = useState(false);
  const isMock = isUsingMockClient();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const handleSwitch = (useMock) => {
    if (useMock) {
      useMockClient();
    } else {
      useHttpClient();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          title="Switch API Client"
        >
          <Settings className="w-4 h-4 mr-2" />
          {isMock ? 'Mock' : 'HTTP'} Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Client Selector</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Choose which API client to use for data operations:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleSwitch(true)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                isMock
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <div className="font-semibold mb-1">Mock Client (localStorage)</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Uses local data stored in browser. No backend required.
              </div>
            </button>

            <button
              onClick={() => handleSwitch(false)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                !isMock
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <div className="font-semibold mb-1">HTTP Client (Real API)</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Connects to backend server. Requires backend running on port 3001.
              </div>
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Current:</strong> {isMock ? 'Mock Client' : 'HTTP Client'}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Switching will reload the page.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
