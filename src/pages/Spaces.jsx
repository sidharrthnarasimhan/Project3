import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, Lock, Globe, ExternalLink, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SpaceEditor from "@/components/spaces/SpaceEditor";
import { format } from "date-fns";

export default function Spaces() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [newSpace, setNewSpace] = useState({
    title: "",
    description: "",
    content: "",
    is_public: false,
    allowed_users: [],
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: spaces = [], isLoading, refetch } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => base44.entities.Space.list("-updated_date"),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  // Filter spaces based on access control
  const accessibleSpaces = spaces.filter(space => {
    // Owner can always see
    if (space.owner === currentUser?.email) return true;
    // Public spaces visible to all
    if (space.is_public) return true;
    // Check if user is in allowed list
    if (space.allowed_users?.includes(currentUser?.email)) return true;
    // Admins can see all
    if (currentUser?.role === 'admin') return true;
    return false;
  });

  const handleCreateSpace = async () => {
    try {
      await base44.entities.Space.create({
        ...newSpace,
        owner: currentUser.email,
        owner_name: currentUser.full_name,
        updated_date: new Date().toISOString(),
      });
      setIsCreateDialogOpen(false);
      setNewSpace({
        title: "",
        description: "",
        content: "",
        is_public: false,
        allowed_users: [],
      });
      refetch();
    } catch (error) {
      console.error("Failed to create space:", error);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (confirm("Are you sure you want to delete this space?")) {
      try {
        await base44.entities.Space.delete(spaceId);
        refetch();
      } catch (error) {
        console.error("Failed to delete space:", error);
      }
    }
  };

  const handleUpdateAccess = async () => {
    if (!selectedSpace) return;

    try {
      await base44.entities.Space.update(selectedSpace.id, {
        allowed_users: selectedSpace.allowed_users,
        is_public: selectedSpace.is_public,
        updated_date: new Date().toISOString(),
      });
      setIsAccessDialogOpen(false);
      setSelectedSpace(null);
      refetch();
    } catch (error) {
      console.error("Failed to update access:", error);
    }
  };

  const openSpaceInNewTab = (spaceId) => {
    window.open(`/space/${spaceId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Spaces
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Documentation and knowledge base
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Space
          </Button>
        </div>

        {/* Spaces Grid */}
        {accessibleSpaces.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">
              No spaces available. Create your first space to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleSpaces.map(space => {
              const isOwner = space.owner === currentUser?.email;
              const isAdmin = currentUser?.role === 'admin';
              const canManage = isOwner || isAdmin;

              return (
                <div
                  key={space.id}
                  className="group bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-500 dark:hover:border-purple-500"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {space.is_public ? (
                        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {space.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                    {space.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 mb-4">
                    <span>By {space.owner_name}</span>
                    <span>•</span>
                    <span>Updated {format(new Date(space.updated_date), 'MMM d')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => openSpaceInNewTab(space.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </Button>

                    {canManage && (
                      <>
                        <Button
                          onClick={() => {
                            setSelectedSpace(space);
                            setIsAccessDialogOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteSpace(space.id)}
                          variant="outline"
                          size="sm"
                          className="text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Space Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newSpace.title}
                onChange={(e) => setNewSpace({ ...newSpace, title: e.target.value })}
                placeholder="e.g., Engineering Wiki"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newSpace.description}
                onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                placeholder="Brief description of this space"
              />
            </div>
            <div>
              <Label>Content</Label>
              <SpaceEditor
                initialContent={newSpace.content}
                onChange={(html) => setNewSpace({ ...newSpace, content: html })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={newSpace.is_public}
                onChange={(e) => setNewSpace({ ...newSpace, is_public: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_public">Make this space public (visible to everyone)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSpace} disabled={!newSpace.title}>
                Create Space
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Control Dialog */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Access - {selectedSpace?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_public"
                checked={selectedSpace?.is_public || false}
                onChange={(e) => setSelectedSpace({ ...selectedSpace, is_public: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit_is_public">Public (visible to everyone)</Label>
            </div>

            {!selectedSpace?.is_public && (
              <div>
                <Label>Allowed Users</Label>
                <div className="space-y-2 mt-2">
                  {users.map(user => {
                    const isAllowed = selectedSpace?.allowed_users?.includes(user.email) || false;
                    const isOwner = selectedSpace?.owner === user.email;

                    return (
                      <div key={user.email} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`user-${user.email}`}
                          checked={isAllowed || isOwner}
                          disabled={isOwner}
                          onChange={(e) => {
                            const newAllowedUsers = e.target.checked
                              ? [...(selectedSpace.allowed_users || []), user.email]
                              : (selectedSpace.allowed_users || []).filter(email => email !== user.email);
                            setSelectedSpace({ ...selectedSpace, allowed_users: newAllowedUsers });
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`user-${user.email}`} className="flex-1">
                          {user.full_name} ({user.email}) {isOwner && "(Owner)"}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAccessDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAccess}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
