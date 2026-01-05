import { cn } from "@/lib/utils";
import { Mail, Calendar, Shield } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function TeamMemberCard({ user, onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-5 hover:border-zinc-200 dark:hover:border-zinc-600 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <Avatar name={user.full_name} email={user.email} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user.full_name || "Team Member"}
            </h3>
            {user.role === "admin" && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDistanceToNow(new Date(user.created_date), { addSuffix: true })}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="shrink-0">
          <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        </Button>
      </div>
    </div>
  );
}