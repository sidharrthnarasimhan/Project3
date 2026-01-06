import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Megaphone, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import EmptyState from "@/components/common/EmptyState";

export default function Announcements() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_at"),
  });

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || 
      (typeFilter === "pinned" && a.pinned) ||
      a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Sort: pinned first, then by date
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Handle both created_at (database) and created_date (demo mode)
    const dateA = new Date(a.created_at || a.created_date);
    const dateB = new Date(b.created_at || b.created_date);
    return dateB - dateA;
  });

  const handleCreate = async (data) => {
    await base44.entities.Announcement.create({
      ...data,
      author: currentUser?.email,
      author_name: currentUser?.full_name,
    });
    queryClient.invalidateQueries({ queryKey: ["announcements"] });
    setShowForm(false);
  };

  const handleReact = async (announcement, emoji) => {
    const reactions = announcement.reactions || [];
    const existingIndex = reactions.findIndex(r => r.user === currentUser?.email);
    
    let newReactions;
    if (existingIndex >= 0) {
      if (reactions[existingIndex].emoji === emoji) {
        // Remove reaction
        newReactions = reactions.filter((_, i) => i !== existingIndex);
      } else {
        // Change reaction
        newReactions = [...reactions];
        newReactions[existingIndex] = { emoji, user: currentUser?.email };
      }
    } else {
      // Add reaction
      newReactions = [...reactions, { emoji, user: currentUser?.email }];
    }
    
    await base44.entities.Announcement.update(announcement.id, { reactions: newReactions });
    queryClient.invalidateQueries({ queryKey: ["announcements"] });
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Announcements</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Company updates and team news</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pinned" className="gap-1">
                <Pin className="w-3 h-3" /> Pinned
              </TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {sortedAnnouncements.map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                currentUser={currentUser}
                onReact={(emoji) => handleReact(announcement, emoji)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No announcements found"
            description={searchQuery || typeFilter !== "all" ? "Try adjusting your filters" : "Share your first announcement with the team"}
            action={() => setShowForm(true)}
            actionLabel="Create Announcement"
          />
        )}
      </div>

      <AnnouncementForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}