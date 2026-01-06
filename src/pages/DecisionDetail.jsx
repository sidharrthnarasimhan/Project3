import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Send,
  MoreHorizontal,
  Edit2,
  Trash2,
  Vote,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/common/StatusBadge";
import Avatar from "@/components/common/Avatar";
import DecisionForm from "@/components/decisions/DecisionForm";

const categoryIcons = {
  product: "🎯",
  engineering: "⚙️",
  hiring: "👥",
  finance: "💰",
  strategy: "🧭",
  operations: "📋",
  other: "📌",
};

export default function DecisionDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const decisionId = urlParams.get("id");
  
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [outcome, setOutcome] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: decision, isLoading } = useQuery({
    queryKey: ["decision", decisionId],
    queryFn: async () => {
      const decisions = await base44.entities.Decision.filter({ id: decisionId });
      return decisions[0];
    },
    enabled: !!decisionId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", decisionId],
    queryFn: () => base44.entities.Comment.filter({ entity_id: decisionId }, "-created_at"),
    enabled: !!decisionId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const getUserInfo = (email) => users.find(u => u.email === email);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await base44.entities.Comment.create({
      content: newComment,
      author: currentUser?.email,
      author_name: currentUser?.full_name,
      entity_type: "decision",
      entity_id: decisionId,
    });
    setNewComment("");
    queryClient.invalidateQueries({ queryKey: ["comments", decisionId] });
  };

  const handleVote = async (voteValue) => {
    const currentVotes = decision.votes || [];
    const existingVoteIndex = currentVotes.findIndex(v => v.user === currentUser?.email);
    
    let newVotes;
    if (existingVoteIndex >= 0) {
      newVotes = [...currentVotes];
      newVotes[existingVoteIndex] = {
        user: currentUser?.email,
        vote: voteValue,
        timestamp: new Date().toISOString(),
      };
    } else {
      newVotes = [...currentVotes, {
        user: currentUser?.email,
        vote: voteValue,
        timestamp: new Date().toISOString(),
      }];
    }
    
    await base44.entities.Decision.update(decisionId, { votes: newVotes });
    queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
  };

  const handleStatusChange = async (newStatus) => {
    const updateData = { status: newStatus };
    if (newStatus === "decided") {
      updateData.decided_date = new Date().toISOString().split("T")[0];
      updateData.outcome = outcome || "Decision made";
    }
    await base44.entities.Decision.update(decisionId, updateData);
    queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
  };

  const handleUpdate = async (data) => {
    await base44.entities.Decision.update(decisionId, data);
    queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
    setShowEditForm(false);
  };

  const userVote = decision?.votes?.find(v => v.user === currentUser?.email)?.vote;
  const voteCount = {
    approve: decision?.votes?.filter(v => v.vote === "approve").length || 0,
    reject: decision?.votes?.filter(v => v.vote === "reject").length || 0,
    abstain: decision?.votes?.filter(v => v.vote === "abstain").length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Decision not found</p>
          <Link to={createPageUrl("Decisions")}>
            <Button variant="link">Back to Decisions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link 
          to={createPageUrl("Decisions")}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Decisions
        </Link>

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{categoryIcons[decision.category] || "📌"}</span>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={decision.status} />
                    <StatusBadge status={decision.priority} />
                  </div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{decision.title}</h1>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 mt-4 whitespace-pre-wrap">{decision.description}</p>

            <div className="flex items-center gap-6 mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Avatar name={getUserInfo(decision.owner)?.full_name} email={decision.owner} size="xs" />
                <span>{getUserInfo(decision.owner)?.full_name || decision.owner}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {(() => {
                  try {
                    const dateValue = decision.created_at || decision.created_date;
                    const date = new Date(dateValue);
                    return isNaN(date.getTime()) ? 'recently' : formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return 'recently';
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Voting Section */}
          {(decision.status === "discussion" || decision.status === "voting") && (
            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Cast Your Vote
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={userVote === "approve" ? "default" : "outline"}
                  onClick={() => handleVote("approve")}
                  className={userVote === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve ({voteCount.approve})
                </Button>
                <Button
                  variant={userVote === "reject" ? "default" : "outline"}
                  onClick={() => handleVote("reject")}
                  className={userVote === "reject" ? "bg-rose-600 hover:bg-rose-700" : ""}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject ({voteCount.reject})
                </Button>
                <Button
                  variant={userVote === "abstain" ? "default" : "outline"}
                  onClick={() => handleVote("abstain")}
                  className={userVote === "abstain" ? "bg-zinc-600 hover:bg-zinc-700" : ""}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Abstain ({voteCount.abstain})
                </Button>
              </div>

              {decision.status === "voting" && currentUser?.email === decision.owner && (
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3">Finalize Decision</h4>
                  <Textarea
                    placeholder="Enter the final decision outcome..."
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="mb-3"
                  />
                  <Button onClick={() => handleStatusChange("decided")} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Decided
                  </Button>
                </div>
              )}

              {decision.status === "discussion" && currentUser?.email === decision.owner && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => handleStatusChange("voting")}>
                    Open for Voting
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Outcome */}
          {decision.status === "decided" && decision.outcome && (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/50">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Decision Outcome
              </h3>
              <p className="text-emerald-800 dark:text-emerald-200">{decision.outcome}</p>
              {decision.decided_date && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                  Decided on {format(new Date(decision.decided_date), "MMMM d, yyyy")}
                </p>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Discussion ({comments.length})
            </h3>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <Avatar name={currentUser?.full_name} email={currentUser?.email} size="sm" />
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Add your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar 
                    name={comment.author_name} 
                    email={comment.author} 
                    size="sm" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {comment.author_name || comment.author}
                      </span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {(() => {
                          try {
                            const dateValue = comment.created_at || comment.created_date;
                            const date = new Date(dateValue);
                            return isNaN(date.getTime()) ? 'recently' : formatDistanceToNow(date, { addSuffix: true });
                          } catch {
                            return 'recently';
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-zinc-400 dark:text-zinc-500 py-8">
                  No comments yet. Start the discussion!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <DecisionForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdate}
        initialData={decision}
      />
    </div>
  );
}