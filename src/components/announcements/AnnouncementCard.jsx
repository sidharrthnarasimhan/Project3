import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Pin, MessageCircle } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";

const typeConfig = {
  company: { emoji: "📢", label: "Company" },
  team: { emoji: "👥", label: "Team" },
  leadership: { emoji: "🎯", label: "Leadership" },
  celebration: { emoji: "🎉", label: "Celebration" },
  urgent: { emoji: "🚨", label: "Urgent" },
};

export default function AnnouncementCard({ announcement, onReact, currentUser }) {
  const config = typeConfig[announcement.type] || typeConfig.company;
  const reactions = announcement.reactions || [];
  
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const userReaction = reactions.find(r => r.user === currentUser?.email)?.emoji;

  const emojis = ["👍", "❤️", "🎉", "👀", "🚀"];

  return (
    <div className={cn(
      "rounded-xl bg-white dark:bg-zinc-800 border p-5 transition-all duration-200",
      announcement.pinned ? "border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/20" : "border-zinc-100 dark:border-zinc-700 hover:border-zinc-200 dark:hover:border-zinc-600"
    )}>
      <div className="flex items-start gap-4">
        <Avatar name={announcement.author_name} email={announcement.author} size="md" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {announcement.author_name || announcement.author}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                  {config.emoji} {config.label}
                </span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {formatDistanceToNow(new Date(announcement.created_date), { addSuffix: true })}
              </span>
            </div>
            {announcement.pinned && (
              <Pin className="w-4 h-4 text-amber-500 shrink-0" />
            )}
          </div>

          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{announcement.title}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-wrap">{announcement.content}</p>

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => onReact && onReact(emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all",
                  userReaction === emoji
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                )}
              >
                {emoji}
                {reactionCounts[emoji] > 0 && (
                  <span className="text-xs font-medium">{reactionCounts[emoji]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}