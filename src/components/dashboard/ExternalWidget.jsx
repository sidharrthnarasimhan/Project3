import { cn } from "@/lib/utils";
import { ExternalLink, ArrowRight, MessageSquare, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockData = {
  slack: [
    { channel: "#product", message: "New feature spec ready for review", time: "10m ago", unread: true },
    { channel: "#engineering", message: "Deploy scheduled for 3pm", time: "1h ago", unread: false },
    { channel: "#general", message: "Welcome our new team member!", time: "2h ago", unread: false },
  ],
  email: [
    { from: "investor@vc.com", subject: "Follow-up on Series A", time: "30m ago", unread: true },
    { from: "partner@corp.com", subject: "Partnership proposal", time: "2h ago", unread: true },
    { from: "team@stripe.com", subject: "Payment processed", time: "3h ago", unread: false },
  ],
  calendar: [
    { title: "Team Standup", time: "9:00 AM", duration: "15 min", soon: true },
    { title: "Product Review", time: "11:00 AM", duration: "1 hr", soon: false },
    { title: "1:1 with Sarah", time: "2:00 PM", duration: "30 min", soon: false },
  ],
};

export default function ExternalWidget({ type, onConvert }) {
  const config = {
    slack: { 
      title: "Slack", 
      icon: MessageSquare, 
      color: "bg-purple-50 text-purple-600",
      data: mockData.slack 
    },
    email: { 
      title: "Email", 
      icon: Mail, 
      color: "bg-blue-50 text-blue-600",
      data: mockData.email 
    },
    calendar: { 
      title: "Calendar", 
      icon: Calendar, 
      color: "bg-emerald-50 text-emerald-600",
      data: mockData.calendar 
    },
  };

  const { title, icon: Icon, color, data } = config[type];

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-zinc-500 gap-1">
          Open <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
      <div className="divide-y divide-zinc-50 dark:divide-zinc-700">
        {data.map((item, i) => (
          <div key={i} className="px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {type === "slack" && (
                  <>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{item.channel}</p>
                    <p className={cn("text-sm truncate", item.unread ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400")}>
                      {item.message}
                    </p>
                  </>
                )}
                {type === "email" && (
                  <>
                    <p className={cn("text-sm truncate", item.unread ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400")}>
                      {item.subject}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.from}</p>
                  </>
                )}
                {type === "calendar" && (
                  <>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.time} · {item.duration}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{item.time}</span>
                {(item.unread || item.soon) && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
              onClick={() => onConvert && onConvert(item)}
            >
              Convert to decision <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}