import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, FileText, Vote, CheckSquare, Megaphone, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all data
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => base44.entities.Decision.list("-created_date"),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date"),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter results based on search query
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search tasks
    tasks.forEach(task => {
      if (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "task",
          id: task.id,
          title: task.title,
          description: task.description,
          icon: CheckSquare,
          url: createPageUrl("Tasks"),
        });
      }
    });

    // Search decisions
    decisions.forEach(decision => {
      if (
        decision.title?.toLowerCase().includes(query) ||
        decision.description?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "decision",
          id: decision.id,
          title: decision.title,
          description: decision.description,
          icon: Vote,
          url: `/decision/${decision.id}`,
        });
      }
    });

    // Search announcements
    announcements.forEach(announcement => {
      if (
        announcement.title?.toLowerCase().includes(query) ||
        announcement.content?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "announcement",
          id: announcement.id,
          title: announcement.title,
          description: announcement.content,
          icon: Megaphone,
          url: createPageUrl("Announcements"),
        });
      }
    });

    // Search people
    users.forEach(user => {
      if (
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "person",
          id: user.email,
          title: user.full_name,
          description: user.email,
          icon: Users,
          url: createPageUrl("People"),
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  };

  const searchResults = getSearchResults();

  const handleResultClick = (result) => {
    navigate(result.url);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search tasks, decisions, announcements, people..."
          className="w-full pl-10 pr-10 py-2 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl max-h-96 overflow-y-auto z-50">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors text-left"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      result.type === "task" && "bg-emerald-100 dark:bg-emerald-900/30",
                      result.type === "decision" && "bg-blue-100 dark:bg-blue-900/30",
                      result.type === "announcement" && "bg-amber-100 dark:bg-amber-900/30",
                      result.type === "person" && "bg-purple-100 dark:bg-purple-900/30"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        result.type === "task" && "text-emerald-600 dark:text-emerald-400",
                        result.type === "decision" && "text-blue-600 dark:text-blue-400",
                        result.type === "announcement" && "text-amber-600 dark:text-amber-400",
                        result.type === "person" && "text-purple-600 dark:text-purple-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {result.title}
                        </p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0",
                          result.type === "task" && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                          result.type === "decision" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                          result.type === "announcement" && "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                          result.type === "person" && "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        )}>
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No results found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
