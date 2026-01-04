import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WidgetCard({ title, icon: Icon, children, action, className }) {
  return (
    <div className={cn(
      "rounded-2xl bg-white border border-zinc-100 overflow-hidden",
      className
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-zinc-50">
              <Icon className="w-4 h-4 text-zinc-500" />
            </div>
          )}
          <h3 className="font-semibold text-zinc-900">{title}</h3>
        </div>
        {action || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}