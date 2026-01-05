import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DollarSign, Mail, Calendar, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function BillingCard({ tool, onEdit, onDelete }) {
  const expiryDate = new Date(tool.expiry_date);
  const daysUntilExpiry = differenceInDays(expiryDate, new Date());

  const getStatusConfig = () => {
    if (tool.status === 'expired' || daysUntilExpiry < 0) {
      return {
        badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        label: 'Expired',
        icon: <AlertCircle className="w-3 h-3" />,
      };
    } else if (tool.status === 'expiring_soon' || daysUntilExpiry <= 30) {
      return {
        badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        label: 'Expiring Soon',
        icon: <AlertCircle className="w-3 h-3" />,
      };
    } else {
      return {
        badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        label: 'Active',
        icon: null,
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 p-5 hover:border-zinc-200 dark:hover:border-zinc-600 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              {tool.tool_name}
            </h3>
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
              statusConfig.badge
            )}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{tool.plan} Plan</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit && onEdit(tool)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete && onDelete(tool)}
              className="text-rose-600 dark:text-rose-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="text-zinc-600 dark:text-zinc-400">
            ${tool.cost_per_month}/month
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span className="text-zinc-600 dark:text-zinc-400">
            Expires: {format(expiryDate, 'MMM dd, yyyy')}
            {daysUntilExpiry >= 0 && (
              <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                ({daysUntilExpiry} days)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <a
            href={`mailto:${tool.contact_email}`}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {tool.contact_person}
          </a>
        </div>

        {tool.notes && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-700">
            {tool.notes}
          </p>
        )}
      </div>
    </div>
  );
}
