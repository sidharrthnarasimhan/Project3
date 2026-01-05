import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BookOpen, Edit, Save, X, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpaceEditor from "@/components/spaces/SpaceEditor";
import SpaceView from "@/components/spaces/SpaceView";
import { format } from "date-fns";

export default function SpaceDetail() {
  const { spaceId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: space, isLoading, refetch } = useQuery({
    queryKey: ["space", spaceId],
    queryFn: () => base44.entities.Space.get(spaceId),
    enabled: !!spaceId,
  });

  // Check if user has access
  const hasAccess = () => {
    if (!space || !currentUser) return false;
    if (space.owner === currentUser.email) return true;
    if (space.is_public) return true;
    if (space.allowed_users?.includes(currentUser.email)) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  };

  const canEdit = () => {
    if (!space || !currentUser) return false;
    if (space.owner === currentUser.email) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  };

  const handleEdit = () => {
    setEditedContent(space.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Space.update(spaceId, {
        content: editedContent,
        updated_date: new Date().toISOString(),
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Failed to save space:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!space || !hasAccess()) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 flex items-center justify-center p-8">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Access Denied
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            You don't have permission to view this space.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {space.title}
                  </h1>
                  {space.is_public ? (
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" title="Public" />
                  ) : (
                    <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" title="Private" />
                  )}
                </div>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {space.description}
                </p>
              </div>
            </div>

            {canEdit() && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-500">
            <span>Created by {space.owner_name}</span>
            <span>•</span>
            <span>Last updated {format(new Date(space.updated_date), 'MMMM d, yyyy')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8">
          {isEditing ? (
            <SpaceEditor
              initialContent={editedContent}
              onChange={setEditedContent}
            />
          ) : (
            <SpaceView content={space.content} />
          )}
        </div>
      </div>
    </div>
  );
}
