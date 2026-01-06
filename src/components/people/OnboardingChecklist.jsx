import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronRight, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ONBOARDING_TASKS = [
  {
    id: "complete_profile",
    title: "Complete Your Profile",
    description: "Add your photo, bio, and contact information",
    category: "Getting Started",
    link: "/settings",
    points: 10,
  },
  {
    id: "meet_team",
    title: "Browse Team Directory",
    description: "Get to know your teammates",
    category: "Getting Started",
    link: "/people",
    points: 5,
  },
  {
    id: "first_comment",
    title: "Make Your First Comment",
    description: "Participate in a discussion",
    category: "Engagement",
    link: "/decisions",
    points: 15,
  },
  {
    id: "vote_decision",
    title: "Vote on a Decision",
    description: "Cast your vote on a team decision",
    category: "Engagement",
    link: "/decisions",
    points: 15,
  },
  {
    id: "create_task",
    title: "Create a Task",
    description: "Add your first task to track your work",
    category: "Productivity",
    link: "/tasks",
    points: 10,
  },
  {
    id: "read_announcements",
    title: "Read Announcements",
    description: "Stay informed about company updates",
    category: "Getting Started",
    link: "/announcements",
    points: 5,
  },
  {
    id: "introduce_yourself",
    title: "Introduce Yourself",
    description: "Post an announcement introducing yourself to the team",
    category: "Engagement",
    link: "/announcements",
    points: 20,
  },
  {
    id: "configure_notifications",
    title: "Set Up Notifications",
    description: "Configure your notification preferences",
    category: "Getting Started",
    link: "/settings",
    points: 5,
  },
];

export default function OnboardingChecklist({ currentUser, compact = false }) {
  const [checklist, setChecklist] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem(`onboarding_${currentUser?.email}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return ONBOARDING_TASKS.map(task => ({ ...task, completed: false }));
  });

  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    // Save to localStorage whenever checklist changes
    if (currentUser?.email) {
      localStorage.setItem(`onboarding_${currentUser.email}`, JSON.stringify(checklist));
    }
  }, [checklist, currentUser]);

  const toggleTask = (taskId) => {
    setChecklist(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = checklist.filter(t => t.completed).length;
  const totalCount = checklist.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const totalPoints = checklist.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0);
  const maxPoints = ONBOARDING_TASKS.reduce((sum, task) => sum + task.points, 0);

  const isFullyComplete = completedCount === totalCount;

  // Group tasks by category
  const tasksByCategory = checklist.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {});

  if (compact && isFullyComplete) {
    // Don't show if fully complete in compact mode
    return null;
  }

  return (
    <Card className={cn(
      "border-2 transition-all",
      isFullyComplete
        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
        : "border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {isFullyComplete ? (
                <>
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  Onboarding Complete! 🎉
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Welcome Checklist
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isFullyComplete
                ? `Congratulations! You've earned ${totalPoints} points and completed all tasks.`
                : `Complete tasks to get oriented. ${completedCount} of ${totalCount} done • ${totalPoints}/${maxPoints} points`
              }
            </CardDescription>
          </div>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-90"
              )} />
            </Button>
          )}
        </div>
        <Progress value={progressPercent} className="mt-3" />
      </CardHeader>

      {(!compact || isExpanded) && (
        <CardContent className="space-y-6">
          {Object.entries(tasksByCategory).map(([category, tasks]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                {category}
              </h4>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all group",
                      task.completed
                        ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-400 group-hover:text-purple-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            "font-medium text-sm",
                            task.completed
                              ? "text-emerald-900 dark:text-emerald-100 line-through"
                              : "text-zinc-900 dark:text-zinc-100"
                          )}>
                            {task.title}
                          </p>
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                            +{task.points}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {task.description}
                        </p>
                        {task.link && !task.completed && (
                          <a
                            href={task.link}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Go to page →
                          </a>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {isFullyComplete && (
            <div className="text-center p-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Trophy className="w-12 h-12 mx-auto text-emerald-600 mb-2" />
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                You're all set!
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                You've completed your onboarding. Welcome to the team! 🚀
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
