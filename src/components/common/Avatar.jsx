import { cn } from "@/lib/utils";

export default function Avatar({ name, email, size = "md", className }) {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() || "?";

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  // Generate consistent color from name/email
  const colorIndex = (name || email || "").charCodeAt(0) % 6;
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-violet-100 text-violet-700",
    "bg-cyan-100 text-cyan-700",
  ];

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-semibold shrink-0",
      sizeClasses[size],
      colors[colorIndex],
      className
    )}>
      {initials}
    </div>
  );
}