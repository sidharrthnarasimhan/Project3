import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, Play, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getData, setData } from "@/api/mockData";

export default function TimeTrackerWidget({ currentUser }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Check if there's an active timer for this user
  useEffect(() => {
    if (!currentUser) return;

    const data = getData();
    const activeTimer = data.activeTimers[currentUser.email];

    if (activeTimer) {
      setIsRunning(true);
      setStartTime(new Date(activeTimer.start_time));
      // Calculate elapsed time from stored start time
      const elapsed = Date.now() - new Date(activeTimer.start_time).getTime();
      setElapsedTime(elapsed);
    }
  }, [currentUser]);

  // Update elapsed time every second when running
  useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime.getTime();
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);

    // Save active timer to data
    const data = getData();
    data.activeTimers[currentUser.email] = {
      start_time: now.toISOString(),
    };
    setData(data);
  };

  const handleStop = async () => {
    if (!startTime) return;

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Create time entry
    await base44.entities.TimeEntry.create({
      user_email: currentUser.email,
      user_name: currentUser.full_name,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration,
    });

    // Remove active timer
    const data = getData();
    delete data.activeTimers[currentUser.email];
    setData(data);

    // Reset state
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  // Only show for non-managers (members and guests)
  if (!currentUser || currentUser.role === 'admin' || currentUser.role === 'manager') {
    return null;
  }

  const time = formatTime(elapsedTime);

  return (
    <Card className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Timer className="w-4 h-4 text-white" />
          </div>
          Time Tracker
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Compact Timer Display */}
        <div className="flex items-center justify-center gap-1">
          <div className="flex flex-col items-center px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-2xl font-bold font-mono bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {time.hours}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">hr</span>
          </div>
          <span className="text-lg font-bold text-zinc-400">:</span>
          <div className="flex flex-col items-center px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-2xl font-bold font-mono bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {time.minutes}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">min</span>
          </div>
          <span className="text-lg font-bold text-zinc-400">:</span>
          <div className="flex flex-col items-center px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-2xl font-bold font-mono bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {time.seconds}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">sec</span>
          </div>
        </div>

        {/* Compact Control Button */}
        {isRunning ? (
          <Button
            onClick={handleStop}
            size="sm"
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
          >
            <Square className="w-3 h-3 mr-1.5" />
            Stop
          </Button>
        ) : (
          <Button
            onClick={handleStart}
            size="sm"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Play className="w-3 h-3 mr-1.5" />
            Start
          </Button>
        )}

        {/* Compact Status */}
        {isRunning && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tracking...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
